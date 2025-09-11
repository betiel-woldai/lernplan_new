import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Calendar from '@/components/Calendar/Calendar';
import StatCard from '@/components/StatCard';
import XPBar from '@/components/XPBar';
import LevelBadge from '@/components/LevelBadge';
import { XPToastContainer } from '@/components/XPToast';
import LevelUpModal from '@/components/LevelUpModal';
import AchievementBadge from '@/components/AchievementBadge';
import StreakDisplay from '@/components/StreakDisplay';
import SessionEditModal from '@/components/SessionEditModal';
import useGamification from '@/hooks/useGamification';
import { useSubjects } from '@/hooks/useSubjects';
import { useUserStats } from '@/hooks/useUserStats';
import { useSessionStats } from '@/hooks/useSessionStats';
import { useDateSpecificStats } from '@/hooks/useDateSpecificStats';
import { useLearningSessions, LearningSession } from '@/hooks/useLearningSessions';
import useCalendarSessions from '@/hooks/useCalendarSessions';
import { CalendarSession } from '@/types/calendar';
import { mockUserStats } from '@/utils/mockData';
import { formatLearningTime, formatStreak, getXPProgress } from '@/utils/formatters';
import { formatNumber, formatXPTotal, formatRemainingXP } from '@/utils/format';
import { addEventListener } from '@/utils/eventBus';

// React Icons
import { 
  FaClock, 
  FaCheckCircle, 
  FaFire, 
  FaTrophy,
  FaChartLine,
  FaCalendarDay,
  FaTasks,
  FaCheck
} from 'react-icons/fa';

