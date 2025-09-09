import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';

    // Get count of sessions to be deleted for response
    const countResult = await query(
      'SELECT COUNT(*) as total FROM learning_sessions WHERE user_id = $1',
      [defaultUserId]
    );
    
    const deletedCount = parseInt(countResult.rows[0].total);

    // Delete all learning sessions for the user
    await query(
      'DELETE FROM learning_sessions WHERE user_id = $1',
      [defaultUserId]
    );

    // Reset user stats related to sessions
    await query(`
      UPDATE users 
      SET current_xp = 0,
          current_level = 1,
          daily_learning_time = 0,
          weekly_learning_time = 0,
          total_hours = 0,
          completed_tasks = 0,
          total_completed_tasks = 0,
          learning_streak = 0
      WHERE id = $1
    `, [defaultUserId]);

    // Reset subject completed hours
    await query(`
      UPDATE subjects 
      SET completed_hours = 0
      WHERE user_id = $1
    `, [defaultUserId]);

    // Delete gamification events
    await query(
      'DELETE FROM gamification_events WHERE user_id = $1',
      [defaultUserId]
    );

    return res.status(200).json({
      message: 'All session history cleared successfully',
      deletedCount,
      resetStats: true
    });
  } catch (error) {
    console.error('Bulk delete sessions error:', error);
    return res.status(500).json({
      error: 'Failed to clear session history'
    });
  }
}