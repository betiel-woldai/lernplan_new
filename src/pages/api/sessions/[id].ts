import { NextApiRequest, NextApiResponse } from 'next';
import { query, withTransaction } from '@/lib/db';
import { z } from 'zod';

// Session update validation schema
const updateSessionSchema = z.object({
  duration: z.number().min(1).max(1440).optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
  points: z.number().min(0).optional()
});

type UpdateSessionData = z.infer<typeof updateSessionSchema>;

async function getLearningSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';
    const userId = (req.query.userId as string) || defaultUserId;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Session ID is required'
      });
    }

    const result = await query(`
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
      WHERE ls.id = $1 AND ls.user_id = $2
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Learning session not found'
      });
    }

    const row = result.rows[0];
    const session = {
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
    };

    return res.status(200).json({ session });

  } catch (error) {
    console.error('Get learning session error:', error);
    return res.status(500).json({
      error: 'Failed to fetch learning session'
    });
  }
}

async function updateLearningSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';
    const userId = (req.query.userId as string) || defaultUserId;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Session ID is required'
      });
    }

    const updateData = updateSessionSchema.parse(req.body);

    // Get current session data
    const currentSession = await query(`
      SELECT ls.*, s.id as subject_exists
      FROM learning_sessions ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ls.id = $1 AND ls.user_id = $2
    `, [id, userId]);

    if (currentSession.rows.length === 0) {
      return res.status(404).json({
        error: 'Learning session not found'
      });
    }

    const current = currentSession.rows[0];

    // Calculate changes for user stats update
    const durationChange = (updateData.duration || current.duration) - current.duration;
    const wasCompleted = current.completed;
    const nowCompleted = updateData.completed !== undefined ? updateData.completed : current.completed;
    const completionStatusChanged = wasCompleted !== nowCompleted;

    const result = await withTransaction(async (client) => {
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (updateData.duration !== undefined) {
        updateFields.push(`duration = $${paramIndex}`);
        updateValues.push(updateData.duration);
        paramIndex++;
      }

      if (updateData.completed !== undefined) {
        updateFields.push(`completed = $${paramIndex}`);
        updateValues.push(updateData.completed);
        paramIndex++;
      }

      if (updateData.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex}`);
        updateValues.push(updateData.notes);
        paramIndex++;
      }

      if (updateData.points !== undefined) {
        updateFields.push(`points = $${paramIndex}`);
        updateValues.push(updateData.points);
        paramIndex++;
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateValues.push(id, userId);

      // Update learning session
      const sessionResult = await client.query(`
        UPDATE learning_sessions 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
        RETURNING *
      `, updateValues);

      // Update subject completed hours if duration changed (convert to decimal hours)
      if (durationChange !== 0) {
        const hoursChange = Math.round((durationChange / 60) * 100) / 100; // Round to 2 decimal places
        await client.query(`
          UPDATE subjects 
          SET completed_hours = completed_hours + $1
          WHERE id = $2
        `, [hoursChange, current.subject_id]);
      }

      // Update user stats if completion status changed
      if (completionStatusChanged) {
        const pointsChange = nowCompleted ? (updateData.points || current.points) : -(updateData.points || current.points);
        const taskChange = nowCompleted ? 1 : -1;
        const timeChange = nowCompleted ? (updateData.duration || current.duration) : -(updateData.duration || current.duration);
        const hoursChange = Math.max(0, Math.round(timeChange / 60)); // Ensure non-negative hours

        // Get current user values to prevent negative values
        const currentUserResult = await client.query(`
          SELECT current_xp, daily_learning_time, weekly_learning_time, total_hours, completed_tasks, total_completed_tasks
          FROM users WHERE id = $1
        `, [userId]);

        const currentUser = currentUserResult.rows[0];
        
        // Calculate safe values that won't go negative
        const newXp = Math.max(0, currentUser.current_xp + pointsChange);
        const newDailyTime = Math.max(0, currentUser.daily_learning_time + timeChange);
        const newWeeklyTime = Math.max(0, currentUser.weekly_learning_time + timeChange);
        const newTotalHours = Math.max(0, currentUser.total_hours + hoursChange);
        const newCompletedTasks = Math.max(0, currentUser.completed_tasks + taskChange);
        const newTotalCompletedTasks = Math.max(0, currentUser.total_completed_tasks + taskChange);

        await client.query(`
          UPDATE users 
          SET current_xp = $1,
              daily_learning_time = $2,
              weekly_learning_time = $3,
              total_hours = $4,
              completed_tasks = $5,
              total_completed_tasks = $6
          WHERE id = $7
        `, [newXp, newDailyTime, newWeeklyTime, newTotalHours, newCompletedTasks, newTotalCompletedTasks, userId]);

        // Record gamification event (only for completion, not incompletion)
        if (nowCompleted) {
          const eventType = 'session_complete';
          await client.query(`
            INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
            VALUES ($1, $2, $3, $4)
          `, [
            userId,
            eventType,
            JSON.stringify({
              sessionId: id,
              subjectId: current.subject_id,
              action: 'update'
            }),
            Math.max(0, pointsChange) // Ensure non-negative XP
          ]);
        }
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

    return res.status(200).json({ session });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid session data',
        details: error.errors
      });
    }

    console.error('Update learning session error:', error);
    return res.status(500).json({
      error: 'Failed to update learning session'
    });
  }
}

