import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { query, withTransaction } from '@/lib/db';
import { z } from 'zod';
import { getLevel, getXPForLevel } from '@/utils/formatters';
import { calculateStreak } from '@/utils/streakCalculator';

interface DbLearningSessionRow {
  id: string;
  subject_id: string;
  user_id: string;
  date: string;
  duration: number;
  planned_duration: number | null;
  session_extended: boolean;
  completed: boolean;
  points: number;
  notes: string | null;
  manual_adjustment_reason: string | null;
  time_adjustments_log: unknown;
  created_at: Date;
  subject_name: string;
  subject_color: string;
}

interface CountRow {
  total: string;
}

// Learning Session validation schema
const timeAdjustmentSchema = z.object({
  timestamp: z.number(),
  previousDuration: z.number(),
  newDuration: z.number(),
  elapsedAtAdjustment: z.number(),
  reason: z.string(),
  adjustmentType: z.string()
});

const createSessionSchema = z.object({
  subjectId: z.string().uuid('Subject ID must be a valid UUID'),
  userId: z.string().uuid('User ID must be a valid UUID').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours'),
  plannedDuration: z.number().min(1).max(1440).optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  notes: z.string().optional(),
  completed: z.boolean().default(true),
  manualAdjustmentReason: z.string().optional(),
  timeAdjustments: z.array(timeAdjustmentSchema).optional()
});

const querySessionsSchema = z.object({
  userId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

type CreateSessionData = z.infer<typeof createSessionSchema>;
type QuerySessionsParams = z.infer<typeof querySessionsSchema>;

async function getLearningSessions(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const authSession = await getServerSession(req, res, authOptions);
    if (!authSession) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = authSession.sub;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in session' });
    }

    const params = querySessionsSchema.parse(req.query);

    let whereConditions = ['ls.user_id = $1'];
    let queryParams: Array<string | number> = [userId];
    let paramIndex = 2;

    if (params.subjectId) {
      whereConditions.push(`ls.subject_id = $${paramIndex}`);
      queryParams.push(params.subjectId);
      paramIndex++;
    }

    if (params.startDate) {
      whereConditions.push(`ls.date >= $${paramIndex}`);
      queryParams.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      whereConditions.push(`ls.date <= $${paramIndex}`);
      queryParams.push(params.endDate);
      paramIndex++;
    }

    queryParams.push(params.limit, params.offset);

    const filters = whereConditions.join(' AND ');

    const sessionsQuery = `
      SELECT
        ls.id,
        ls.subject_id,
        ls.user_id,
        ls.date,
        ls.actual_duration as duration,
        ls.planned_duration,
        ls.session_extended,
        ls.completed,
        ls.points,
        ls.notes,
        ls.manual_adjustment_reason,
        ls.time_adjustments_log,
        ls.created_at,
        s.name as subject_name,
        s.color as subject_color
      FROM learning_sessions ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ${filters}
      ORDER BY ls.date DESC, ls.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM learning_sessions ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ${filters}
    `;

    const countParams = queryParams.slice(0, queryParams.length - 2);

    const [sessionsResult, countResult] = await Promise.all([
      query<DbLearningSessionRow>(sessionsQuery, queryParams),
      query<CountRow>(countQuery, countParams)
    ]);

    const sessions = sessionsResult.rows.map(row => ({
      id: row.id,
      subjectId: row.subject_id,
      userId: row.user_id,
      date: row.date,
      duration: row.duration, // actual duration
      plannedDuration: row.planned_duration,
      completed: row.completed,
      points: row.points,
      notes: row.notes,
      manualAdjustmentReason: row.manual_adjustment_reason,
      timeAdjustmentsLog: row.time_adjustments_log,
      createdAt: row.created_at.toISOString(),
      subject: {
        name: row.subject_name,
        color: row.subject_color
      }
    }));

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    return res.status(200).json({
      sessions,
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < total
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.issues
      });
    }

    console.error('Get learning sessions error:', error);
    return res.status(500).json({
      error: 'Failed to fetch learning sessions'
    });
  }
}

