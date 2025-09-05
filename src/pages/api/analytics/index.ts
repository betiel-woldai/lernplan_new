import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { z } from 'zod';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO, subDays, eachDayOfInterval } from 'date-fns';

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
  xp: number;
}

interface SubjectData {
  id: string;
  name: string;
  color: string;
  hours: number;
  sessions: number;
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

  const progressQuery = `
    SELECT 
      DATE(ls.date) as session_date,
      SUM(ls.duration) as total_minutes,
      COUNT(ls.id) as session_count,
      SUM(ls.points) as total_xp
    FROM learning_sessions ls
    WHERE ls.user_id = $1
      AND ls.date >= $2
      AND ls.date <= $3
      AND ls.completed = true
    GROUP BY DATE(ls.date)
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
      xp: 0
    };
  });
}

async function getSubjectsAnalytics(userId: string): Promise<SubjectData[]> {
  const subjectsQuery = `
    SELECT 
      s.id,
      s.name,
      s.color,
      s.target_hours,
      s.completed_hours,
      COALESCE(SUM(ls.duration), 0) as total_minutes,
      COUNT(ls.id) as session_count
    FROM subjects s
    LEFT JOIN learning_sessions ls ON s.id = ls.subject_id AND ls.completed = true
    WHERE s.user_id = $1
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
    targetHours: parseFloat(row.target_hours),
    completedHours: parseFloat(row.completed_hours),
    progress: Math.round((parseFloat(row.completed_hours) / parseFloat(row.target_hours)) * 100)
  }));
}

async function getStreakAnalytics(userId: string, days: number = 30): Promise<StreakData[]> {
  const startDate = subDays(new Date(), days);
  const endDate = new Date();

  // Get daily session data
  const streakQuery = `
    SELECT 
      DATE(ls.date) as session_date,
      COUNT(ls.id) > 0 as has_session
    FROM learning_sessions ls
    WHERE ls.user_id = $1
      AND ls.date >= $2
      AND ls.date <= $3
      AND ls.completed = true
    GROUP BY DATE(ls.date)
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
    const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';
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
      const totalXP = analyticsData.progress.reduce((sum: number, day: ProgressData) => sum + day.xp, 0);
      
      analyticsData.summary = {
        totalHours: Math.round(totalHours * 100) / 100,
        totalSessions,
        totalXP,
        averageSessionLength: totalSessions > 0 ? Math.round((totalHours / totalSessions) * 100) / 100 : 0
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