import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { XPToastContainer } from '@/components/XPToast';
import LevelUpModal from '@/components/LevelUpModal';
import useGamification from '@/hooks/useGamification';
import { useSubjects } from '@/hooks/useSubjects';
import { useUserStats } from '@/hooks/useUserStats';
import { useSessionStats } from '@/hooks/useSessionStats';
import { useDateSpecificStats } from '@/hooks/useDateSpecificStats';
import useCalendarSessions from '@/hooks/useCalendarSessions';
import { CalendarSession } from '@/types/calendar';
import { getXPProgress, getLevel, getXPForLevel } from '@/utils/formatters';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import CalendarSection from '@/components/Dashboard/CalendarSection';
import StatsSidebar from '@/components/Dashboard/StatsSidebar';
import useDashboardEvents from '@/hooks/useDashboardEvents';
import TerminplanReminderToasts from '@/components/TerminplanReminderToasts';
import { TodaysTerminplanModal } from '@/components/TodaysTerminplanModal';
import { useTodaysTerminplanEvents } from '@/hooks/useTodaysTerminplanEvents';
import { useTodaysTerminplanModal } from '@/hooks/useTodaysTerminplanModal';

export default function Dashboard() {
  const { userStats, loading: userStatsLoading, refreshStats } = useUserStats();
  const gamification = useGamification();
  const { sessionStats, loading: sessionStatsLoading, refreshStats: refreshSessionStats } = useSessionStats();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  const { stats: dateStats, loading: dateStatsLoading } = useDateSpecificStats(selectedDate);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const { subjects, refreshSubjects } = useSubjects();
  const { refreshSessions: refreshCalendarSessions, sessions: allSessions, fetchSessionsForDateRange } = useCalendarSessions();

  // Today's terminplan events popup system
  const { todaysEvents, hasEvents } = useTodaysTerminplanEvents(allSessions);
  const { isModalOpen, dismissModal, dismissForToday } = useTodaysTerminplanModal(hasEvents);

  // Ensure today's sessions are loaded for popup evaluation (isolated from Calendar's own hook instance)
  useEffect(() => {
    const today = new Date();
    fetchSessionsForDateRange(today, today).catch(() => {});
  }, [fetchSessionsForDateRange]);

  // Use real user stats XP data with gamification fallback when unavailable
  const currentXP = userStats?.currentXP ?? gamification.currentXP;
  const calculatedLevel = getLevel(currentXP); // Always calculate level from XP
  const currentLevel = calculatedLevel;
  const learningStreak = userStats?.learningStreak ?? gamification.streak;

  const xpProgress = getXPProgress(currentXP, currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  
  // Real-time update states - now using database values as base
  const [realtimeXP, setRealtimeXP] = useState(currentXP);
  const [realtimeLevel, setRealtimeLevel] = useState(currentLevel);
  const [realtimeStreak, setRealtimeStreak] = useState(learningStreak);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  useEffect(() => {
    if (userStats) {
      const xp = userStats.currentXP || 0;
      setRealtimeXP(xp);
      setRealtimeLevel(getLevel(xp)); // Always calculate level from XP
      setRealtimeStreak(userStats.learningStreak || 0);
    }
  }, [userStats]);

  useDashboardEvents({
    refreshSubjects,
    refreshStats,
    refreshSessionStats,
    refreshCalendarSessions,
    setRealtimeXP,
    setRealtimeLevel,
    setRealtimeStreak,
    setLastUpdateTime,
  });
  
  // Ensure persisted XP is reconciled with accomplished sessions on initial load
  useEffect(() => {
    const reconcile = async () => {
      try {
        const res = await fetch('/api/gamification/recalculate', { method: 'POST' });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.newXP === 'number') {
          setRealtimeXP(data.newXP);
          setRealtimeLevel(getLevel(data.newXP));
        }
      } catch {}
    };
    reconcile();
  }, []);
  
  const handleSessionClick = (session: CalendarSession) => {
    setSelectedSession(session);
    window.dispatchEvent(new CustomEvent('calendarSessionEditRequested', {
      detail: { sessionId: session.id }
    }));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date); // Update selectedDate when user clicks on a calendar date
  };

  const handleCreateSession = () => {};

  return (
    <Layout title="Dashboard - Lernplaner">
      <DashboardHeader level={realtimeLevel} userName={userStats?.name ?? null} />

      {/* Main Content: Calendar + Stats Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <CalendarSection
          subjects={subjects}
          selectedSession={selectedSession}
          onSessionClick={handleSessionClick}
          onDateClick={handleDateClick}
          onCreateSession={handleCreateSession}
        />

        <StatsSidebar
          realtimeXP={realtimeXP}
          realtimeLevel={realtimeLevel}
          nextLevelXP={getXPForLevel(realtimeLevel + 1)}
          selectedDate={selectedDate}
          showAchievements={false}
          loading={userStatsLoading}
        />
      </div>

      {/* Toast Container */}
      <XPToastContainer />
      <TerminplanReminderToasts />
      
      {/* Level Up Modal */}
      {gamification.levelUpModalOpen && gamification.newLevelReached && (
        <LevelUpModal
          isOpen={gamification.levelUpModalOpen}
          newLevel={gamification.newLevelReached}
          onClose={gamification.closeLevelUpModal}
        />
      )}

      {/* Today's Terminplan Events Modal */}
      <TodaysTerminplanModal
        isOpen={isModalOpen}
        events={todaysEvents}
        onClose={dismissModal}
        onDismissForToday={dismissForToday}
      />

    </Layout>
  );
}
