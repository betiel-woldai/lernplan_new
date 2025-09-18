import { useState, useCallback, useEffect } from 'react';
import { UserStats } from '../types';
import { getActiveUserId } from '@/utils/user';

export interface UseUserStatsReturn {
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
  addXP: (amount: number, reason: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useUserStats = (): UseUserStatsReturn => {
  const userId = getActiveUserId();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user stats from API
  const fetchUserStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🐛 useUserStats: Fetching user stats for ID:', userId);
      const response = await fetch(`/api/users/${userId}`);
      
      console.log('🐛 useUserStats: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🐛 useUserStats: Error response:', errorText);
        throw new Error(`Failed to fetch user stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('🐛 useUserStats: Received data:', data);
      
      // Convert date strings back to Date objects
      const statsWithDates = {
        ...data,
        createdAt: new Date(data.createdAt),
        lastActiveAt: new Date(data.lastActiveAt),
      };

      console.log('🐛 useUserStats: Setting user stats:', statsWithDates);
      setUserStats(statsWithDates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user stats';
      console.error('Failed to fetch user stats:', err);
      setError(errorMessage);
      
      // No fallback data - user needs to set up their account
      setUserStats(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
          userId,
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
  }, [userStats, fetchUserStats, userId]);

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
