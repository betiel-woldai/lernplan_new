import { useEffect } from 'react';

interface DashboardEventsOptions {
  refreshSubjects: () => Promise<void> | void;
  refreshStats: () => Promise<void> | void;
  refreshSessionStats: () => Promise<void> | void;
  refreshCalendarSessions: () => Promise<void> | void;
  setRealtimeXP: (value: number) => void;
  setRealtimeLevel: (value: number) => void;
  setRealtimeStreak: (value: number) => void;
  setLastUpdateTime: (value: number) => void;
  realtimeXP: number;
  realtimeLevel: number;
  nextLevelXP: number;
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
  realtimeXP,
  realtimeLevel,
  nextLevelXP,
}: DashboardEventsOptions) {
  useEffect(() => {
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
      if ((window as any).triggerXPToast) {
        (window as any).triggerXPToast(
          detail?.xpGained ?? 0,
          'session_complete',
          `Session completed! +${detail?.xpGained ?? 0} XP`
        );
      }
    };

    const handleSessionIncomplete = () => {
      refreshSubjects();
      refreshStats();
      updateTimestamp();

      if ((window as any).triggerXPToast) {
        (window as any).triggerXPToast(0, 'session_incomplete', 'Session marked as pending');
      }
    };

    const handleSessionUpdated = (event: CustomEvent) => {
      refreshSubjects();
      refreshStats();
      updateTimestamp();

      const detail: any = event.detail;
      if (detail?.completionChanged && detail?.updates?.completed && (window as any).triggerXPToast) {
        const xpGained = detail?.updates?.points || 0;
        (window as any).triggerXPToast(
          xpGained,
          'session_complete',
          `Session marked complete! +${xpGained} XP`
        );
      }
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
