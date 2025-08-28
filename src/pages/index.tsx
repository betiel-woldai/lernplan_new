import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import XPBar from '@/components/XPBar';
import LevelBadge from '@/components/LevelBadge';
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
  const xpProgress = getXPProgress(userStats.currentXP, userStats.currentLevel);

  return (
    <Layout title="Dashboard - Lernplaner">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-3">
            <LevelBadge level={userStats.currentLevel} size="lg" animated />
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Level Fortschritt</h2>
            <span className="text-sm text-gray-500">
              {userStats.currentXP.toLocaleString()} XP Total
            </span>
          </div>
          <XPBar
            currentXP={userStats.currentXP}
            nextLevelXP={userStats.nextLevelXP}
            currentLevel={userStats.currentLevel}
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
          value={userStats.learningStreak}
          subtitle="Tage in Folge"
          icon={FaFire}
          iconColor="text-orange-500"
          trend={{
            value: 20,
            label: "Neuer Rekord!",
            isPositive: true
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(Math.min(5, userStats.learningStreak))].map((_, i) => (
                <span key={i} className="text-orange-500 text-sm">🔥</span>
              ))}
              {userStats.learningStreak > 5 && (
                <span className="text-xs text-gray-500 ml-1">+{userStats.learningStreak - 5}</span>
              )}
            </div>
          </div>
        </StatCard>

        {/* Level Progress */}
        <StatCard
          title="Level & XP"
          value={`Level ${userStats.currentLevel}`}
          subtitle={`${userStats.currentXP.toLocaleString()} XP`}
          icon={FaTrophy}
          iconColor="text-yellow-500"
        >
          <div className="space-y-2">
            <XPBar
              currentXP={userStats.currentXP}
              nextLevelXP={userStats.nextLevelXP}
              currentLevel={userStats.currentLevel}
              size="sm"
              showNumbers={false}
            />
            <div className="text-xs text-gray-500">
              {(userStats.nextLevelXP - userStats.currentXP).toLocaleString()} XP bis Level {userStats.currentLevel + 1}
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
          value={userStats.achievements.length}
          subtitle="Achievements"
          icon={FaTrophy}
          iconColor="text-yellow-500"
          className="md:col-span-1"
        >
          <div className="space-y-2">
            {userStats.achievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-2">
                <span className="text-sm">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {achievement.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </StatCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnelle Aktionen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <FaCalendarDay className="w-5 h-5 mr-2" />
            Lernsession starten
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
            <FaCheckCircle className="w-5 h-5 mr-2" />
            Aufgabe abhaken
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
            <FaChartLine className="w-5 h-5 mr-2" />
            Fortschritt ansehen
          </button>
        </div>
      </div>
    </Layout>
  );
}