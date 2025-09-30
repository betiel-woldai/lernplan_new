import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { hasSubjectTypeColumn, hasFixedAppointmentColumns } from '@/lib/schemaMetadata';
import { z } from 'zod';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { getActiveUserId } from '@/utils/user';

// Analytics query validation schema
const analyticsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  period: z.enum(['week', 'month', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['progress', 'subjects', 'streaks', 'goals']).optional()
});

type AnalyticsParams = z.infer<typeof analyticsQuerySchema>;

interface ProgressData {
  date: string;
  hours: number;
  sessions: number;
  completedSessions: number;
  xp: number;
}

interface SubjectData {
  id: string;
  name: string;
  color: string;
  hours: number;
  sessions: number;
  completedSessions: number;
  progress: number;
  targetHours: number;
}

interface StreakData {
  date: string;
  streak: number;
  hasSession: boolean;
}

interface GoalData {
  id: string;
  name: string;
  targetHours: number;
  completedHours: number;
  progress: number;
  daysRemaining?: number;
}

async function getProgressAnalytics(userId: string, period: string, startDate?: string, endDate?: string): Promise<ProgressData[]> {
  const hasType = await hasSubjectTypeColumn();
  const hasFixed = await hasFixedAppointmentColumns();

  let dateRange: { start: Date; end: Date };

  if (startDate && endDate) {
    dateRange = {
      start: parseISO(startDate),
      end: parseISO(endDate)
    };
  } else {
    const now = new Date();
    switch (period) {
      case 'week':
        dateRange = {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
        break;
      case 'year':
        dateRange = {
          start: new Date(now.getFullYear(), 0, 1),
          end: new Date(now.getFullYear(), 11, 31)
        };
        break;
      default: // month
        dateRange = {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  }

  // Always join subjects for name-based fallback
  const joinSubjects = 'JOIN subjects s ON s.id = cs.subject_id';
  // Triple fallback: subject_type > fixed columns > name
  const whereAcademic = hasType
    ? "AND s.subject_type = 'academic'"
    : hasFixed
    ? "AND NOT (cs.is_fixed = TRUE AND cs.fixed_source = 'terminplan')"
    : "AND (s.name IS NULL OR s.name <> 'Termine & Fristen')";

  const progressQuery = `
    SELECT
      DATE(cs.start_time) as session_date,
      SUM(CASE WHEN cs.completed THEN COALESCE(cs.actual_duration, cs.planned_duration) ELSE 0 END) as total_minutes,
      COUNT(cs.id) as session_count,
      COUNT(cs.id) FILTER (WHERE cs.completed = true) as completed_session_count,
      SUM(CASE WHEN cs.completed THEN COALESCE(cs.actual_duration, cs.planned_duration) * 2 ELSE 0 END) as total_xp
    FROM calendar_sessions cs
    ${joinSubjects}
    WHERE cs.user_id = $1
      AND DATE(cs.start_time) >= $2::date
      AND DATE(cs.start_time) <= $3::date
      ${whereAcademic}
    GROUP BY DATE(cs.start_time)
    ORDER BY session_date ASC
  `;

  const result = await query(progressQuery, [
    userId,
    format(dateRange.start, 'yyyy-MM-dd'),
    format(dateRange.end, 'yyyy-MM-dd')
  ]);

  // Create array with all dates in range, filling gaps with zeros
  const allDates = eachDayOfInterval(dateRange);
  const progressMap = new Map(
    result.rows.map(row => [
      format(new Date(row.session_date), 'yyyy-MM-dd'),
      {
        date: format(new Date(row.session_date), 'yyyy-MM-dd'),
        hours: Math.round((row.total_minutes / 60) * 100) / 100,
        sessions: parseInt(row.session_count),
        completedSessions: parseInt(row.completed_session_count),
        xp: parseInt(row.total_xp)
      }
    ])
  );

  return allDates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return progressMap.get(dateStr) || {
      date: dateStr,
      hours: 0,
      sessions: 0,
      completedSessions: 0,
      xp: 0
    };
  });
}

async function getSubjectsAnalytics(userId: string): Promise<SubjectData[]> {
  const hasType = await hasSubjectTypeColumn();
  const hasFixed = await hasFixedAppointmentColumns();

  // Build filter based on schema capabilities
  const academicFilter = hasType
    ? "AND s.subject_type = 'academic'"
    : hasFixed
    ? ''
    : "AND (s.name IS NULL OR s.name <> 'Termine & Fristen')";

  // Apply filter to aggregation - when hasFixed, exclude via LEFT JOIN condition
  const fixedExclude = !hasType && hasFixed
    ? " AND NOT (cs.is_fixed = TRUE AND cs.fixed_source = 'terminplan')"
    : '';

  const minutesExpr = `COALESCE(SUM(CASE WHEN cs.completed${fixedExclude} THEN COALESCE(cs.actual_duration, cs.planned_duration) ELSE 0 END), 0) as total_minutes`;
  const sessionCountExpr = `COUNT(cs.id) FILTER (WHERE 1=1${fixedExclude}) as session_count`;
  const completedCountExpr = `COUNT(cs.id) FILTER (WHERE cs.completed = true${fixedExclude}) as completed_session_count`;

  const whereSubjects = `WHERE s.user_id = $1 ${academicFilter}`;

  const subjectsQuery = `
    SELECT
      s.id,
      s.name,
      s.color,
      s.target_hours,
      s.completed_hours,
      ${minutesExpr},
      ${sessionCountExpr},
      ${completedCountExpr}
    FROM subjects s
    LEFT JOIN calendar_sessions cs ON s.id = cs.subject_id
    ${whereSubjects}
    GROUP BY s.id, s.name, s.color, s.target_hours, s.completed_hours
    ORDER BY total_minutes DESC
  `;

  const result = await query(subjectsQuery, [userId]);

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    hours: Math.round((row.total_minutes / 60) * 100) / 100,
    sessions: parseInt(row.session_count),
    completedSessions: parseInt(row.completed_session_count),
    targetHours: parseFloat(row.target_hours),
    completedHours: parseFloat(row.completed_hours),
    progress: Math.round((parseFloat(row.completed_hours) / parseFloat(row.target_hours)) * 100)
  }));
}

