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
import { getXPProgress } from '@/utils/formatters';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import CalendarSection from '@/components/Dashboard/CalendarSection';
import StatsSidebar from '@/components/Dashboard/StatsSidebar';
import useDashboardEvents from '@/hooks/useDashboardEvents';

export default function Dashboard() {
  const { userStats, loading: userStatsLoading, refreshStats } = useUserStats();
  const gamification = useGamification();
  const { sessionStats, loading: sessionStatsLoading, refreshStats: refreshSessionStats } = useSessionStats();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  const { stats: dateStats, loading: dateStatsLoading } = useDateSpecificStats(selectedDate);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const { subjects, refreshSubjects } = useSubjects();
  const { refreshSessions: refreshCalendarSessions } = useCalendarSessions();
  // Use real user stats XP data with gamification fallback when unavailable
  const currentXP = userStats?.currentXP ?? gamification.currentXP;
  const currentLevel = userStats?.currentLevel ?? gamification.currentLevel;
  const learningStreak = userStats?.learningStreak ?? gamification.streak;
  
  const xpProgress = getXPProgress(currentXP, currentLevel);
  const nextLevelXP = userStats?.nextLevelXP ?? xpProgress.nextLevelXP;
  
  // Real-time update states - now using database values as base
  const [realtimeXP, setRealtimeXP] = useState(currentXP);
  const [realtimeLevel, setRealtimeLevel] = useState(currentLevel);
  const [realtimeStreak, setRealtimeStreak] = useState(learningStreak);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  useEffect(() => {
    if (userStats) {
      setRealtimeXP(userStats.currentXP || 0);
      setRealtimeLevel(userStats.currentLevel || 1);
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
          nextLevelXP={userStats?.nextLevelXP || nextLevelXP}
          selectedDate={selectedDate}
          showAchievements={false}
          loading={userStatsLoading}
        />
      </div>

      {/* Toast Container */}
      <XPToastContainer />
      
      {/* Level Up Modal */}
      {gamification.levelUpModalOpen && gamification.newLevelReached && (
        <LevelUpModal
          isOpen={gamification.levelUpModalOpen}
          newLevel={gamification.newLevelReached}
          onClose={gamification.closeLevelUpModal}
        />
      )}

    </Layout>
  );
}
