import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { z } from 'zod';

const calendarSessionSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)),
  sessionType: z.enum(['study', 'exam', 'break', 'assignment']).default('study'),
  description: z.string().optional(),
  location: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getCalendarSessions(req, res);
      case 'POST':
        return await createCalendarSession(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Calendar API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCalendarSessions(req: NextApiRequest, res: NextApiResponse) {
  const { userId, startDate, endDate, month, year } = req.query;

  // Use default user until authentication is implemented
  const userIdToUse = userId as string || '62d1b19b-3874-43b1-9424-ca7c2de10557';

  let dateFilter = '';
  const params: any[] = [userIdToUse];

  if (startDate && endDate) {
    dateFilter = 'AND DATE(cs.start_time) BETWEEN $2 AND $3';
    params.push(startDate, endDate);
  } else if (month && year) {
    // Filter by month and year
    dateFilter = 'AND EXTRACT(MONTH FROM cs.start_time) = $2 AND EXTRACT(YEAR FROM cs.start_time) = $3';
    params.push(parseInt(month as string), parseInt(year as string));
  }

  const result = await query(`
    SELECT 
      cs.id,
      cs.title,
      cs.start_time as "startTime",
      cs.end_time as "endTime",
      cs.duration,
      cs.session_type as "sessionType",
      cs.completed,
      cs.description,
      cs.location,
      cs.created_at as "createdAt",
      cs.updated_at as "updatedAt",
      -- Subject information
      s.id as "subjectId",
      s.name as "subjectName",
      s.color as "subjectColor"
    FROM calendar_sessions cs
    JOIN subjects s ON cs.subject_id = s.id
    WHERE cs.user_id = $1 ${dateFilter}
    ORDER BY cs.start_time ASC
  `, params);

  // Convert dates and calculate duration
  const sessions = result.rows.map(session => ({
    ...session,
    startTime: session.startTime?.toISOString(),
    endTime: session.endTime?.toISOString(),
    createdAt: session.createdAt?.toISOString(),
    updatedAt: session.updatedAt?.toISOString(),
  }));

  return res.status(200).json(sessions);
}

async function createCalendarSession(req: NextApiRequest, res: NextApiResponse) {
  const validation = calendarSessionSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validation.error.errors 
    });
  }

  const data = validation.data;
  const userId = req.body.userId || '62d1b19b-3874-43b1-9424-ca7c2de10557';

  // Validate that start time is before end time
  if (data.startTime >= data.endTime) {
    return res.status(400).json({ error: 'Start time must be before end time' });
  }

  // Calculate duration in minutes
  const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60));

  // Verify subject exists and belongs to user
  const subjectCheck = await query(
    'SELECT id FROM subjects WHERE id = $1 AND user_id = $2',
    [data.subjectId, userId]
  );

  if (subjectCheck.rows.length === 0) {
    return res.status(400).json({ error: 'Subject not found or does not belong to user' });
  }

  const result = await query(`
    INSERT INTO calendar_sessions (
      user_id, subject_id, title, start_time, end_time, duration,
      session_type, description, location
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING 
      id,
      title,
      start_time as "startTime",
      end_time as "endTime",
      duration,
      session_type as "sessionType",
      completed,
      description,
      location,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [
    userId,
    data.subjectId,
    data.title,
    data.startTime,
    data.endTime,
    duration,
    data.sessionType,
    data.description || null,
    data.location || null
  ]);

  const session = result.rows[0];

  // Get subject information for response
  const subjectInfo = await query(
    'SELECT id as "subjectId", name as "subjectName", color as "subjectColor" FROM subjects WHERE id = $1',
    [data.subjectId]
  );

  const responseSession = {
    ...session,
    ...subjectInfo.rows[0],
    startTime: session.startTime?.toISOString(),
    endTime: session.endTime?.toISOString(),
    createdAt: session.createdAt?.toISOString(),
    updatedAt: session.updatedAt?.toISOString(),
  };

  return res.status(201).json(responseSession);
}