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

// TODO(human): Implement the main calendar event generation logic
export function generateCalendarEventsFromSubjects(
  subjects: (Subject & { tasks?: SubjectTask[] })[],
  options: CalendarEventGeneratorOptions = DEFAULT_OPTIONS
): CalendarSession[] {
  // TODO(human): Filter and transform subjects into calendar events
  // Should return events for:
  // 1. Final exams (from subject.examDate) 
  // 2. Task deadlines (from subject.tasks with due dates)
  // Each event should have proper CalendarSession format with:
  // - Descriptive title (e.g., "Math Final Exam", "Physics Essay Due") 
  // - Correct type ('exam' or 'assignment')
  // - Subject color and name
  // - Appropriate duration (exams: 3 hours, tasks: 1 hour for deadline reminder)
  return [];
}

export function generateExamEvent(subject: Subject): CalendarSession | null {
  if (!subject.examDate) return null;
  
  return {
    id: `exam-${subject.id}`,
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