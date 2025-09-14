import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

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
      updateFields.push(`duration = $${valueIndex}`);
      updateValues.push(updates.duration);
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

    const result = await query(sqlQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Calendar session not found' });
    }

    const updatedSession = result.rows[0];
    
    // Convert to frontend format
    const formattedSession = {
      id: updatedSession.id,
      title: updatedSession.title,
      description: updatedSession.description,
      location: updatedSession.location,
      startTime: updatedSession.start_time,
      endTime: updatedSession.end_time,
      duration: updatedSession.duration,
      completed: updatedSession.completed,
      subjectId: updatedSession.subject_id,
      userId: updatedSession.user_id,
      type: updatedSession.session_type,
      createdAt: updatedSession.created_at,
      updatedAt: updatedSession.updated_at
    };

    console.log(`Calendar session ${sessionId} updated successfully`);
    return res.status(200).json(formattedSession);

  } catch (error) {
    console.error('Update calendar session error:', error);
    return res.status(500).json({ error: 'Failed to update calendar session' });
  }
}

async function deleteCalendarSession(req: NextApiRequest, res: NextApiResponse, sessionId: string) {
  try {
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