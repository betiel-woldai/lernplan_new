import CompactStatWidget from '@/components/CompactStatWidget';
import StreakDisplay from '@/components/StreakDisplay';
import AchievementBadge from '@/components/AchievementBadge';
import useGamification from '@/hooks/useGamification';
import { useDateSpecificStats } from '@/hooks/useDateSpecificStats';
// Progress removed; keep level/XP numbers only
import { formatNumber } from '@/utils/format';

// React Icons
import { 
  FaClock, 
  FaCheckCircle, 
  FaFire, 
  FaTrophy,
  FaChartLine,
  FaCalendarCheck
} from 'react-icons/fa';

interface QuickStatsPanelProps {
  selectedDate?: Date | null;
}

export default function QuickStatsPanel({ selectedDate }: QuickStatsPanelProps) {
  const { stats, loading, error } = useDateSpecificStats(selectedDate);
  const gamification = useGamification();

  // Format the date label for the UI
  const getDateLabel = () => {
    if (!selectedDate) return 'Heutige';
    if (stats.isToday) return 'Heutige';
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short' 
    };
    return selectedDate.toLocaleDateString('de-DE', options);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <FaChartLine className="text-gray-600 w-4 h-4" />
        <h2 className="text-lg font-semibold text-gray-900">Schnellübersicht</h2>
      </div>

      {/* Daily Learning Time */}
      <CompactStatWidget
        title={`${getDateLabel()} Lernzeit`}
        value={loading ? 'Laden...' : stats.formattedDuration}
        subtitle={`${stats.completedSessions} Sessions abgeschlossen`}
        icon={FaClock}
        iconColor="text-blue-500"
        trend={{
          value: stats.completionRate,
          label: stats.isToday ? "heute" : "an diesem Tag",
          isPositive: stats.completionRate > 0
        }}
      >
        {!loading && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stats.completedDuration / 120) * 100)}%` }}
            />
          </div>
        )}
        {error && (
          <div className="text-xs text-red-500 mt-1">
            Fehler beim Laden
          </div>
        )}
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
          size="sm"
          onStreakMilestone={(milestone) => {
            console.log(`Streak milestone reached: ${milestone}`);
          }}
        />
      </CompactStatWidget>

      {/* Level & XP (numbers only; progress removed) */}
      <CompactStatWidget
        title="Level & XP"
        value={`Level ${gamification.currentLevel}`}
        subtitle={`${formatNumber(gamification.currentXP)} XP`}
        icon={FaTrophy}
        iconColor="text-yellow-500"
      />

      {/* Completed Sessions */}
      <CompactStatWidget
        title={`${stats.isToday ? 'Heutige' : 'Sessions am'} Sessions`}
        value={loading ? '...' : stats.completedSessions}
        subtitle={stats.isToday ? 'heute' : getDateLabel()}
        icon={FaCheckCircle}
        iconColor="text-green-500"
        trend={{
          value: stats.completionRate,
          label: `${stats.completionRate}% abgeschlossen`,
          isPositive: stats.completionRate > 0
        }}
      >
        <div className="text-xs text-gray-500">
          {stats.totalSessions > 0 ? 
            `${stats.completedSessions} von ${stats.totalSessions}` : 
            'Keine Sessions geplant'
          }
        </div>
      </CompactStatWidget>

      {/* Weekly Overview */}
      <CompactStatWidget
        title="Wochenfortschritt"
        value={loading ? 'Laden...' : stats.formattedWeeklyDuration}
        subtitle="diese Woche"
        icon={FaChartLine}
        iconColor="text-purple-500"
      >
        {!loading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Sessions</span>
              <span className="font-medium">{stats.thisWeekCompleted} / {stats.thisWeekSessions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.thisWeekCompletedDuration / (35 * 60)) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Ziel: 35h pro Woche
            </div>
          </div>
        )}
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
                size="sm"
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
