import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Calendar from '@/components/Calendar/Calendar';
import StatCard from '@/components/StatCard';
import XPBar from '@/components/XPBar';
import LevelBadge from '@/components/LevelBadge';
import { XPToastContainer } from '@/components/XPToast';
import LevelUpModal from '@/components/LevelUpModal';
import AchievementBadge from '@/components/AchievementBadge';
import StreakDisplay from '@/components/StreakDisplay';
import useGamification from '@/hooks/useGamification';
import { useSubjects } from '@/hooks/useSubjects';
import { CalendarSession } from '@/types/calendar';
import { mockUserStats } from '@/utils/mockData';
import { formatLearningTime, formatStreak, getXPProgress } from '@/utils/formatters';
import { formatNumber, formatXPTotal, formatRemainingXP } from '@/utils/format';

// React Icons
import { 
  FaClock, 
  FaCheckCircle, 
  FaFire, 
  FaTrophy,
  FaChartLine,
  FaCalendarDay
} from 'react-icons/fa';

export default function Dashboard() {
  const userStats = mockUserStats;
  const gamification = useGamification();
  const xpProgress = getXPProgress(gamification.currentXP, gamification.currentLevel);
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const { subjects, loading: subjectsLoading, refreshSubjects } = useSubjects();

  // Listen for subject changes to refresh calendar legend
  React.useEffect(() => {
    const handleSubjectChange = () => {
      refreshSubjects();
    };

    window.addEventListener('subjectCreated', handleSubjectChange);
    window.addEventListener('subjectUpdated', handleSubjectChange);
    window.addEventListener('subjectDeleted', handleSubjectChange);

    return () => {
      window.removeEventListener('subjectCreated', handleSubjectChange);
      window.removeEventListener('subjectUpdated', handleSubjectChange);
      window.removeEventListener('subjectDeleted', handleSubjectChange);
    };
  }, [refreshSubjects]);
  
  const handleSessionClick = (session: CalendarSession) => {
    setSelectedSession(session);
    console.log('Session clicked:', session);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date.toLocaleDateString('de-DE'));
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
            <LevelBadge level={gamification.currentLevel} size="lg" animated />
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
            Willkommen zurück, {userStats.name}! 👋
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
                {formatXPTotal(gamification.currentXP)}
              </span>
            </div>
            <XPBar
              currentXP={gamification.currentXP}
              nextLevelXP={userStats.nextLevelXP}
              currentLevel={gamification.currentLevel}
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
                  <span className="text-xs font-medium text-blue-900">Heute</span>
                </div>
                <span className="text-sm font-bold text-blue-900">{formatLearningTime(userStats.dailyLearningTime)}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (userStats.dailyLearningTime / 120) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-blue-700 mt-1">von 2h Ziel</div>
            </div>

            {/* Completed Tasks Compact */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <FaCheckCircle className="text-green-500 text-sm" />
                  <span className="text-xs font-medium text-green-900">Aufgaben</span>
                </div>
                <span className="text-sm font-bold text-green-900">{userStats.completedTasks}</span>
              </div>
              <div className="text-xs text-green-700">heute erledigt</div>
            </div>

            {/* Learning Streak Compact */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <FaFire className="text-orange-500 text-sm" />
                  <span className="text-xs font-medium text-orange-900">Streak</span>
                </div>
                <span className="text-sm font-bold text-orange-900">{gamification.streak}</span>
              </div>
              <span data-testid="current-streak" className="hidden">{gamification.streak}</span>
              <div className="text-xs text-orange-700">Tage in Folge</div>
            </div>

            {/* Achievements Compact */}
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
    </Layout>
  );
}