import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';

    console.log('🧹 Starting data cleanup...');

    // Delete all learning sessions
    const sessionsResult = await query(
      'DELETE FROM learning_sessions WHERE user_id = $1 RETURNING id',
      [defaultUserId]
    );
    
    // Delete all subjects (this will cascade to related sessions)
    const subjectsResult = await query(
      'DELETE FROM subjects WHERE user_id = $1 RETURNING id',
      [defaultUserId]
    );
    
    // Delete all calendar sessions
    const calendarResult = await query(
      'DELETE FROM calendar_sessions WHERE user_id = $1 RETURNING id',
      [defaultUserId]
    );
    
    // Delete gamification events
    const gamificationResult = await query(
      'DELETE FROM gamification_events WHERE user_id = $1 RETURNING id',
      [defaultUserId]
    );
    
    // Reset user stats completely
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

    console.log('🧹 Data cleanup completed successfully');
    console.log(`   - Sessions deleted: ${sessionsResult.rowCount || 0}`);
    console.log(`   - Subjects deleted: ${subjectsResult.rowCount || 0}`);
    console.log(`   - Calendar sessions deleted: ${calendarResult.rowCount || 0}`);
    console.log(`   - Gamification events deleted: ${gamificationResult.rowCount || 0}`);

    return res.status(200).json({
      message: 'All dummy data successfully deleted',
      deletedCounts: {
        sessions: sessionsResult.rowCount || 0,
        subjects: subjectsResult.rowCount || 0,
        calendarSessions: calendarResult.rowCount || 0,
        gamificationEvents: gamificationResult.rowCount || 0
      },
      userStatsReset: true
    });
    
  } catch (error) {
    console.error('❌ Data cleanup error:', error);
    return res.status(500).json({
      error: 'Failed to clean dummy data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}