// Calendar and session types for the interactive calendar component

export interface CalendarSession {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  completed: boolean;
  description?: string;
  type: 'study' | 'exam' | 'break' | 'assignment';
  location?: string;
}

export interface CalendarDay {
  date: Date;
  sessions: CalendarSession[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface CalendarWeek {
  weekNumber: number;
  days: CalendarDay[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
}

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarViewState {
  currentView: CalendarView;
  currentDate: Date;
  selectedDate: Date | null;
}

export interface SessionCreateData {
  title: string;
  subjectId: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  date: Date;
  type: CalendarSession['type'];
  description?: string;
  location?: string;
}

export interface CalendarEventHandlers {
  onSessionClick: (session: CalendarSession) => void;
  onDateClick: (date: Date) => void;
  onSessionCreate: (data: SessionCreateData) => void;
  onSessionEdit: (sessionId: string, data: Partial<CalendarSession>) => void;
  onSessionDelete: (sessionId: string) => void;
  onViewChange: (view: CalendarView) => void;
  onSessionRightClick?: (session: CalendarSession, event: React.MouseEvent) => void;
  onSessionDuplicate?: (session: CalendarSession) => void;
  onSessionReschedule?: (session: CalendarSession) => void;
}