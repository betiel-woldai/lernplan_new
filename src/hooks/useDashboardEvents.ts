import { useEffect } from 'react';
import { apiFetch } from '@/lib/apiClient';
import type React from 'react';
import { getLevel, getXPForLevel } from '@/utils/formatters';

interface DashboardEventsOptions {
  refreshSubjects: () => Promise<void> | void;
  refreshStats: () => Promise<void> | void;
  refreshSessionStats: () => Promise<void> | void;
  refreshCalendarSessions: () => Promise<void> | void;
  setRealtimeXP: React.Dispatch<React.SetStateAction<number>>;
  setRealtimeLevel: React.Dispatch<React.SetStateAction<number>>;
  setRealtimeStreak: React.Dispatch<React.SetStateAction<number>>;
  setLastUpdateTime: React.Dispatch<React.SetStateAction<number>>;
}

// Centralises all dashboard-level event listeners so the page component remains lean.
export function useDashboardEvents({
  refreshSubjects,
  refreshStats,
  refreshSessionStats,
  refreshCalendarSessions,
  setRealtimeXP,
  setRealtimeLevel,
  setRealtimeStreak,
  setLastUpdateTime,
}: DashboardEventsOptions) {
  useEffect(() => {
    const recalcXP = async () => {
      try {
        const res = await apiFetch('/api/gamification/recalculate', { method: 'POST' });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.newXP === 'number') {
          setRealtimeXP(data.newXP);
          setRealtimeLevel(getLevel(data.newXP));
        }
      } catch {}
    };
    const updateTimestamp = () => setLastUpdateTime(Date.now());

    const handleSubjectChange = () => {
      refreshSubjects();
    };

    const handleSessionCompleted = (event: CustomEvent) => {
      refreshSubjects();
      refreshStats();
      refreshSessionStats();
      refreshCalendarSessions();
      updateTimestamp();

      const detail: any = event.detail;
      const xpChange = typeof detail?.xpDelta === 'number' ? Number(detail.xpDelta) : Number(detail?.xpGained || 0);

      // Optimistically update XP (can be positive or negative)
      if (!Number.isNaN(xpChange) && xpChange !== 0) {
        setRealtimeXP(prev => {
          const nextXP = Math.max(0, (typeof prev === 'number' ? prev : 0) + xpChange);
          setRealtimeLevel(getLevel(nextXP));
          return nextXP;
        });

        // Only trigger toast if XP actually changed
        if ((window as any).triggerXPToast) {
          (window as any).triggerXPToast(xpChange, 'xp');  // Pass actual value with sign
        }
      }
      // Ensure persisted XP stays in sync with accomplished sessions only
      recalcXP();
    };

    const handleSessionIncomplete = (event: CustomEvent) => {
      refreshSubjects();
      refreshStats();
      updateTimestamp();

      const detail: any = event.detail;
      const xpChange = typeof detail?.xpDelta === 'number' ? Number(detail.xpDelta) : -Number(detail?.xpGained || 0);

      if (!Number.isNaN(xpChange) && xpChange !== 0) {
        setRealtimeXP(prev => {
          const nextXP = Math.max(0, (typeof prev === 'number' ? prev : 0) + xpChange);
          setRealtimeLevel(getLevel(nextXP));
          return nextXP;
        });

        // Only trigger toast if XP actually changed
        if ((window as any).triggerXPToast) {
          (window as any).triggerXPToast(xpChange, 'xp');  // Pass actual value with sign
        }
      }
      // Ensure persisted XP is corrected when reversing completion
      recalcXP();
    };

    const handleSessionUpdated = (event: CustomEvent) => {
      refreshSubjects();
      refreshStats();
      updateTimestamp();

      // Don't show XP toast for edits - only sessionCompleted/sessionIncomplete show toasts
      // Total XP updates correctly in real-time (user can see the number change on dashboard)
    };

    const handleSessionDeleted = () => {
      refreshSubjects();
      refreshStats();
      refreshSessionStats();
      refreshCalendarSessions();
      updateTimestamp();
    };

    const handleXPGained = (event: CustomEvent) => {
      const detail: any = event.detail;
      setRealtimeXP(detail?.totalXP ?? 0);
      updateTimestamp();
      refreshStats();
    };

    const handleLevelUp = (event: CustomEvent) => {
      const detail: any = event.detail;
      setRealtimeLevel(detail?.newLevel ?? 1);
      setRealtimeXP(detail?.totalXP ?? 0);
      updateTimestamp();
    };

    const handleStreakUpdated = (event: CustomEvent) => {
      const detail: any = event.detail;
      setRealtimeStreak(detail?.newStreak ?? 0);
      updateTimestamp();
    };

    window.addEventListener('subjectCreated', handleSubjectChange);
    window.addEventListener('subjectUpdated', handleSubjectChange);
    window.addEventListener('subjectDeleted', handleSubjectChange);
    window.addEventListener('sessionCompleted', handleSessionCompleted as EventListener);
    window.addEventListener('sessionIncomplete', handleSessionIncomplete as EventListener);
    window.addEventListener('sessionUpdated', handleSessionUpdated as EventListener);
    window.addEventListener('sessionDeleted', handleSessionDeleted as EventListener);
    window.addEventListener('xpGained', handleXPGained as EventListener);
    window.addEventListener('levelUp', handleLevelUp as EventListener);
    window.addEventListener('streakUpdated', handleStreakUpdated as EventListener);

    return () => {
      window.removeEventListener('subjectCreated', handleSubjectChange);
      window.removeEventListener('subjectUpdated', handleSubjectChange);
      window.removeEventListener('subjectDeleted', handleSubjectChange);
      window.removeEventListener('sessionCompleted', handleSessionCompleted as EventListener);
      window.removeEventListener('sessionIncomplete', handleSessionIncomplete as EventListener);
      window.removeEventListener('sessionUpdated', handleSessionUpdated as EventListener);
      window.removeEventListener('sessionDeleted', handleSessionDeleted as EventListener);
      window.removeEventListener('xpGained', handleXPGained as EventListener);
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
      window.removeEventListener('streakUpdated', handleStreakUpdated as EventListener);
    };
  }, [
    refreshSubjects,
    refreshStats,
    refreshSessionStats,
    refreshCalendarSessions,
    setRealtimeXP,
    setRealtimeLevel,
    setRealtimeStreak,
    setLastUpdateTime,
  ]);
}

export default useDashboardEvents;