async function getStreakAnalytics(userId: string, days: number = 30): Promise<StreakData[]> {
  const hasType = await hasSubjectTypeColumn();
  const hasFixed = await hasFixedAppointmentColumns();

  const startDate = subDays(new Date(), days);
  const endDate = new Date();

  // Always join subjects for name-based fallback
  const joinSubjects = 'JOIN subjects s ON s.id = cs.subject_id';
  // Triple fallback: subject_type > fixed columns > name
  const whereAcademic = hasType
    ? "AND s.subject_type = 'academic'"
    : hasFixed
    ? "AND NOT (cs.is_fixed = TRUE AND cs.fixed_source = 'terminplan')"
    : "AND (s.name IS NULL OR s.name <> 'Termine & Fristen')";

  const streakQuery = `
    SELECT
      DATE(cs.start_time) as session_date,
      COUNT(cs.id) > 0 as has_session
    FROM calendar_sessions cs
    ${joinSubjects}
    WHERE cs.user_id = $1
      AND DATE(cs.start_time) >= $2::date
      AND DATE(cs.start_time) <= $3::date
      AND cs.completed = true
      ${whereAcademic}
    GROUP BY DATE(cs.start_time)
    ORDER BY session_date ASC
  `;

  const result = await query(streakQuery, [
    userId,
    format(startDate, 'yyyy-MM-dd'),
    format(endDate, 'yyyy-MM-dd')
  ]);

  const sessionMap = new Map(
    result.rows.map(row => [
      format(new Date(row.session_date), 'yyyy-MM-dd'),
      row.has_session
    ])
  );

  // Calculate streaks for each day
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  let currentStreak = 0;
  
  return allDates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasSession = sessionMap.get(dateStr) || false;
    
    if (hasSession) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }

    return {
      date: dateStr,
      streak: currentStreak,
      hasSession
    };
  });
}

async function getGoalsAnalytics(userId: string): Promise<GoalData[]> {
  const hasType = await hasSubjectTypeColumn();
  const hasFixed = await hasFixedAppointmentColumns();

  // Triple fallback for filtering
  const whereAcademic = hasType
    ? "AND s.subject_type = 'academic'"
    : "AND s.name <> 'Termine & Fristen'"; // Always exclude by name as fallback

  const goalsQuery = `
    SELECT
      s.id,
      s.name,
      s.target_hours,
      s.completed_hours,
      s.exam_date,
      CASE
        WHEN s.exam_date IS NOT NULL
        THEN (s.exam_date - CURRENT_DATE)
        ELSE NULL
      END as days_remaining
    FROM subjects s
    WHERE s.user_id = $1
      AND s.target_hours > 0
      ${whereAcademic}
    ORDER BY
      CASE WHEN s.exam_date IS NOT NULL THEN s.exam_date END ASC NULLS LAST,
      s.name ASC
  `;

  const result = await query(goalsQuery, [userId]);

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    targetHours: parseFloat(row.target_hours),
    completedHours: parseFloat(row.completed_hours),
    progress: Math.round((parseFloat(row.completed_hours) / parseFloat(row.target_hours)) * 100),
    daysRemaining: row.days_remaining ? parseInt(row.days_remaining) : undefined
  }));
}

async function getAnalytics(req: NextApiRequest, res: NextApiResponse) {
  try {
    const params = analyticsQuerySchema.parse(req.query);
    const defaultUserId = getActiveUserId();
    const userId = params.userId || defaultUserId;

    let analyticsData: any = {};

    if (!params.type || params.type === 'progress') {
      analyticsData.progress = await getProgressAnalytics(
        userId, 
        params.period, 
        params.startDate, 
        params.endDate
      );
    }

    if (!params.type || params.type === 'subjects') {
      analyticsData.subjects = await getSubjectsAnalytics(userId);
    }

    if (!params.type || params.type === 'streaks') {
      analyticsData.streaks = await getStreakAnalytics(userId);
    }

    if (!params.type || params.type === 'goals') {
      analyticsData.goals = await getGoalsAnalytics(userId);
    }

    // Add summary statistics
    if (analyticsData.progress) {
      const totalHours = analyticsData.progress.reduce((sum: number, day: ProgressData) => sum + day.hours, 0);
      const totalSessions = analyticsData.progress.reduce((sum: number, day: ProgressData) => sum + day.sessions, 0);
      const completedSessions = analyticsData.progress.reduce((sum: number, day: ProgressData) => sum + day.completedSessions, 0);
      const totalXP = analyticsData.progress.reduce((sum: number, day: ProgressData) => sum + day.xp, 0);
      
      analyticsData.summary = {
        totalHours: Math.round(totalHours * 100) / 100,
        totalSessions,
        completedSessions,
        totalXP,
        averageSessionLength: totalSessions > 0 ? Math.round((totalHours / totalSessions) * 100) / 100 : 0,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
      };
    }

    return res.status(200).json(analyticsData);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: error.issues
      });
    }

    console.error('Analytics API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch analytics data'
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getAnalytics(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          error: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Analytics API handler error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
