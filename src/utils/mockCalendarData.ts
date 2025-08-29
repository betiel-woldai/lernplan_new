import { CalendarSession } from '../types/calendar';

// Empty calendar sessions - ready for user to add their sessions
export const mockCalendarSessions: CalendarSession[] = [];

// Helper function to get sessions for a specific date
export const getSessionsForDate = (date: Date): CalendarSession[] => {
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  return mockCalendarSessions.filter(session => {
    const sessionDate = new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate());
    return sessionDate.getTime() === targetDate.getTime();
  });
};

// Helper function to get sessions for a date range
export const getSessionsForDateRange = (startDate: Date, endDate: Date): CalendarSession[] => {
  return mockCalendarSessions.filter(session => {
    const sessionDate = new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate());
    return sessionDate >= startDate && sessionDate <= endDate;
  });
};

// Helper function to format session time
export const formatSessionTime = (session: CalendarSession): string => {
  const start = session.startTime.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const end = session.endTime.toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `${start} - ${end}`;
};