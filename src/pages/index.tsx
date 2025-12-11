import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
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
import CompactTimer from '@/components/CompactTimer';
import useDashboardEvents from '@/hooks/useDashboardEvents';
import TerminplanReminderToasts from '@/components/TerminplanReminderToasts';
import { TodaysTerminplanModal } from '@/components/TodaysTerminplanModal';
import { useTodaysTerminplanEvents } from '@/hooks/useTodaysTerminplanEvents';
import { useTodaysTerminplanModal } from '@/hooks/useTodaysTerminplanModal';
import SubjectSelector from '@/components/SubjectSelector';
import SessionSummary from '@/components/SessionSummary';

interface DashboardProps {
  userEmail?: string;
  userName?: string;
}

export default function Dashboard({ userEmail, userName }: DashboardProps) {
  const [userInitialized, setUserInitialized] = useState(false);
  const { userStats, loading: userStatsLoading, refreshStats } = useUserStats();
  const gamification = useGamification();
  const { sessionStats, loading: sessionStatsLoading, refreshStats: refreshSessionStats } = useSessionStats();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  const { stats: dateStats, loading: dateStatsLoading } = useDateSpecificStats(selectedDate);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const { subjects, refreshSubjects } = useSubjects();
  const { refreshSessions: refreshCalendarSessions, sessions: allSessions, fetchSessionsForDateRange } = useCalendarSessions();

  // Modal states for CompactTimer
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [completedSession, setCompletedSession] = useState<any>(null);

  // Initialize user in database on first load
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const response = await apiFetch('/api/users/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          setUserInitialized(true);
          // Refresh user stats after initialization
          refreshStats();
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
        // Still set as initialized to allow app to load
        setUserInitialized(true);
      }
    };

    if (!userInitialized) {
      initializeUser();
    }
  }, [userInitialized, refreshStats]);

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
        const res = await apiFetch('/api/gamification/recalculate', { method: 'POST' });
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

  const handleSessionCompleted = (session: any) => {
    setCompletedSession(session);
    setShowSessionSummary(true);
  };

  return (
    <Layout title="Dashboard - Lernplaner">
      <DashboardHeader level={realtimeLevel} userName={userName || userStats?.name || userEmail || null} />

      {/* Compact Timer - Mobile Only (above stats cards) */}
      <div className="lg:hidden mb-6 flex justify-center">
        <CompactTimer
          onShowSubjectSelector={() => setShowSubjectSelector(true)}
          onShowSessionSummary={handleSessionCompleted}
        />
      </div>

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

      {/* Subject Selector Modal */}
      <SubjectSelector
        isOpen={showSubjectSelector}
        onClose={() => setShowSubjectSelector(false)}
        onSessionStarted={() => setShowSubjectSelector(false)}
      />

      {/* Session Summary Modal */}
      <SessionSummary
        isOpen={showSessionSummary}
        onClose={() => {
          setShowSessionSummary(false);
          setCompletedSession(null);
        }}
        session={completedSession}
      />

    </Layout>
  );
}

// Server-side authentication check
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get session from NextAuth using shared Keycloak session
  const session = await getServerSession(context.req, context.res, authOptions);

  // If no session, redirect to DIAS login/overview page
  if (!session) {
    return {
      redirect: {
        destination: process.env.DIAS_BASE_URL || 'http://localhost:3001',
        permanent: false,
      },
    };
  }

  // Extract real user info from Keycloak session and pass session to SessionProvider
  return {
    props: {
      session: JSON.parse(JSON.stringify(session)), // Serialize for client
      userName: session.user?.name || null,
      userEmail: session.user?.email || null,
    },
  };
};
