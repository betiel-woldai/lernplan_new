import { useState, useCallback, useEffect } from 'react';
import { CalendarSession } from '../types/calendar';
import { getActiveUserId } from '@/utils/user';

export interface UseCalendarSessionsReturn {
  sessions: CalendarSession[];
  loading: boolean;
  error: string | null;
  fetchSessionsForMonth: (year: number, month: number) => Promise<void>;
  fetchSessionsForDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  getSessionsForDate: (date: Date) => CalendarSession[];
  createSession: (sessionData: Omit<CalendarSession, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<CalendarSession>) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  refreshSessions: () => Promise<void>;
  syncFromSubjects: () => Promise<void>;
}

export const useCalendarSessions = (): UseCalendarSessionsReturn => {
  const userId = getActiveUserId();
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions for a specific month
  const fetchSessionsForMonth = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/calendar?userId=${userId}&year=${year}&month=${month}`);
      
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
  }, [userId]);

  // Fetch sessions for a date range
  const fetchSessionsForDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const response = await fetch(`/api/calendar?userId=${userId}&startDate=${startDateStr}&endDate=${endDateStr}`);
      
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
  }, [userId]);

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
        userId,
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
  }, [userId]);

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
        body: JSON.stringify({ userId })
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
  }, [refreshSessions, userId]);

  // Update a calendar session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<CalendarSession>): Promise<boolean> => {
    try {
      setError(null);

      // Prepare calendar session updates
      const calendarSessionUpdates: any = {};
      
      if (updates.completed !== undefined) {
        calendarSessionUpdates.completed = updates.completed;
      }
      
      if (updates.duration !== undefined) {
        calendarSessionUpdates.duration = Math.round(updates.duration);
      }
      
      if (updates.description !== undefined) {
        calendarSessionUpdates.description = updates.description;
      }
      
      if (updates.title !== undefined) {
        calendarSessionUpdates.title = updates.title;
      }
      
      if (updates.location !== undefined) {
        calendarSessionUpdates.location = updates.location;
      }
      
      if (updates.startTime !== undefined) {
        calendarSessionUpdates.startTime = updates.startTime;
      }
      
      if (updates.endTime !== undefined) {
        calendarSessionUpdates.endTime = updates.endTime;
      }

      // Call the calendar sessions API
      const response = await fetch(`/api/calendar/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarSessionUpdates),
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
          updates: calendarSessionUpdates,
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
            xpGained: updates.completed ? Math.floor((updates.duration || 0) * 2) : 0, // 2 XP per minute
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

  // Delete a calendar session
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/calendar?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete session' }));
        throw new Error(errorData.error || 'Failed to delete session');
      }

      // Remove the session from local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));

      // Dispatch event for calendar refresh
      window.dispatchEvent(new CustomEvent('sessionDeleted', {
        detail: { sessionId, timestamp: Date.now() }
      }));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      console.error('Delete calendar session error:', err);
      return false;
    }
  }, [userId]);

  // Listen for external session updates (e.g., from SessionEditModal)
  useEffect(() => {
    const handleExternalSessionUpdate = (event: any) => {
      const { sessionId, updates } = event.detail;
      console.log('📅 useCalendarSessions: External session update received', { sessionId, updates });
      
      // Update the session in our local state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, ...updates }
            : session
        )
      );
    };

    const handleSessionCompleted = async (event: any) => {
      console.log('📅 useCalendarSessions: Session completed event received', event.detail);

      const eventData = event.detail;

      // Create calendar session for the completed session if we have session data
      if (eventData.sessionData) {
        try {
          const sessionData = eventData.sessionData;
          const actualDuration = eventData.actualDuration;
          const plannedDuration = eventData.plannedDuration;

          const newSession = await createSession({
            title: `${sessionData.subjectName} Learning Session`,
            subjectId: sessionData.subjectId,
            startTime: new Date(sessionData.startTime),
            endTime: new Date(sessionData.endTime),
            type: 'study',
            description: `Completed learning session${actualDuration !== plannedDuration ? ` (planned: ${plannedDuration}min, actual: ${actualDuration}min)` : ''}`
          });

          // After creating, update with actual duration if different
          if (newSession && actualDuration && actualDuration !== plannedDuration) {
            try {
              await updateSession(newSession.id, {
                actualDuration: actualDuration,
                completed: true
              });
              console.log('📅 Calendar session updated with actual duration');
            } catch (updateError) {
              console.warn('📅 Failed to update calendar session with actual duration:', updateError);
            }
          }

          console.log('📅 Calendar session created successfully from completed session');
        } catch (calendarError) {
          console.error('📅 Failed to create calendar session from completed session:', calendarError);
        }
      }

      // Refresh calendar data to show any updates
      try {
        await refreshSessions();
        console.log('📅 Calendar refreshed after session completion');
      } catch (error) {
        console.error('📅 Failed to refresh calendar after session completion:', error);
      }
    };

    const handleSessionStarted = (event: any) => {
      console.log('📅 useCalendarSessions: Session started event received', event.detail);
      // Optional: Could be used to show live session indicators
    };

    window.addEventListener('sessionUpdated', handleExternalSessionUpdate);
    window.addEventListener('sessionCompleted', handleSessionCompleted);
    window.addEventListener('sessionStarted', handleSessionStarted);

    return () => {
      window.removeEventListener('sessionUpdated', handleExternalSessionUpdate);
      window.removeEventListener('sessionCompleted', handleSessionCompleted);
      window.removeEventListener('sessionStarted', handleSessionStarted);
    };
  }, [refreshSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessionsForMonth,
    fetchSessionsForDateRange,
    getSessionsForDate,
    createSession,
    updateSession,
    deleteSession,
    refreshSessions,
    syncFromSubjects,
  };
};

export default useCalendarSessions;
