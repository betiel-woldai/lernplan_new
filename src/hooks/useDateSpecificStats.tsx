import { useState, useEffect, useCallback } from 'react';

interface DateSpecificStats {
  selectedDate: string;
  isToday: boolean;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  completionRate: number;
  completedDuration: number; // in minutes
  streakDays: number; // streak counting backwards from selected date
  thisWeekSessions: number;
  thisWeekCompleted: number;
  thisWeekCompletedDuration: number; // in minutes
  formattedDuration: string; // e.g. "2h 30m"
  formattedWeeklyDuration: string; // e.g. "15h 45m"
}

export function useDateSpecificStats(selectedDate: Date | null = null) {
  const [stats, setStats] = useState<DateSpecificStats>({
    selectedDate: '',
    isToday: true,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    completionRate: 0,
    completedDuration: 0,
    streakDays: 0,
    thisWeekSessions: 0,
    thisWeekCompleted: 0,
    thisWeekCompletedDuration: 0,
    formattedDuration: '0h 0m',
    formattedWeeklyDuration: '0h 0m'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDateStats = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      // Format date to YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];

      const response = await fetch(`/api/date-specific-stats?date=${dateStr}`);
      if (!response.ok) {
        throw new Error('Failed to fetch date-specific stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch date-specific stats';
      setError(errorMessage);
      console.error('Date-specific stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for session status changes to refresh stats
  useEffect(() => {
    const handleSessionChange = () => {
      if (selectedDate) {
        fetchDateStats(selectedDate);
      }
    };

    window.addEventListener('sessionStatusToggled', handleSessionChange);
    window.addEventListener('sessionCompleted', handleSessionChange);
    window.addEventListener('sessionCreated', handleSessionChange);
    window.addEventListener('sessionDeleted', handleSessionChange);
    window.addEventListener('sessionUpdated', handleSessionChange);
    window.addEventListener('sessionHistoryCleared', handleSessionChange);
    window.addEventListener('sessionIncomplete', handleSessionChange);

    return () => {
      window.removeEventListener('sessionStatusToggled', handleSessionChange);
      window.removeEventListener('sessionCompleted', handleSessionChange);
      window.removeEventListener('sessionCreated', handleSessionChange);
      window.removeEventListener('sessionDeleted', handleSessionChange);
      window.removeEventListener('sessionUpdated', handleSessionChange);
      window.removeEventListener('sessionHistoryCleared', handleSessionChange);
      window.removeEventListener('sessionIncomplete', handleSessionChange);
    };
  }, [selectedDate, fetchDateStats]);

  // Fetch stats when selectedDate changes
  useEffect(() => {
    const dateToUse = selectedDate || new Date(); // Default to today if no date selected
    fetchDateStats(dateToUse);
  }, [selectedDate, fetchDateStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: () => {
      const dateToUse = selectedDate || new Date();
      fetchDateStats(dateToUse);
    }
  };
}