async function deleteLearningSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';
    const userId = (req.query.userId as string) || defaultUserId;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Session ID is required'
      });
    }

    // Get session data before deletion for stats adjustment
    const sessionResult = await query(`
      SELECT * FROM learning_sessions 
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Learning session not found'
      });
    }

    const session = sessionResult.rows[0];

    await withTransaction(async (client) => {
      // Delete the session
      await client.query(`
        DELETE FROM learning_sessions 
        WHERE id = $1 AND user_id = $2
      `, [id, userId]);

      // Adjust subject completed hours (ensure proper decimal conversion)
      const hoursToDeduct = Math.round((session.duration / 60) * 100) / 100; // Round to 2 decimal places
      await client.query(`
        UPDATE subjects 
        SET completed_hours = completed_hours - $1
        WHERE id = $2
      `, [hoursToDeduct, session.subject_id]);

      // Adjust user stats if session was completed
      if (session.completed) {
        // Get current user values to ensure we don't go negative
        const currentUserResult = await client.query(`
          SELECT current_xp, daily_learning_time, weekly_learning_time, total_hours, completed_tasks, total_completed_tasks
          FROM users WHERE id = $1
        `, [userId]);

        const currentUser = currentUserResult.rows[0];
        const hoursToDeduct = Math.round(session.duration / 60);

        // Calculate safe values that won't go negative
        const newXp = Math.max(0, currentUser.current_xp - session.points);
        const newDailyTime = Math.max(0, currentUser.daily_learning_time - session.duration);
        const newWeeklyTime = Math.max(0, currentUser.weekly_learning_time - session.duration);
        const newTotalHours = Math.max(0, currentUser.total_hours - hoursToDeduct);
        const newCompletedTasks = Math.max(0, currentUser.completed_tasks - 1);
        const newTotalCompletedTasks = Math.max(0, currentUser.total_completed_tasks - 1);

        await client.query(`
          UPDATE users 
          SET current_xp = $1,
              daily_learning_time = $2,
              weekly_learning_time = $3,
              total_hours = $4,
              completed_tasks = $5,
              total_completed_tasks = $6
          WHERE id = $7
        `, [newXp, newDailyTime, newWeeklyTime, newTotalHours, newCompletedTasks, newTotalCompletedTasks, userId]);

        // Record deletion event as XP loss
        await client.query(`
          INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
          VALUES ($1, 'xp_gain', $2, $3)
        `, [
          userId,
          JSON.stringify({
            sessionId: id,
            subjectId: session.subject_id,
            duration: session.duration,
            action: 'delete'
          }),
          0 // No XP awarded for deletion
        ]);
      }
    });

    return res.status(200).json({
      message: 'Learning session deleted successfully'
    });

  } catch (error) {
    console.error('Delete learning session error:', error);
    return res.status(500).json({
      error: 'Failed to delete learning session'
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getLearningSession(req, res);
      case 'PUT':
        return await updateLearningSession(req, res);
      case 'DELETE':
        return await deleteLearningSession(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          error: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Session API error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}