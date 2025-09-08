import { CalendarSession } from '../types/calendar';
import { EnhancedSubject, SubjectTask } from '../types/tasks';
import { Subject } from '../types';

export interface CalendarEventGeneratorOptions {
  includeExams: boolean;
  includeTaskDeadlines: boolean;
  includeStudySessions: boolean;
  studySessionsWeeksAhead: number;
}

const DEFAULT_OPTIONS: CalendarEventGeneratorOptions = {
  includeExams: true,
  includeTaskDeadlines: true,
  includeStudySessions: false, // Focus only on important dates
  studySessionsWeeksAhead: 2
};

export function generateCalendarEventsFromSubjects(
  subjects: (Subject & { tasks?: SubjectTask[] })[],
  options: CalendarEventGeneratorOptions = DEFAULT_OPTIONS
): CalendarSession[] {
  const events: CalendarSession[] = [];

  subjects.forEach(subject => {
    // Generate exam events
    if (options.includeExams) {
      const examEvent = generateExamEvent(subject);
      if (examEvent) {
        events.push(examEvent);
      }
    }

    // Generate task deadline events
    if (options.includeTaskDeadlines && subject.tasks) {
      subject.tasks.forEach(task => {
        if (task.dueDate) {
          events.push(generateTaskDeadlineEvent(task, subject));
        }
      });
    }

    // Generate study sessions (optional, for scheduling regular study time)
    if (options.includeStudySessions) {
      const studySessions = generateStudySessionsForSubject(subject, options.studySessionsWeeksAhead);
      events.push(...studySessions);
    }
  });

  return events;
}

export function generateExamEvent(subject: Subject): CalendarSession | null {
  if (!subject.examDate) return null;
  
  // Generate a deterministic UUID based on subject ID and exam type
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(`exam-${subject.id}`).digest('hex');
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
  
  return {
    id: uuid,
    title: `${subject.name} Final Exam`,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectColor: subject.color,
    startTime: new Date(subject.examDate.getTime()),
    endTime: new Date(subject.examDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours
    duration: 180, // 3 hours in minutes
    completed: false,
    type: 'exam',
    description: `Final examination for ${subject.name}`
  };
}

export function generateTaskDeadlineEvent(task: SubjectTask, subject: Subject): CalendarSession {
  return {
    id: `task-${task.id}`,
    title: `${subject.name} ${task.title} Due`,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectColor: subject.color,
    startTime: new Date(task.dueDate.getTime()),
    endTime: new Date(task.dueDate.getTime() + 60 * 60 * 1000), // 1 hour for deadline
    duration: 60,
    completed: task.status === 'completed',
    type: 'assignment',
    description: task.description || `${task.type} assignment for ${subject.name}`
  };
}

function generateStudySessionsForSubject(subject: Subject, weeksAhead: number): CalendarSession[] {
  const sessions: CalendarSession[] = [];
  const sessionDuration = 90; // 1.5 hours per session
  const now = new Date();
  const endDate = new Date(now.getTime() + weeksAhead * 7 * 24 * 60 * 60 * 1000);

  // Generate sessions based on subject's schedule (days_per_week, hours_per_week)
  const sessionsPerWeek = subject.daysPerWeek;
  const hoursPerSession = subject.hoursPerWeek / sessionsPerWeek;
  
  let currentDate = new Date(now);
  let sessionCount = 0;

  while (currentDate <= endDate) {
    // Generate sessions for this week (Mon-Fri)
    for (let dayOffset = 0; dayOffset < 7 && sessionCount < sessionsPerWeek; dayOffset++) {
      const sessionDate = new Date(currentDate);
      sessionDate.setDate(sessionDate.getDate() + dayOffset);
      
      // Skip weekends for regular study sessions
      if (sessionDate.getDay() === 0 || sessionDate.getDay() === 6) continue;
      
      // Set to 14:00 (2 PM) as default study time
      sessionDate.setHours(14, 0, 0, 0);
      
      const endTime = new Date(sessionDate.getTime() + hoursPerSession * 60 * 60 * 1000);
      
      sessions.push({
        id: `study-${subject.id}-${sessionDate.toISOString().split('T')[0]}-${sessionCount}`,
        title: `${subject.name} Study Session`,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color,
        startTime: sessionDate,
        endTime: endTime,
        duration: Math.round(hoursPerSession * 60),
        completed: false,
        type: 'study',
        description: `Regular study session for ${subject.name}`
      });
      
      sessionCount++;
    }
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
    sessionCount = 0;
  }

  return sessions;
}