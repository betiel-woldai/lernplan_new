import { useState, useEffect, useCallback } from 'react';

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  completionRate: number;
  todaySessions: number;
  todayCompleted: number;
  thisWeekSessions: number;
  thisWeekCompleted: number;
}

export function useSessionStats() {
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    completionRate: 0,
    todaySessions: 0,
    todayCompleted: 0,
    thisWeekSessions: 0,
    thisWeekCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/session-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch session stats');
      }

      const data = await response.json();
      setSessionStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session stats';
      setError(errorMessage);
      console.error('Session stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for session status changes
  useEffect(() => {
    const handleSessionChange = () => {
      fetchSessionStats();
    };

    window.addEventListener('sessionStatusToggled', handleSessionChange);
    window.addEventListener('sessionCompleted', handleSessionChange);
    window.addEventListener('sessionCreated', handleSessionChange);
    window.addEventListener('sessionDeleted', handleSessionChange);
    window.addEventListener('sessionUpdated', handleSessionChange);
    window.addEventListener('sessionHistoryCleared', handleSessionChange);

    return () => {
      window.removeEventListener('sessionStatusToggled', handleSessionChange);
      window.removeEventListener('sessionCompleted', handleSessionChange);
      window.removeEventListener('sessionCreated', handleSessionChange);
      window.removeEventListener('sessionDeleted', handleSessionChange);
      window.removeEventListener('sessionUpdated', handleSessionChange);
      window.removeEventListener('sessionHistoryCleared', handleSessionChange);
    };
  }, [fetchSessionStats]);

  // Initial load
  useEffect(() => {
    fetchSessionStats();
  }, [fetchSessionStats]);

  return {
    sessionStats,
    loading,
    error,
    refreshStats: fetchSessionStats
  };
}