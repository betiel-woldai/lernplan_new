import { CalendarSession } from '../types/calendar';

// Mock calendar sessions for demonstration
export const mockCalendarSessions: CalendarSession[] = [
  // This week sessions
  {
    id: 'session-1',
    title: 'Linear Algebra Study',
    subjectId: 'math-1',
    subjectName: 'Mathematics',
    subjectColor: '#3B82F6',
    startTime: new Date(2024, 7, 28, 9, 0), // Today 9:00 AM
    endTime: new Date(2024, 7, 28, 11, 0), // Today 11:00 AM
    duration: 120,
    completed: true,
    type: 'study',
    description: 'Review matrix operations and eigenvalues'
  },
  {
    id: 'session-2', 
    title: 'Quantum Mechanics Exam',
    subjectId: 'physics-1',
    subjectName: 'Physics',
    subjectColor: '#10B981',
    startTime: new Date(2024, 7, 29, 14, 0), // Tomorrow 2:00 PM
    endTime: new Date(2024, 7, 29, 16, 0), // Tomorrow 4:00 PM
    duration: 120,
    completed: false,
    type: 'exam',
    location: 'Room 101',
    description: 'Final exam on quantum mechanics principles'
  },
  {
    id: 'session-3',
    title: 'Organic Chemistry Lab',
    subjectId: 'chemistry-1', 
    subjectName: 'Chemistry',
    subjectColor: '#F59E0B',
    startTime: new Date(2024, 7, 30, 10, 0), // Friday 10:00 AM
    endTime: new Date(2024, 7, 30, 12, 0), // Friday 12:00 PM
    duration: 120,
    completed: false,
    type: 'study',
    location: 'Chemistry Lab A',
    description: 'Synthesis and analysis of organic compounds'
  },
  {
    id: 'session-4',
    title: 'Math Assignment Due',
    subjectId: 'math-1',
    subjectName: 'Mathematics', 
    subjectColor: '#3B82F6',
    startTime: new Date(2024, 7, 31, 23, 59), // Saturday end of day
    endTime: new Date(2024, 7, 31, 23, 59),
    duration: 0,
    completed: false,
    type: 'assignment',
    description: 'Problem set on differential equations'
  },
  // Next week sessions
  {
    id: 'session-5',
    title: 'Physics Study Group',
    subjectId: 'physics-1',
    subjectName: 'Physics',
    subjectColor: '#10B981', 
    startTime: new Date(2024, 8, 2, 16, 0), // Next Monday 4:00 PM
    endTime: new Date(2024, 8, 2, 18, 0), // Next Monday 6:00 PM
    duration: 120,
    completed: false,
    type: 'study',
    location: 'Library Study Room 3',
    description: 'Group study for thermodynamics'
  },
  {
    id: 'session-6',
    title: 'Chemistry Break',
    subjectId: 'chemistry-1',
    subjectName: 'Chemistry',
    subjectColor: '#F59E0B',
    startTime: new Date(2024, 8, 4, 15, 0), // Next Wednesday 3:00 PM  
    endTime: new Date(2024, 8, 4, 15, 30), // Next Wednesday 3:30 PM
    duration: 30,
    completed: false,
    type: 'break',
    description: 'Quick review break between lectures'
  },
  // This month - more sessions
  {
    id: 'session-7',
    title: 'Advanced Calculus',
    subjectId: 'math-1', 
    subjectName: 'Mathematics',
    subjectColor: '#3B82F6',
    startTime: new Date(2024, 8, 10, 13, 0), // Sept 10, 1:00 PM
    endTime: new Date(2024, 8, 10, 15, 0), // Sept 10, 3:00 PM
    duration: 120,
    completed: false,
    type: 'study',
    description: 'Integration techniques and applications'
  },
  {
    id: 'session-8',
    title: 'Final Physics Exam',
    subjectId: 'physics-1',
    subjectName: 'Physics', 
    subjectColor: '#10B981',
    startTime: new Date(2024, 8, 15, 9, 0), // Sept 15, 9:00 AM
    endTime: new Date(2024, 8, 15, 12, 0), // Sept 15, 12:00 PM
    duration: 180,
    completed: false,
    type: 'exam',
    location: 'Main Auditorium',
    description: 'Comprehensive final exam covering all topics'
  }
];

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