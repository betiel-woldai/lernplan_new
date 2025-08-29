import { useState, useEffect, useCallback } from 'react';

export interface LearningSession {
  id: string;
  subjectId: string;
  userId: string;
  date: string;
  duration: number;
  completed: boolean;
  points: number;
  notes?: string;
  createdAt: string;
  subject?: {
    name: string;
    color: string;
  };
}

export interface CreateSessionData {
  subjectId: string;
  duration: number;
  date: string;
  notes?: string;
  completed?: boolean;
}

export interface UpdateSessionData {
  duration?: number;
  completed?: boolean;
  notes?: string;
  points?: number;
}

interface SessionsResponse {
  sessions: LearningSession[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface QueryParams {
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export function useLearningSessions(initialParams?: QueryParams) {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  const fetchSessions = useCallback(async (params?: QueryParams) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (params?.subjectId) queryParams.set('subjectId', params.subjectId);
      if (params?.startDate) queryParams.set('startDate', params.startDate);
      if (params?.endDate) queryParams.set('endDate', params.endDate);
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.offset) queryParams.set('offset', params.offset.toString());

      const response = await fetch(`/api/sessions?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch sessions' }));
        throw new Error(errorData.error || 'Failed to fetch sessions');
      }

      const data: SessionsResponse = await response.json();
      
      if (params?.offset && params.offset > 0) {
        // Append to existing sessions for pagination
        setSessions(prev => [...prev, ...data.sessions]);
      } else {
        // Replace sessions for new query
        setSessions(data.sessions);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (sessionData: CreateSessionData): Promise<LearningSession | null> => {
    setError(null);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create session' }));
        throw new Error(errorData.error || 'Failed to create session');
      }

      const { session } = await response.json();
      
      // Add new session to the top of the list
      setSessions(prev => [session, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      console.error('Create session error:', err);
      return null;
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, updateData: UpdateSessionData): Promise<LearningSession | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update session' }));
        throw new Error(errorData.error || 'Failed to update session');
      }

      const { session } = await response.json();
      
      // Update session in the list
      setSessions(prev => 
        prev.map(s => s.id === sessionId ? session : s)
      );
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      console.error('Update session error:', err);
      return null;
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete session' }));
        throw new Error(errorData.error || 'Failed to delete session');
      }

      // Remove session from the list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      console.error('Delete session error:', err);
      return false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    const newOffset = pagination.offset + pagination.limit;
    await fetchSessions({
      ...initialParams,
      offset: newOffset,
      limit: pagination.limit
    });
  }, [fetchSessions, initialParams, pagination, loading]);

  const refresh = useCallback(() => {
    fetchSessions(initialParams);
  }, [fetchSessions, initialParams]);

  // Load initial sessions
  useEffect(() => {
    fetchSessions(initialParams);
  }, [fetchSessions, initialParams]);

  return {
    sessions,
    loading,
    error,
    pagination,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    loadMore,
    refresh,
    clearError: () => setError(null)
  };
}