async function createLearningSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const authSession = await getServerSession(req, res, authOptions);
    if (!authSession) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = authSession.sub;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in session' });
    }

    const sessionData: CreateSessionData = {
      ...createSessionSchema.parse(req.body),
      userId
    };

    // Verify subject exists and belongs to user
    const subjectCheck = await query(
      'SELECT id FROM subjects WHERE id = $1 AND user_id = $2',
      [sessionData.subjectId, sessionData.userId]
    );

    if (subjectCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Subject not found or does not belong to user'
      });
    }

    // Calculate XP points based on duration and completion
    // Points algorithm with minimum XP floor for completed sessions
    const basePoints = Math.floor(sessionData.duration / 15) * 10; // 10 points per 15 minutes
    const completionBonus = sessionData.completed ? Math.floor(basePoints * 0.2) : 0;
    let totalPoints = basePoints + completionBonus;
    if (sessionData.completed && sessionData.duration > 0) {
      totalPoints = Math.max(5, totalPoints); // Minimum 5 XP for a completed session
    }

    const result = await withTransaction(async (client) => {
      // Create learning session with audit logging support
      const sessionResult = await client.query(`
        INSERT INTO learning_sessions (
          subject_id, user_id, date, actual_duration, planned_duration, completed, points, notes,
          manual_adjustment_reason, time_adjustments_log
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        sessionData.subjectId,
        sessionData.userId,
        sessionData.date,
        sessionData.duration, // actual duration
        sessionData.plannedDuration || sessionData.duration, // planned duration
        sessionData.completed,
        totalPoints,
        sessionData.notes || null,
        sessionData.manualAdjustmentReason || null,
        JSON.stringify(sessionData.timeAdjustments || [])
      ]);

      // Update subject completed hours (convert minutes to hours, ensuring integer-safe calculation)
      const hoursToAdd = Math.round(sessionData.duration / 60 * 100) / 100; // Calculate hours and ensure max 2 decimal places
      await client.query(`
        UPDATE subjects 
        SET completed_hours = completed_hours + $1::numeric
        WHERE id = $2
      `, [hoursToAdd, sessionData.subjectId]);

      // Add XP to user if session is completed
      if (sessionData.completed) {
        // Get current user XP to calculate new level
        const userXPResult = await client.query(`
          SELECT current_xp FROM users WHERE id = $1
        `, [sessionData.userId]);

        const currentXP = userXPResult.rows[0]?.current_xp || 0;
        const newXP = currentXP + totalPoints;
        const newLevel = getLevel(newXP);
        const newNextLevelXP = getXPForLevel(newLevel + 1);

        const userHoursToAdd = Math.round(sessionData.duration / 60);
        await client.query(`
          UPDATE users
          SET current_xp = $1,
              current_level = $2,
              next_level_xp = $3,
              daily_learning_time = daily_learning_time + $4,
              weekly_learning_time = weekly_learning_time + $4,
              total_hours = total_hours + $5,
              completed_tasks = completed_tasks + 1,
              total_completed_tasks = total_completed_tasks + 1
          WHERE id = $6
        `, [newXP, newLevel, newNextLevelXP, sessionData.duration, userHoursToAdd, sessionData.userId]);

        // Record gamification event
        await client.query(`
          INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
          VALUES ($1, 'session_complete', $2, $3)
        `, [
          sessionData.userId,
          JSON.stringify({
            sessionId: sessionResult.rows[0].id,
            subjectId: sessionData.subjectId,
            duration: sessionData.duration
          }),
          totalPoints
        ]);

        // Calculate and update learning streak
        const allSessionsResult = await client.query(`
          SELECT date, completed
          FROM learning_sessions
          WHERE user_id = $1
          ORDER BY date DESC
        `, [sessionData.userId]);

        const newStreak = calculateStreak(allSessionsResult.rows);

        await client.query(`
          UPDATE users
          SET learning_streak = $1
          WHERE id = $2
        `, [newStreak, sessionData.userId]);

        // Sync to calendar_sessions so completed sessions appear in calendar and statistics
        // Get subject name for calendar entry title
        const subjectResult = await client.query(`
          SELECT name FROM subjects WHERE id = $1
        `, [sessionData.subjectId]);

        const subjectName = subjectResult.rows[0]?.name || 'Learning Session';

        // Calculate start and end times for calendar entry
        // Use the session date at current time, then add duration
        const sessionDate = new Date(sessionData.date);
        const now = new Date();
        const startTime = new Date(sessionDate);
        startTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + sessionData.duration);

        // Insert into calendar_sessions
        await client.query(`
          INSERT INTO calendar_sessions (
            subject_id, user_id, title, start_time, end_time,
            planned_duration, actual_duration, session_type, completed,
            is_auto_generated, xp_awarded
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          sessionData.subjectId,
          sessionData.userId,
          subjectName,
          startTime.toISOString(),
          endTime.toISOString(),
          sessionData.plannedDuration || sessionData.duration,
          sessionData.duration,
          'study',
          true, // completed
          false, // not auto-generated (user tracked it)
          totalPoints
        ]);
      }

      return sessionResult.rows[0];
    });

    const learningSession = {
      id: result.id,
      subjectId: result.subject_id,
      userId: result.user_id,
      date: result.date,
      duration: result.actual_duration,
      completed: result.completed,
      points: result.points,
      notes: result.notes,
      createdAt: result.created_at.toISOString()
    };

    return res.status(201).json({ session: learningSession });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid session data',
        details: error.issues
      });
    }

    console.error('Create learning session error:', error);
    return res.status(500).json({
      error: 'Failed to create learning session'
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getLearningSessions(req, res);
      case 'POST':
        return await createLearningSession(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          error: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Sessions API error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
