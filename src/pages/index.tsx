import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import XPBar from '@/components/XPBar';
import LevelBadge from '@/components/LevelBadge';
import { XPToastContainer } from '@/components/XPToast';
import LevelUpModal from '@/components/LevelUpModal';
import AchievementBadge from '@/components/AchievementBadge';
import StreakDisplay from '@/components/StreakDisplay';
import useGamification from '@/hooks/useGamification';
import { mockUserStats } from '@/utils/mockData';
import { formatLearningTime, formatStreak, getXPProgress } from '@/utils/formatters';

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

  return (
    <Layout title="Dashboard - Lernplaner">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-3">
            <LevelBadge level={gamification.currentLevel} size="lg" animated />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Willkommen zurück, {userStats.name}! 👋
              </h1>
              <p className="text-gray-600">
                Du bist auf einem großartigen Weg! Hier ist dein heutiger Fortschritt:
              </p>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-6" data-testid="gamification-section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Level Fortschritt</h2>
            <span className="text-sm text-gray-500" data-testid="total-xp">
              {gamification.currentXP.toLocaleString()} XP Total
            </span>
          </div>
          <XPBar
            currentXP={gamification.currentXP}
            nextLevelXP={userStats.nextLevelXP}
            currentLevel={gamification.currentLevel}
            animated
            size="lg"
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Daily Learning Time */}
        <StatCard
          title="Heutige Lernzeit"
          value={formatLearningTime(userStats.dailyLearningTime)}
          subtitle="von 2h Ziel"
          icon={FaClock}
          iconColor="text-blue-500"
          trend={{
            value: 15,
            label: "vs. gestern",
            isPositive: true
          }}
        >
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (userStats.dailyLearningTime / 120) * 100)}%` }}
            />
          </div>
        </StatCard>

        {/* Completed Tasks */}
        <StatCard
          title="Erledigte Aufgaben"
          value={userStats.completedTasks}
          subtitle="heute"
          icon={FaCheckCircle}
          iconColor="text-green-500"
          trend={{
            value: 25,
            label: "vs. gestern",
            isPositive: true
          }}
        >
          <div className="text-xs text-gray-500">
            Gesamt: {userStats.totalCompletedTasks.toLocaleString()} Aufgaben
          </div>
        </StatCard>

        {/* Learning Streak */}
        <StatCard
          title="Lernstreak"
          value={gamification.streak}
          subtitle="Tage in Folge"
          icon={FaFire}
          iconColor="text-orange-500"
          trend={{
            value: 20,
            label: "Neuer Rekord!",
            isPositive: true
          }}
        >
          <span data-testid="current-streak" className="hidden">{gamification.streak}</span>
          <StreakDisplay 
            streak={gamification.streak} 
            size="sm"
            onStreakMilestone={(milestone) => {
              console.log(`Streak milestone reached: ${milestone}`);
            }}
          />
        </StatCard>

        {/* Level Progress */}
        <StatCard
          title="Level & XP"
          value={`Level ${gamification.currentLevel}`}
          subtitle={`${gamification.currentXP.toLocaleString()} XP`}
          icon={FaTrophy}
          iconColor="text-yellow-500"
        >
          <div className="space-y-2">
            <span data-testid="current-level" className="hidden">{gamification.currentLevel}</span>
            <span data-testid="current-xp" className="hidden">{gamification.currentXP}</span>
            <XPBar
              currentXP={gamification.currentXP}
              nextLevelXP={userStats.nextLevelXP}
              currentLevel={gamification.currentLevel}
              size="sm"
              showNumbers={false}
            />
            <div className="text-xs text-gray-500">
              {(userStats.nextLevelXP - gamification.currentXP).toLocaleString()} XP bis Level {gamification.currentLevel + 1}
            </div>
          </div>
        </StatCard>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Weekly Overview */}
        <StatCard
          title="Wöchentlicher Überblick"
          value={formatLearningTime(userStats.weeklyLearningTime)}
          subtitle="diese Woche"
          icon={FaChartLine}
          iconColor="text-purple-500"
          className="md:col-span-1"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fortschritt</span>
              <span className="font-medium">{Math.round((userStats.weeklyLearningTime / (35 * 60)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (userStats.weeklyLearningTime / (35 * 60)) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Ziel: 35h pro Woche
            </div>
          </div>
        </StatCard>

        {/* Recent Achievements */}
        <StatCard
          title="Letzte Erfolge"
          value={gamification.achievements.length}
          subtitle="Achievements"
          icon={FaTrophy}
          iconColor="text-yellow-500"
          className="md:col-span-1"
        >
          <div className="space-y-2" data-testid="achievement-badges">
            <div className="flex flex-wrap gap-2 mb-2">
              {gamification.achievements.slice(0, 5).map((achievement, index) => (
                <AchievementBadge
                  key={index}
                  achievement={achievement}
                  size="sm"
                />
              ))}
            </div>
            {gamification.getNewAchievementsCount() > 0 && (
              <p className="text-xs text-yellow-500 font-medium">
                {gamification.getNewAchievementsCount()} neue Achievement(s)!
              </p>
            )}
          </div>
        </StatCard>
      </div>

      {/* Quick Actions & Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnelle Aktionen</h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => gamification.addXP(10, 'Quick action')}
              className="flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              data-testid="xp-button-10"
            >
              <FaCalendarDay className="w-5 h-5 mr-2" />
              +10 XP
            </button>
            <button 
              onClick={() => gamification.addXP(25, 'Small task')}
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              data-testid="xp-button-25"
            >
              <FaCheckCircle className="w-5 h-5 mr-2" />
              +25 XP
            </button>
            <button 
              onClick={() => gamification.addXP(50, 'Aufgabe abgehakt')}
              className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              data-testid="xp-button-50"
            >
              <FaCheckCircle className="w-5 h-5 mr-2" />
              +50 XP
            </button>
            <button 
              onClick={() => gamification.updateStreak(gamification.streak + 1)}
              className="flex items-center justify-center p-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <FaFire className="w-5 h-5 mr-2" />
              Streak erhöhen
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Aktionen</h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => gamification.unlockAchievement({
                name: 'Test Achievement',
                icon: '🎯',
                category: 'test',
                description: 'Demo achievement unlocked!'
              })}
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FaTrophy className="w-5 h-5 mr-2" />
              Achievement freischalten
            </button>
            <button 
              onClick={() => gamification.addXP(200, 'Level Up Test')}
              className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
              data-testid="xp-button-200"
            >
              <FaChartLine className="w-5 h-5 mr-2" />
              +200 XP
            </button>
            <button 
              onClick={gamification.resetGamification}
              className="flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              Reset Demo
            </button>
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