import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { query } from '@/lib/db';
import { z } from 'zod';
import { generateCalendarEventsFromSubjects } from '@/utils/calendarEventGenerator';
import { hasCalendarMetadataColumns, hasSubjectTypeColumn } from '@/lib/schemaMetadata';
import { isAdministrativeSubject } from '@/lib/subjects/type';

// Validation schema for creating/updating subjects
const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
  startDate: z.string().transform(str => new Date(str)),
  examDate: z.string().transform(str => new Date(str)).optional(),
  hoursPerWeek: z.number().min(1).max(168),
  daysPerWeek: z.number().min(1).max(7),
  intensityWeeks: z.number().min(1).max(52).default(2),
  targetHours: z.number().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getSubjects(req, res);
      case 'POST':
        return await createSubject(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Subjects API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSubjects(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const authSession = await getServerSession(req, res, authOptions);
  if (!authSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userIdToUse = authSession.sub;
  if (!userIdToUse) {
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  const hasType = await hasSubjectTypeColumn();

  const result = await query(
    `SELECT 
       id,
       user_id as "userId",
       name,
       color,
       start_date as "startDate",
       exam_date as "examDate",
       hours_per_week as "hoursPerWeek",
       days_per_week as "daysPerWeek",
       intensity_weeks as "intensityWeeks",
       completed_hours as "completedHours",
       target_hours as "targetHours",
       ${hasType ? 'subject_type as "subjectType",' : ''}
       created_at as "createdAt",
       updated_at as "updatedAt"
     FROM subjects 
     WHERE user_id = $1
     ${hasType ? "AND subject_type <> 'administrative'" : ''}
     ORDER BY created_at DESC`,
    [userIdToUse]
  );

  // Convert dates to ISO strings for JSON serialization
  // Fallback filtering when subject_type column is absent
  const filtered = hasType
    ? result.rows
    : result.rows.filter(s => !isAdministrativeSubject({ name: s.name }, false));

  const subjects = filtered.map(subject => ({
    id: subject.id,
    userId: subject.userId,
    name: subject.name,
    color: subject.color,
    startDate: subject.startDate?.toISOString(),
    examDate: subject.examDate?.toISOString(),
    hoursPerWeek: subject.hoursPerWeek,
    daysPerWeek: subject.daysPerWeek,
    intensityWeeks: subject.intensityWeeks,
    completedHours: subject.completedHours,
    targetHours: subject.targetHours,
    createdAt: subject.createdAt?.toISOString(),
    updatedAt: subject.updatedAt?.toISOString(),
  }));

  return res.status(200).json(subjects);
}

async function createSubject(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const authSession = await getServerSession(req, res, authOptions);
  if (!authSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = authSession.sub;
  if (!userId) {
    return res.status(400).json({ error: 'User ID not found in session' });
  }

  const validation = subjectSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.error.issues
    });
  }

  const data = validation.data;

  const result = await query(`
    INSERT INTO subjects (
      user_id, name, color, start_date, exam_date, 
      hours_per_week, days_per_week, intensity_weeks, 
      completed_hours, target_hours
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING 
      id,
      user_id as "userId",
      name,
      color,
      start_date as "startDate",
      exam_date as "examDate",
      hours_per_week as "hoursPerWeek",
      days_per_week as "daysPerWeek",
      intensity_weeks as "intensityWeeks",
      completed_hours as "completedHours",
      target_hours as "targetHours",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [
    userId,
    data.name,
    data.color,
    data.startDate,
    data.examDate || null,
    data.hoursPerWeek,
    data.daysPerWeek,
    data.intensityWeeks,
    0, // completedHours starts at 0
    data.targetHours
  ]);

  const subject = result.rows[0];
  
  // Generate and save calendar events for the new subject
  await syncSubjectToCalendar(subject);
  
  // Convert dates for JSON serialization
  const responseSubject = {
    ...subject,
    startDate: subject.startDate?.toISOString(),
    examDate: subject.examDate?.toISOString(),
    createdAt: subject.createdAt?.toISOString(),
    updatedAt: subject.updatedAt?.toISOString(),
  };

  return res.status(201).json(responseSubject);
}

async function syncSubjectToCalendar(subject: any) {
  // Convert database subject format to Subject interface format
  const formattedSubject = {
    id: subject.id,
    userId: subject.userId,
    name: subject.name,
    color: subject.color,
    startDate: subject.startDate,
    examDate: subject.examDate,
    hoursPerWeek: subject.hoursPerWeek,
    daysPerWeek: subject.daysPerWeek,
    intensityWeeks: subject.intensityWeeks,
    completedHours: subject.completedHours,
    targetHours: subject.targetHours
  };

  // Generate calendar events (exams, assignments, and study sessions)
  const calendarEvents = generateCalendarEventsFromSubjects([formattedSubject], {
    includeExams: true,
    includeTaskDeadlines: true,
    includeStudySessions: true,
    studySessionsWeeksAhead: 4  // Generate 4 weeks ahead of study sessions
  });

  const hasMetadata = await hasCalendarMetadataColumns();

  // Save calendar events to database
  for (const event of calendarEvents) {
    if (hasMetadata) {
      await query(
        `INSERT INTO calendar_sessions (
           id, subject_id, user_id, title, start_time, end_time,
           planned_duration, session_type, completed, description,
           is_auto_generated, source_subject_exam_id, scheduling_priority
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           planned_duration = EXCLUDED.planned_duration,
           is_auto_generated = EXCLUDED.is_auto_generated,
           source_subject_exam_id = EXCLUDED.source_subject_exam_id,
           scheduling_priority = EXCLUDED.scheduling_priority,
           updated_at = NOW()
        `,
        [
          event.id,
          event.subjectId,
          subject.userId,
          event.title,
          event.startTime,
          event.endTime,
          event.plannedDuration ?? event.duration,
          event.type,
          event.completed,
          event.description || null,
          event.isAutoGenerated ?? false,
          event.sourceSubjectExamId || null,
          event.schedulingPriority ?? 0
        ]
      );
      continue;
    }

    await query(
      `INSERT INTO calendar_sessions (
         id, subject_id, user_id, title, start_time, end_time,
         planned_duration, session_type, completed, description
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time,
         planned_duration = EXCLUDED.planned_duration,
         updated_at = NOW()
      `,
      [
        event.id,
        event.subjectId,
        subject.userId,
        event.title,
        event.startTime,
        event.endTime,
        event.plannedDuration ?? event.duration,
        event.type,
        event.completed,
        event.description || null
      ]
    );
  }
}
