import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date } = req.query;
    
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD format)' });
    }

    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';

    // Get sessions for the specific date
    const dateStatsResult = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE completed = true) as completed_sessions,
        COUNT(*) FILTER (WHERE completed = false) as pending_sessions,
        COALESCE(SUM(CASE WHEN completed = true THEN duration ELSE 0 END), 0) as completed_duration
      FROM learning_sessions 
      WHERE user_id = $1 
        AND date = $2
    `, [defaultUserId, date]);

    const dateStats = dateStatsResult.rows[0];
    const totalSessions = parseInt(dateStats.total_sessions) || 0;
    const completedSessions = parseInt(dateStats.completed_sessions) || 0;
    const pendingSessions = parseInt(dateStats.pending_sessions) || 0;
    const completedDuration = parseInt(dateStats.completed_duration) || 0; // in minutes
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Get this week's statistics (for comparison)
    const weekStatsResult = await query(`
      SELECT 
        COUNT(*) as week_sessions,
        COUNT(*) FILTER (WHERE completed = true) as week_completed,
        COALESCE(SUM(CASE WHEN completed = true THEN duration ELSE 0 END), 0) as week_completed_duration
      FROM learning_sessions 
      WHERE user_id = $1 
        AND date >= date_trunc('week', $2::date)
        AND date <= date_trunc('week', $2::date) + INTERVAL '6 days'
    `, [defaultUserId, date]);

    const weekStats = weekStatsResult.rows[0];
    const thisWeekSessions = parseInt(weekStats.week_sessions) || 0;
    const thisWeekCompleted = parseInt(weekStats.week_completed) || 0;
    const thisWeekCompletedDuration = parseInt(weekStats.week_completed_duration) || 0;

    // Calculate if the selected date is today
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    const isToday = selectedDate.getTime() === today.getTime();

    // Calculate streak UP TO the selected date (not from today)
    const streakResult = await query(`
      WITH RECURSIVE date_series AS (
        SELECT $2::date as check_date
        UNION ALL
        SELECT (check_date - INTERVAL '1 day')::date
        FROM date_series 
        WHERE check_date > (CURRENT_DATE - INTERVAL '365 days')
      ),
      daily_completion AS (
        SELECT 
          ds.check_date,
          CASE WHEN COUNT(ls.id) FILTER (WHERE ls.completed = true) > 0 THEN 1 ELSE 0 END as has_completed_session
        FROM date_series ds
        LEFT JOIN learning_sessions ls ON ls.date = ds.check_date AND ls.user_id = $1
        GROUP BY ds.check_date
        ORDER BY ds.check_date DESC
      )
      SELECT COUNT(*) as streak_days
      FROM (
        SELECT 
          check_date,
          has_completed_session,
          ROW_NUMBER() OVER (ORDER BY check_date DESC) as rn
        FROM daily_completion
      ) t
      WHERE has_completed_session = 1 
        AND NOT EXISTS (
          SELECT 1 FROM (
            SELECT 
              check_date,
              has_completed_session,
              ROW_NUMBER() OVER (ORDER BY check_date DESC) as rn2
            FROM daily_completion
          ) t2 
          WHERE t2.rn2 < t.rn AND t2.has_completed_session = 0
        )
    `, [defaultUserId, date]);

    const streakDays = parseInt(streakResult.rows[0]?.streak_days || '0');

    const response = {
      // Date-specific stats
      selectedDate: date,
      isToday,
      totalSessions,
      completedSessions,
      pendingSessions,
      completionRate,
      completedDuration, // Total learning time for the date in minutes
      
      // Streak calculation up to selected date
      streakDays,
      
      // Weekly context
      thisWeekSessions,
      thisWeekCompleted, 
      thisWeekCompletedDuration,
      
      // Formatted values
      formattedDuration: `${Math.floor(completedDuration / 60)}h ${completedDuration % 60}m`,
      formattedWeeklyDuration: `${Math.floor(thisWeekCompletedDuration / 60)}h ${thisWeekCompletedDuration % 60}m`
    };

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Date-specific stats API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch date-specific statistics'
    });
  }
}