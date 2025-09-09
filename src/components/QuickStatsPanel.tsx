import CompactStatWidget from '@/components/CompactStatWidget';
import XPBar from '@/components/XPBar';
import StreakDisplay from '@/components/StreakDisplay';
import AchievementBadge from '@/components/AchievementBadge';
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
  FaCalendarCheck
} from 'react-icons/fa';

export default function QuickStatsPanel() {
  const userStats = mockUserStats;
  const gamification = useGamification();
  const xpProgress = getXPProgress(gamification.currentXP, gamification.currentLevel);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <FaChartLine className="text-gray-600 w-4 h-4" />
        <h2 className="text-lg font-semibold text-gray-900">Schnellübersicht</h2>
      </div>

      {/* Daily Learning Time */}
      <CompactStatWidget
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
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (userStats.dailyLearningTime / 120) * 100)}%` }}
          />
        </div>
      </CompactStatWidget>

      {/* Learning Streak */}
      <CompactStatWidget
        title="Lernstreak"
        value={gamification.streak}
        subtitle="Tage"
        icon={FaFire}
        iconColor="text-orange-500"
        trend={{
          value: 20,
          label: "Neuer Rekord!",
          isPositive: true
        }}
      >
        <StreakDisplay 
          streak={gamification.streak} 
          size="xs"
          onStreakMilestone={(milestone) => {
            console.log(`Streak milestone reached: ${milestone}`);
          }}
        />
      </CompactStatWidget>

      {/* Level Progress */}
      <CompactStatWidget
        title="Level & XP"
        value={`Level ${gamification.currentLevel}`}
        subtitle={`${formatNumber(gamification.currentXP)} XP`}
        icon={FaTrophy}
        iconColor="text-yellow-500"
      >
        <div className="space-y-1">
          <XPBar
            currentXP={gamification.currentXP}
            nextLevelXP={userStats.nextLevelXP}
            currentLevel={gamification.currentLevel}
            size="xs"
            showNumbers={false}
          />
          <div className="text-xs text-gray-500">
            {formatRemainingXP((userStats.nextLevelXP - gamification.currentXP), gamification.currentLevel + 1)}
          </div>
        </div>
      </CompactStatWidget>

      {/* Completed Tasks */}
      <CompactStatWidget
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
          Gesamt: {formatNumber(userStats.totalCompletedTasks)}
        </div>
      </CompactStatWidget>

      {/* Weekly Overview */}
      <CompactStatWidget
        title="Wochenfortschritt"
        value={formatLearningTime(userStats.weeklyLearningTime)}
        subtitle="diese Woche"
        icon={FaChartLine}
        iconColor="text-purple-500"
      >
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Fortschritt</span>
            <span className="font-medium">{Math.round((userStats.weeklyLearningTime / (35 * 60)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (userStats.weeklyLearningTime / (35 * 60)) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            Ziel: 35h
          </div>
        </div>
      </CompactStatWidget>

      {/* Recent Achievements */}
      <CompactStatWidget
        title="Letzte Erfolge"
        value={gamification.achievements.length}
        subtitle="Achievements"
        icon={FaTrophy}
        iconColor="text-yellow-500"
      >
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {gamification.achievements.slice(0, 3).map((achievement, index) => (
              <AchievementBadge
                key={index}
                achievement={achievement}
                size="xs"
              />
            ))}
          </div>
          {gamification.getNewAchievementsCount() > 0 && (
            <p className="text-xs text-yellow-500 font-medium">
              {gamification.getNewAchievementsCount()} neue!
            </p>
          )}
        </div>
      </CompactStatWidget>
    </div>
  );
}