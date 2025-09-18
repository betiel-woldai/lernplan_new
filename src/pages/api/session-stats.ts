import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getActiveUserId } from '@/utils/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const defaultUserId = getActiveUserId();

    // Get overall session statistics from calendar sessions
    const overallResult = await query(`
      SELECT
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE completed = true) as completed_sessions,
        COUNT(*) FILTER (WHERE completed = false) as pending_sessions
      FROM calendar_sessions
      WHERE user_id = $1
    `, [defaultUserId]);

    const overall = overallResult.rows[0];
    const totalSessions = parseInt(overall.total_sessions) || 0;
    const completedSessions = parseInt(overall.completed_sessions) || 0;
    const pendingSessions = parseInt(overall.pending_sessions) || 0;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Get today's session statistics from calendar sessions
    const todayResult = await query(`
      SELECT
        COUNT(*) as today_sessions,
        COUNT(*) FILTER (WHERE completed = true) as today_completed
      FROM calendar_sessions
      WHERE user_id = $1
        AND DATE(start_time) = CURRENT_DATE
    `, [defaultUserId]);

    const today = todayResult.rows[0];
    const todaySessions = parseInt(today.today_sessions) || 0;
    const todayCompleted = parseInt(today.today_completed) || 0;

    // Get this week's session statistics from calendar sessions
    const weekResult = await query(`
      SELECT
        COUNT(*) as week_sessions,
        COUNT(*) FILTER (WHERE completed = true) as week_completed
      FROM calendar_sessions
      WHERE user_id = $1
        AND DATE(start_time) >= date_trunc('week', CURRENT_DATE)
        AND DATE(start_time) <= date_trunc('week', CURRENT_DATE) + INTERVAL '6 days'
    `, [defaultUserId]);

    const week = weekResult.rows[0];
    const thisWeekSessions = parseInt(week.week_sessions) || 0;
    const thisWeekCompleted = parseInt(week.week_completed) || 0;

    const sessionStats = {
      totalSessions,
      completedSessions,
      pendingSessions,
      completionRate,
      todaySessions,
      todayCompleted,
      thisWeekSessions,
      thisWeekCompleted
    };

    return res.status(200).json(sessionStats);
    
  } catch (error) {
    console.error('Session stats API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch session statistics'
    });
  }
}
