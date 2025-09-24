import { NextApiRequest, NextApiResponse } from 'next';
import { query, withTransaction } from '@/lib/db';
import { hasFixedAppointmentColumns } from '@/lib/schemaMetadata';
import { calculateXP } from '@/utils/formatters';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  try {
    switch (req.method) {
      case 'PUT':
        return await updateCalendarSession(req, res, id);
      case 'DELETE':
        return await deleteCalendarSession(req, res, id);
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Calendar API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateCalendarSession(req: NextApiRequest, res: NextApiResponse, sessionId: string) {
  try {
    const updates = req.body;

    // If fixed appointment columns exist, block illegal updates for fixed rows
    if (await hasFixedAppointmentColumns()) {
      const fixedCheck = await query(
        'SELECT is_fixed FROM calendar_sessions WHERE id = $1',
        [sessionId]
      );
      if (fixedCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Calendar session not found' });
      }
      if (fixedCheck.rows[0].is_fixed) {
        const illegal = (
          updates.startTime !== undefined ||
          updates.endTime !== undefined ||
          updates.title !== undefined ||
          updates.session_type !== undefined ||
          updates.subjectId !== undefined ||
          updates.subject_id !== undefined
        );
        if (illegal) {
          return res.status(409).json({ error: 'Fixed appointment is read-only (terminplan)' });
        }
      }
    }
    
    // Build dynamic SQL update query based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let valueIndex = 1;

    // Map common update fields
    if (updates.completed !== undefined) {
      updateFields.push(`completed = $${valueIndex}`);
      updateValues.push(updates.completed);
      valueIndex++;
    }

    if (updates.title !== undefined) {
      updateFields.push(`title = $${valueIndex}`);
      updateValues.push(updates.title);
      valueIndex++;
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${valueIndex}`);
      updateValues.push(updates.description || null);
      valueIndex++;
    }

    if (updates.location !== undefined) {
      updateFields.push(`location = $${valueIndex}`);
      updateValues.push(updates.location || null);
      valueIndex++;
    }

    if (updates.startTime !== undefined) {
      updateFields.push(`start_time = $${valueIndex}`);
      updateValues.push(new Date(updates.startTime));
      valueIndex++;
    }

    if (updates.endTime !== undefined) {
      updateFields.push(`end_time = $${valueIndex}`);
      updateValues.push(new Date(updates.endTime));
      valueIndex++;
    }

    if (updates.duration !== undefined) {
      updateFields.push(`planned_duration = $${valueIndex}`);
      updateValues.push(updates.duration);
      valueIndex++;
    }

    if (updates.plannedDuration !== undefined) {
      updateFields.push(`planned_duration = $${valueIndex}`);
      updateValues.push(updates.plannedDuration);
      valueIndex++;
    }

    if (updates.actualDuration !== undefined) {
      updateFields.push(`actual_duration = $${valueIndex}`);
      updateValues.push(updates.actualDuration);
      valueIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add updated timestamp
    updateFields.push(`updated_at = $${valueIndex}`);
    updateValues.push(new Date());
    valueIndex++;

    // Add session ID for WHERE clause
    updateValues.push(sessionId);

    const sqlQuery = `
      UPDATE calendar_sessions 
      SET ${updateFields.join(', ')} 
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const { session: updatedSession, subjectExamUpdate } = await withTransaction(async client => {
      const result = await client.query(sqlQuery, updateValues);

      if (result.rows.length === 0) {
        return { session: null, subjectExamUpdate: null };
      }

      const sessionRow = result.rows[0];
      let examUpdate: { subjectId: string; examDate: Date } | null = null;

      if (sessionRow.session_type === 'exam' && sessionRow.subject_id) {
        const newExamDate = new Date(sessionRow.start_time);
        await client.query(
          'UPDATE subjects SET exam_date = $1, updated_at = NOW() WHERE id = $2',
          [newExamDate, sessionRow.subject_id]
        );
        examUpdate = {
          subjectId: sessionRow.subject_id,
          examDate: newExamDate
        };
      }

      // Handle XP changes when completion status changes
      if (updates.completed !== undefined) {
        const completionStatusChanged = updates.completed !== sessionRow.completed;

        if (completionStatusChanged) {
          let xpChange = 0;
          let xpAwarded = 0;

          if (updates.completed === true) {
            // When marking complete: Calculate exact XP with bonuses using current streak
            const sessionDuration = sessionRow.actual_duration || sessionRow.planned_duration;
            const currentUserResult = await client.query(`
              SELECT learning_streak
              FROM users WHERE id = $1
            `, [sessionRow.user_id]);

            const userStreak = currentUserResult.rows[0]?.learning_streak || 0;
            xpAwarded = calculateXP(sessionDuration, true, userStreak); // Calculate with bonuses
            xpChange = xpAwarded;

            // Update calendar session with awarded XP
            await client.query(`
              UPDATE calendar_sessions
              SET xp_awarded = $1
              WHERE id = $2
            `, [xpAwarded, sessionRow.id]);

          } else if (updates.completed === false) {
            // When unmarking: Use stored xp_awarded for exact reversal
            xpAwarded = 0;
            xpChange = -(sessionRow.xp_awarded || 0); // Subtract exact XP that was awarded

            // Reset xp_awarded to 0
            await client.query(`
              UPDATE calendar_sessions
              SET xp_awarded = 0
              WHERE id = $1
            `, [sessionRow.id]);
          }

          if (xpChange !== 0) {
            // Get current user values to prevent negative values
            const currentUserResult = await client.query(`
              SELECT current_xp
              FROM users WHERE id = $1
            `, [sessionRow.user_id]);

            const currentUser = currentUserResult.rows[0];
            const newXp = Math.max(0, currentUser.current_xp + xpChange);

            // Update user XP
            await client.query(`
              UPDATE users
              SET current_xp = $1
              WHERE id = $2
            `, [newXp, sessionRow.user_id]);

            // Record gamification event
            const eventType = updates.completed === true ? 'session_complete' : 'xp_loss';
            await client.query(`
              INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
              VALUES ($1, $2, $3, $4)
            `, [
              sessionRow.user_id,
              eventType,
              JSON.stringify({
                sessionId: sessionRow.id,
                duration: sessionRow.actual_duration || sessionRow.planned_duration,
                sessionType: sessionRow.session_type,
                source: 'calendar',
                action: updates.completed === true ? 'complete' : 'uncomplete'
              }),
              updates.completed === true ? Math.max(0, xpChange) : 0
            ]);
          }
        }
      }

      return { session: sessionRow, subjectExamUpdate: examUpdate };
    });

    if (!updatedSession) {
      return res.status(404).json({ error: 'Calendar session not found' });
    }
    
    // Convert to frontend format
    const formattedSession = {
      id: updatedSession.id,
      title: updatedSession.title,
      description: updatedSession.description,
      location: updatedSession.location,
      startTime: updatedSession.start_time,
      endTime: updatedSession.end_time,
      duration: updatedSession.planned_duration || updatedSession.duration, // backward compatibility
      plannedDuration: updatedSession.planned_duration,
      actualDuration: updatedSession.actual_duration,
      completed: updatedSession.completed,
      subjectId: updatedSession.subject_id,
      userId: updatedSession.user_id,
      type: updatedSession.session_type,
      createdAt: updatedSession.created_at,
      updatedAt: updatedSession.updated_at,
      isAutoGenerated: updatedSession.is_auto_generated,
      sourceSubjectExamId: updatedSession.source_subject_exam_id,
      schedulingPriority: updatedSession.scheduling_priority,
      origin: updatedSession.is_auto_generated ? 'auto' : 'manual',
      source: 'calendar',
    };

    console.log(`Calendar session ${sessionId} updated successfully`);
    return res.status(200).json({ session: formattedSession, subjectExamUpdate });

  } catch (error) {
    console.error('Update calendar session error:', error);
    return res.status(500).json({ error: 'Failed to update calendar session' });
  }
}

async function deleteCalendarSession(req: NextApiRequest, res: NextApiResponse, sessionId: string) {
  try {
    // Prevent deletion of fixed appointments if columns exist
    if (await hasFixedAppointmentColumns()) {
      const fixedCheck = await query('SELECT is_fixed FROM calendar_sessions WHERE id = $1', [sessionId]);
      if (fixedCheck.rows.length > 0 && fixedCheck.rows[0].is_fixed) {
        return res.status(409).json({ error: 'Cannot delete fixed appointment (terminplan)' });
      }
    }
    const result = await query('DELETE FROM calendar_sessions WHERE id = $1', [sessionId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Calendar session not found' });
    }

    return res.status(200).json({ message: 'Calendar session deleted successfully', sessionId });
  } catch (error) {
    console.error('Delete calendar session error:', error);
    return res.status(500).json({ error: 'Failed to delete calendar session' });
  }
}
