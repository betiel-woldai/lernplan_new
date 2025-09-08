import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { generateCalendarEventsFromSubjects } from '@/utils/calendarEventGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.body.userId || '62d1b19b-3874-43b1-9424-ca7c2de10557';

    // Step 1: Clean all existing calendar sessions
    await query('DELETE FROM calendar_sessions WHERE user_id = $1', [userId]);

    // Step 2: Get all subjects for the user
    const subjectsResult = await query(`
      SELECT 
        id, user_id as "userId", name, color, start_date as "startDate",
        exam_date as "examDate", hours_per_week as "hoursPerWeek",
        days_per_week as "daysPerWeek", intensity_weeks as "intensityWeeks",
        completed_hours as "completedHours", target_hours as "targetHours"
      FROM subjects 
      WHERE user_id = $1
    `, [userId]);

    // Step 3: Generate and insert calendar events for each subject
    let totalEvents = 0;
    for (const subject of subjectsResult.rows) {
      const calendarEvents = generateCalendarEventsFromSubjects([subject], {
        includeExams: true,
        includeTaskDeadlines: true,
        includeStudySessions: true,
        studySessionsWeeksAhead: 4  // Generate 4 weeks ahead of study sessions
      });

      for (const event of calendarEvents) {
        await query(`
          INSERT INTO calendar_sessions (
            id, subject_id, user_id, title, start_time, end_time, 
            duration, session_type, completed, description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          event.id,
          event.subjectId,
          userId,
          event.title,
          event.startTime,
          event.endTime,
          event.duration,
          event.type,
          event.completed,
          event.description || null
        ]);
        totalEvents++;
      }
    }

    return res.status(200).json({ 
      message: 'Calendar synchronized successfully',
      subjects: subjectsResult.rows.length,
      events: totalEvents
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}