import { NextApiRequest, NextApiResponse } from 'next';
import { query, withTransaction } from '@/lib/db';
import { z } from 'zod';

// Learning Session validation schema
const createSessionSchema = z.object({
  subjectId: z.string().uuid('Subject ID must be a valid UUID'),
  userId: z.string().uuid('User ID must be a valid UUID').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').max(1440, 'Duration cannot exceed 24 hours'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  notes: z.string().optional(),
  completed: z.boolean().default(true)
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
    const params = querySessionsSchema.parse(req.query);
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';
    const userId = params.userId || defaultUserId;

    let whereConditions = ['ls.user_id = $1'];
    let queryParams: any[] = [userId];
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

    const sessionsQuery = `
      SELECT 
        ls.id,
        ls.subject_id,
        ls.user_id,
        ls.date,
        ls.duration,
        ls.completed,
        ls.points,
        ls.notes,
        ls.created_at,
        s.name as subject_name,
        s.color as subject_color
      FROM learning_sessions ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ls.date DESC, ls.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM learning_sessions ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ${whereConditions.slice(0, -2).join(' AND ') || 'ls.user_id = $1'}
    `;

    const [sessionsResult, countResult] = await Promise.all([
      query(sessionsQuery, queryParams),
      query(countQuery, queryParams.slice(0, -2))
    ]);

    const sessions = sessionsResult.rows.map(row => ({
      id: row.id,
      subjectId: row.subject_id,
      userId: row.user_id,
      date: row.date,
      duration: row.duration,
      completed: row.completed,
      points: row.points,
      notes: row.notes,
      createdAt: row.created_at.toISOString(),
      subject: {
        name: row.subject_name,
        color: row.subject_color
      }
    }));

    const total = parseInt(countResult.rows[0].total);

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
        details: error.errors
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
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';
    const sessionData: CreateSessionData = {
      ...createSessionSchema.parse(req.body),
      userId: req.body.userId || defaultUserId
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
    const basePoints = Math.floor(sessionData.duration / 15) * 10; // 10 points per 15 minutes
    const completionBonus = sessionData.completed ? Math.floor(basePoints * 0.2) : 0;
    const totalPoints = basePoints + completionBonus;

    const result = await withTransaction(async (client) => {
      // Create learning session
      const sessionResult = await client.query(`
        INSERT INTO learning_sessions (
          subject_id, user_id, date, duration, completed, points, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        sessionData.subjectId,
        sessionData.userId,
        sessionData.date,
        sessionData.duration,
        sessionData.completed,
        totalPoints,
        sessionData.notes || null
      ]);

      // Update subject completed hours
      await client.query(`
        UPDATE subjects 
        SET completed_hours = completed_hours + $1
        WHERE id = $2
      `, [sessionData.duration / 60, sessionData.subjectId]);

      // Add XP to user if session is completed
      if (sessionData.completed) {
        await client.query(`
          UPDATE users 
          SET current_xp = current_xp + $1,
              daily_learning_time = daily_learning_time + $2,
              weekly_learning_time = weekly_learning_time + $2,
              total_hours = total_hours + $3,
              completed_tasks = completed_tasks + 1,
              total_completed_tasks = total_completed_tasks + 1
          WHERE id = $4
        `, [totalPoints, sessionData.duration, sessionData.duration / 60, sessionData.userId]);

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
      }

      return sessionResult.rows[0];
    });

    const session = {
      id: result.id,
      subjectId: result.subject_id,
      userId: result.user_id,
      date: result.date,
      duration: result.duration,
      completed: result.completed,
      points: result.points,
      notes: result.notes,
      createdAt: result.created_at.toISOString()
    };

    return res.status(201).json({ session });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid session data',
        details: error.errors
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