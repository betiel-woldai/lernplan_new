import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getActiveUserId } from '@/utils/user';
import { hasSubjectTypeColumn, hasFixedAppointmentColumns } from '@/lib/schemaMetadata';

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

    const defaultUserId = getActiveUserId();
    const hasType = await hasSubjectTypeColumn();
    const hasFixed = await hasFixedAppointmentColumns();

    // Always join subjects for name-based fallback
    const joinSubjects = 'JOIN subjects s ON s.id = cs.subject_id';
    // Triple fallback: subject_type > fixed columns > name
    const whereAcademic = hasType
      ? "AND s.subject_type = 'academic'"
      : hasFixed
      ? "AND NOT (cs.is_fixed = TRUE AND cs.fixed_source = 'terminplan')"
      : "AND (s.name IS NULL OR s.name <> 'Termine & Fristen')";

    // Get sessions for the specific date from calendar sessions
    const dateStatsResult = await query(
      `SELECT
         COUNT(*) as total_sessions,
         COUNT(*) FILTER (WHERE cs.completed = true) as completed_sessions,
         COUNT(*) FILTER (WHERE cs.completed = false) as pending_sessions,
         COALESCE(SUM(CASE WHEN cs.completed = true THEN COALESCE(cs.actual_duration, cs.planned_duration) ELSE 0 END), 0) as completed_duration
       FROM calendar_sessions cs
       ${joinSubjects}
       WHERE cs.user_id = $1
         AND DATE(cs.start_time) = $2::date
         ${whereAcademic}`,
      [defaultUserId, date]
    );

    const dateStats = dateStatsResult.rows[0];
    const totalSessions = parseInt(dateStats.total_sessions) || 0;
    const completedSessions = parseInt(dateStats.completed_sessions) || 0;
    const pendingSessions = parseInt(dateStats.pending_sessions) || 0;
    const completedDuration = parseInt(dateStats.completed_duration) || 0; // in minutes
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Get this week's statistics from calendar sessions (for comparison)
    const weekStatsResult = await query(
      `SELECT
         COUNT(*) as week_sessions,
         COUNT(*) FILTER (WHERE cs.completed = true) as week_completed,
         COALESCE(SUM(CASE WHEN cs.completed = true THEN COALESCE(cs.actual_duration, cs.planned_duration) ELSE 0 END), 0) as week_completed_duration
       FROM calendar_sessions cs
       ${joinSubjects}
       WHERE cs.user_id = $1
         AND DATE(cs.start_time) >= date_trunc('week', $2::date)::date
         AND DATE(cs.start_time) <= (date_trunc('week', $2::date) + INTERVAL '6 days')::date
         ${whereAcademic}`,
      [defaultUserId, date]
    );

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
    const streakResult = await query(
      `WITH RECURSIVE date_series AS (
         SELECT $2::date as check_date
         UNION ALL
         SELECT (check_date - INTERVAL '1 day')::date
         FROM date_series
         WHERE check_date > (CURRENT_DATE - INTERVAL '365 days')
       ),
       daily_completion AS (
         SELECT
           ds.check_date,
           CASE WHEN COUNT(cs.id) FILTER (
             WHERE cs.completed = true
             ${hasType ? "AND s.subject_type = 'academic'" : hasFixed ? "AND NOT (cs.is_fixed = TRUE AND cs.fixed_source = 'terminplan')" : "AND (s.name IS NULL OR s.name <> 'Termine & Fristen')"}
           ) > 0 THEN 1 ELSE 0 END as has_completed_session
         FROM date_series ds
         LEFT JOIN calendar_sessions cs
           ON DATE(cs.start_time) = ds.check_date AND cs.user_id = $1
         LEFT JOIN subjects s ON s.id = cs.subject_id
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
         )`,
      [defaultUserId, date]
    );

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
