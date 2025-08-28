import { useState, useCallback, useEffect } from 'react';
import { UserStats } from '../types';

// Default user ID until authentication is implemented
const DEFAULT_USER_ID = '62d1b19b-3874-43b1-9424-ca7c2de10557';

export interface UseUserStatsReturn {
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
  addXP: (amount: number, reason: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useUserStats = (): UseUserStatsReturn => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user stats from API
  const fetchUserStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${DEFAULT_USER_ID}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const statsWithDates = {
        ...data,
        createdAt: new Date(data.createdAt),
        lastActiveAt: new Date(data.lastActiveAt),
      };

      setUserStats(statsWithDates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user stats';
      console.error('Failed to fetch user stats:', err);
      setError(errorMessage);
      
      // Set fallback mock data if API fails
      setUserStats({
        id: 'default-user',
        name: 'Max Mustermann',
        email: 'max@example.com',
        currentLevel: 8,
        currentXP: 1250,
        nextLevelXP: 1600,
        learningStreak: 12,
        dailyLearningTime: 87, // minutes
        weeklyLearningTime: 420, // minutes
        totalHours: 25,
        completedTasks: 3,
        totalCompletedTasks: 48,
        achievements: [
          { id: '1', name: 'First Steps', icon: '🏆', category: 'tasks', unlockedAt: new Date(), isNew: false },
          { id: '2', name: 'Week Warrior', icon: '⚡', category: 'streak', unlockedAt: new Date(), isNew: false },
          { id: '3', name: 'Study Master', icon: '🎓', category: 'time', unlockedAt: new Date(), isNew: true }
        ],
        createdAt: new Date(),
        lastActiveAt: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Add XP through API
  const addXP = useCallback(async (amount: number, reason: string) => {
    try {
      setError(null);

      const response = await fetch('/api/gamification/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
          xpGain: amount,
          reason,
          metadata: {
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add XP');
      }

      const xpResult = await response.json();
      
      // Update local stats with new XP and level
      if (userStats) {
        setUserStats(prev => prev ? {
          ...prev,
          currentXP: xpResult.newXP,
          currentLevel: xpResult.newLevel,
          nextLevelXP: xpResult.nextLevelXP,
          lastActiveAt: new Date()
        } : null);
      }

      // If level up occurred, refresh full stats to get new achievements
      if (xpResult.leveledUp) {
        await fetchUserStats();
      }

      return xpResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add XP';
      setError(errorMessage);
      throw err;
    }
  }, [userStats, fetchUserStats]);

  // Refresh stats from API
  const refreshStats = useCallback(async () => {
    await fetchUserStats();
  }, [fetchUserStats]);

  // Load stats on mount
  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return {
    userStats,
    loading,
    error,
    addXP,
    refreshStats,
  };
};

export default useUserStats;