export default function Dashboard() {
  const { userStats, loading: userStatsLoading, refreshStats } = useUserStats();
  const gamification = useGamification();
  const { sessionStats, loading: sessionStatsLoading, refreshStats: refreshSessionStats } = useSessionStats();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  const { stats: dateStats, loading: dateStatsLoading } = useDateSpecificStats(selectedDate);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const { subjects, loading: subjectsLoading, refreshSubjects } = useSubjects();
  const { updateSession } = useLearningSessions();
  const { updateSession: updateCalendarSession, refreshSessions: refreshCalendarSessions } = useCalendarSessions();
  
  // Session editing state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<LearningSession | null>(null);
  
  // DEBUG: Log user stats to console
  React.useEffect(() => {
    console.log('🐛 Dashboard DEBUG:', {
      userStats,
      userStatsLoading,
      gamification: {
        currentXP: gamification.currentXP,
        currentLevel: gamification.currentLevel,
        streak: gamification.streak
      }
    });
  }, [userStats, userStatsLoading, gamification]);
  
  // Use real user stats XP data, fallback to gamification or mock data
  const currentXP = userStats?.currentXP ?? gamification.currentXP;
  const currentLevel = userStats?.currentLevel ?? gamification.currentLevel;
  const learningStreak = userStats?.learningStreak ?? gamification.streak;
  const nextLevelXP = userStats?.nextLevelXP ?? mockUserStats.nextLevelXP;
  
  const xpProgress = getXPProgress(currentXP, currentLevel);
  
  // Real-time update states - now using database values as base
  const [realtimeXP, setRealtimeXP] = useState(currentXP);
  const [realtimeLevel, setRealtimeLevel] = useState(currentLevel);
  const [realtimeStreak, setRealtimeStreak] = useState(learningStreak);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Sync real-time states when user stats change
  React.useEffect(() => {
    if (userStats) {
      setRealtimeXP(userStats.currentXP || 0);
      setRealtimeLevel(userStats.currentLevel || 1);
      setRealtimeStreak(userStats.learningStreak || 0);
    }
  }, [userStats]);

  // Listen for real-time events
  React.useEffect(() => {
    const handleSubjectChange = () => {
      refreshSubjects();
    };

    const handleSessionCompleted = (event: any) => {
      console.log('📊 Dashboard: Session completed', event.detail);
      // Refresh subjects to update progress
      refreshSubjects();
      
      // CRITICAL: Refresh user stats from database
      refreshStats();
      
      // CRITICAL: Refresh session statistics for overview
      refreshSessionStats();
      
      // CRITICAL: Refresh calendar to show completed session
      refreshCalendarSessions();
      
      setLastUpdateTime(Date.now());
      
      // Show success feedback
      if ((window as any).triggerXPToast) {
        (window as any).triggerXPToast(
          event.detail.xpGained, 
          'session_complete', 
          `Session completed! +${event.detail.xpGained} XP`
        );
      }
    };

    const handleSessionIncomplete = (event: any) => {
      console.log('📊 Dashboard: Session marked incomplete', event.detail);
      // Refresh subjects to update progress
      refreshSubjects();
      
      // CRITICAL: Refresh user stats from database
      refreshStats();
      
      setLastUpdateTime(Date.now());
      
      // Show feedback for incompletion
      if ((window as any).triggerXPToast) {
        (window as any).triggerXPToast(
          0, 
          'session_incomplete', 
          'Session marked as pending'
        );
      }
    };

    const handleSessionUpdated = (event: any) => {
      console.log('🔄 Dashboard: Session updated', event.detail);
      // Refresh all data to maintain timeline synchronization
      refreshSubjects();
      refreshStats();
      setLastUpdateTime(Date.now());
      
      // If completion status changed, show appropriate feedback
      if (event.detail.completionChanged) {
        const wasCompleted = event.detail.updates.completed;
        if (wasCompleted && (window as any).triggerXPToast) {
          const xpGained = event.detail.updates.points || 0;
          (window as any).triggerXPToast(
            xpGained, 
            'session_complete', 
            `Session marked complete! +${xpGained} XP`
          );
        }
      }
    };

    const handleXPGained = (event: any) => {
      console.log('🎮 Dashboard: XP gained', event.detail);
      // Update real-time state immediately
      setRealtimeXP(event.detail.totalXP);
      setLastUpdateTime(Date.now());
      
      // Refresh user stats from database to ensure sync
      refreshStats();
    };

    const handleLevelUp = (event: any) => {
      console.log('🎉 Dashboard: Level up!', event.detail);
      setRealtimeLevel(event.detail.newLevel);
      setRealtimeXP(event.detail.totalXP);
      setLastUpdateTime(Date.now());
    };

    const handleStreakUpdated = (event: any) => {
      console.log('🔥 Dashboard: Streak updated', event.detail);
      setRealtimeStreak(event.detail.newStreak);
      setLastUpdateTime(Date.now());
    };

    const handleSessionProgress = (event: any) => {
      // Optional: Show live session progress indicators
      // This could be used to show a subtle indicator that a session is active
      console.log('⏱️ Dashboard: Session progress', event.detail);
    };

    // Subject change listeners
    window.addEventListener('subjectCreated', handleSubjectChange);
    window.addEventListener('subjectUpdated', handleSubjectChange);
    window.addEventListener('subjectDeleted', handleSubjectChange);

    // Real-time event listeners
    window.addEventListener('sessionCompleted', handleSessionCompleted);
    window.addEventListener('sessionIncomplete', handleSessionIncomplete);
    window.addEventListener('sessionUpdated', handleSessionUpdated);
    window.addEventListener('xpGained', handleXPGained);
    window.addEventListener('levelUp', handleLevelUp);
    window.addEventListener('streakUpdated', handleStreakUpdated);
    window.addEventListener('sessionProgress', handleSessionProgress);

    return () => {
      // Clean up subject listeners
      window.removeEventListener('subjectCreated', handleSubjectChange);
      window.removeEventListener('subjectUpdated', handleSubjectChange);
      window.removeEventListener('subjectDeleted', handleSubjectChange);
      
      // Clean up real-time listeners
      window.removeEventListener('sessionCompleted', handleSessionCompleted);
      window.removeEventListener('sessionIncomplete', handleSessionIncomplete);
      window.removeEventListener('sessionUpdated', handleSessionUpdated);
      window.removeEventListener('xpGained', handleXPGained);
      window.removeEventListener('levelUp', handleLevelUp);
      window.removeEventListener('streakUpdated', handleStreakUpdated);
      window.removeEventListener('sessionProgress', handleSessionProgress);
    };
  }, [refreshSubjects]);
  
  // Utility function to convert CalendarSession to LearningSession
  const convertCalendarToLearningSession = (calSession: CalendarSession): LearningSession => {
    return {
      id: calSession.id,
      subjectId: calSession.subjectId,
      userId: '', // Will be set by the backend
      date: calSession.startTime.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      duration: calSession.duration,
      completed: calSession.completed,
      points: 0, // Will be calculated based on completion
      notes: calSession.description || '',
      createdAt: '', // Will be set by the backend
      subject: {
        name: calSession.subjectName,
        color: calSession.subjectColor,
      }
    };
  };
  
  const handleSessionClick = (session: CalendarSession) => {
    setSelectedSession(session);
    console.log('Session clicked:', session);
    
    // Convert CalendarSession to LearningSession and show edit modal
    const learningSession = convertCalendarToLearningSession(session);
    setSelectedSessionForEdit(learningSession);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedSessionForEdit(null);
  };

  const handleSaveSessionEdit = async (sessionId: string, updates: Partial<LearningSession>) => {
    const success = await updateSession(sessionId, updates);
    if (success) {
      // The SessionEditModal will dispatch the 'sessionUpdated' event
      refreshStats(); // Refresh stats after session update
    }
    return success;
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date.toLocaleDateString('de-DE'));
    setSelectedDate(date); // Update selectedDate when user clicks on a calendar date
  };

  const handleCreateSession = (date: Date) => {
    console.log('Create session for:', date.toLocaleDateString('de-DE'));
  };

  return (
    <Layout title="Dashboard - Lernplaner">
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <LevelBadge level={realtimeLevel} size="lg" animated />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Übersicht 📅
              </h1>
              <p className="text-gray-600">
                Dein zentraler Lernplaner mit Kalender und Fortschritt
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Willkommen zurück, {userStats?.name || 'Nutzer'}! 👋
          </div>
        </div>
      </div>

      {/* Main Content: Calendar + Stats Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Primary Calendar View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Lernkalender</h2>
              <div className="text-sm text-gray-500">
                Klicke auf Termine für Details
              </div>
            </div>
            <Calendar
              onSessionClick={handleSessionClick}
              onDateClick={handleDateClick}
              onCreateSession={handleCreateSession}
              selectedSession={selectedSession}
              subjects={subjects}
            />
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* XP Progress Compact */}
          <div className="bg-white rounded-xl border border-gray-200 p-4" data-testid="gamification-section">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Level</h3>
              <span className="text-xs text-gray-500" data-testid="total-xp">
                {formatXPTotal(realtimeXP)}
              </span>
            </div>
            <XPBar
              currentXP={realtimeXP}
              nextLevelXP={userStats?.nextLevelXP || 100}
              currentLevel={realtimeLevel}
              animated
              size="sm"
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            {/* Daily Learning Time Compact */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <FaClock className="text-blue-500 text-sm" />
                  <span className="text-xs font-medium text-blue-900">
                    {dateStats.isToday ? 'Heute' : selectedDate?.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-900">
                  {dateStatsLoading ? 'Laden...' : dateStats.formattedDuration}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (dateStats.completedDuration / 120) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-blue-700 mt-1">von 2h Ziel</div>
            </div>

            {/* Completed Sessions Compact - ONLY completed sessions for selected date */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="text-xs font-medium text-green-900">Sessions</span>
                </div>
                <span className="text-sm font-bold text-green-900">
                  {dateStatsLoading ? '...' : dateStats.completedSessions}
                </span>
              </div>
              <div className="text-xs text-green-700">
                {dateStats.isToday ? 'heute abgeschlossen' : 
                  selectedDate?.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ' abgeschlossen'
                }
              </div>
            </div>

            {/* Learning Streak Compact - counting backwards from selected date */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <FaFire className="text-orange-500 text-sm" />
                  <span className="text-xs font-medium text-orange-900">Streak</span>
                </div>
                <span className="text-sm font-bold text-orange-900">
                  {dateStatsLoading ? '...' : dateStats.streakDays}
                </span>
              </div>
              <span data-testid="current-streak" className="hidden">{dateStatsLoading ? 0 : dateStats.streakDays}</span>
              <div className="text-xs text-orange-700">
                {dateStats.isToday ? 'Tage in Folge bis heute' : 
                  `Tage in Folge bis ${selectedDate?.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}`
                }
              </div>
            </div>

            {/* Achievements Compact - Temporarily hidden until defined */}
            {false && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <FaTrophy className="text-yellow-500 text-sm" />
                  <span className="text-xs font-medium text-yellow-900">Achievements</span>
                </div>
                <span className="text-sm font-bold text-yellow-900">{gamification.achievements.length}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2" data-testid="achievement-badges">
                {gamification.achievements.slice(0, 3).map((achievement, index) => (
                  <AchievementBadge
                    key={index}
                    achievement={achievement}
                    size="xs"
                  />
                ))}
              </div>
            </div>
            )}

            {/* REMOVED: Redundant Session Status Widget - keeping only the date-specific one above */}
          </div>
        </div>
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

      {/* Session Edit Modal */}
      <SessionEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        session={selectedSessionForEdit}
        onSave={handleSaveSessionEdit}
      />
    </Layout>
  );
}