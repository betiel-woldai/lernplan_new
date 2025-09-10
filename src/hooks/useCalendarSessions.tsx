import { useState, useCallback, useEffect } from 'react';
import { CalendarSession } from '../types/calendar';

// Default user ID until authentication is implemented
const DEFAULT_USER_ID = '62d1b19b-3874-43b1-9424-ca7c2de10557';

export interface UseCalendarSessionsReturn {
  sessions: CalendarSession[];
  loading: boolean;
  error: string | null;
  fetchSessionsForMonth: (year: number, month: number) => Promise<void>;
  fetchSessionsForDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  getSessionsForDate: (date: Date) => CalendarSession[];
  createSession: (sessionData: Omit<CalendarSession, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<CalendarSession>) => Promise<boolean>;
  refreshSessions: () => Promise<void>;
  syncFromSubjects: () => Promise<void>;
}

export const useCalendarSessions = (): UseCalendarSessionsReturn => {
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions for a specific month
  const fetchSessionsForMonth = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/calendar?userId=${DEFAULT_USER_ID}&year=${year}&month=${month}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar sessions: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const sessionsWithDates = data.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      }));

      setSessions(sessionsWithDates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load calendar sessions';
      console.error('Failed to fetch calendar sessions:', err);
      setError(errorMessage);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sessions for a date range
  const fetchSessionsForDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await fetch(`/api/calendar?userId=${DEFAULT_USER_ID}&startDate=${startDateStr}&endDate=${endDateStr}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar sessions: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const sessionsWithDates = data.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      }));

      setSessions(sessionsWithDates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load calendar sessions';
      console.error('Failed to fetch calendar sessions:', err);
      setError(errorMessage);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get sessions for a specific date (from loaded sessions)
  const getSessionsForDate = useCallback((date: Date): CalendarSession[] => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate());
      return sessionDate.getTime() === targetDate.getTime();
    });
  }, [sessions]);

  // Create new calendar session
  const createSession = useCallback(async (sessionData: Omit<CalendarSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        userId: DEFAULT_USER_ID,
        subjectId: sessionData.subjectId,
        title: sessionData.title,
        startTime: sessionData.startTime.toISOString(),
        endTime: sessionData.endTime.toISOString(),
        sessionType: sessionData.type,
        description: sessionData.description,
        location: sessionData.location,
      };

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const newSession = await response.json();
      
      // Convert dates and add to local state
      const sessionWithDates = {
        ...newSession,
        startTime: new Date(newSession.startTime),
        endTime: new Date(newSession.endTime),
      };

      setSessions(prev => [...prev, sessionWithDates]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh current sessions
  const refreshSessions = useCallback(async () => {
    // Reload current month's sessions
    const now = new Date();
    await fetchSessionsForMonth(now.getFullYear(), now.getMonth() + 1);
  }, [fetchSessionsForMonth]);

  // Force refresh when subjects are updated (for external sync)
  const syncFromSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First trigger backend sync
      const syncResponse = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DEFAULT_USER_ID })
      });
      
      if (!syncResponse.ok) {
        throw new Error('Failed to sync calendar');
      }
      
      // Then refresh local data
      await refreshSessions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync calendar';
      setError(errorMessage);
      console.error('Calendar sync error:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshSessions]);

  // Update a calendar session (maps to learning sessions API)
  const updateSession = useCallback(async (sessionId: string, updates: Partial<CalendarSession>): Promise<boolean> => {
    try {
      setError(null);

      // Convert CalendarSession updates to LearningSession format
      const learningSessionUpdates: any = {};
      
      if (updates.completed !== undefined) {
        learningSessionUpdates.completed = updates.completed;
        // Calculate points if marking as completed
        if (updates.completed && updates.duration) {
          learningSessionUpdates.points = Math.floor(updates.duration * 2); // 2 XP per minute
        }
      }
      
      if (updates.duration !== undefined) {
        learningSessionUpdates.duration = Math.round(updates.duration);
      }
      
      if (updates.description !== undefined) {
        learningSessionUpdates.notes = updates.description;
      }


      // Call the learning sessions API
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(learningSessionUpdates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update session' }));
        throw new Error(errorData.error || 'Failed to update session');
      }

      // Update the local calendar session state
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, ...updates }
            : session
        )
      );

      // Dispatch the sessionUpdated event for cross-view synchronization
      window.dispatchEvent(new CustomEvent('sessionUpdated', {
        detail: {
          sessionId,
          updates: learningSessionUpdates,
          timestamp: Date.now(),
          completionChanged: updates.completed !== undefined,
          wasCompleted: updates.completed
        }
      }));

      // Also trigger a more specific event for completion status changes
      if (updates.completed !== undefined) {
        const eventName = updates.completed ? 'sessionCompleted' : 'sessionIncomplete';
        window.dispatchEvent(new CustomEvent(eventName, {
          detail: {
            sessionId,
            completed: updates.completed,
            xpGained: updates.completed ? (learningSessionUpdates.points || 0) : 0,
            timestamp: Date.now()
          }
        }));
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      console.error('Update calendar session error:', err);
      return false;
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessionsForMonth,
    fetchSessionsForDateRange,
    getSessionsForDate,
    createSession,
    updateSession,
    refreshSessions,
    syncFromSubjects,
  };
};

export default useCalendarSessions;