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
              {formatXPTotal(gamification.currentXP)}
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
            Gesamt: {formatNumber(userStats.totalCompletedTasks)} Aufgaben
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
          subtitle={`${formatNumber(gamification.currentXP)} XP`}
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
              {formatRemainingXP((userStats.nextLevelXP - gamification.currentXP), gamification.currentLevel + 1)}
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