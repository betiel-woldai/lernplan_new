import DirectCalendarStats from '@/components/DirectCalendarStats';
import AchievementBadge from '@/components/AchievementBadge';
import { Achievement } from '@/types';
import { formatXPTotal } from '@/utils/format';
import { getLearningRank } from '@/utils/formatters';
import { FaTrophy } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatsSidebarProps {
  realtimeXP: number;
  realtimeLevel: number;
  nextLevelXP: number;
  selectedDate: Date | null;
  realtimeStreak?: number;
  achievements?: Achievement[];
  showAchievements?: boolean;
  loading?: boolean;
}

// Collects the right-hand sidebar widgets (XP bar, calendar stats, optional achievements).
export function StatsSidebar({
  realtimeXP,
  realtimeLevel,
  nextLevelXP,
  selectedDate,
  achievements = [],
  showAchievements = false,
  loading = false,
}: StatsSidebarProps) {
  const { t } = useLanguage();
  const xpLabel = loading ? '…' : formatXPTotal(realtimeXP);
  const rankKey = getLearningRank(realtimeLevel);
  const rankName = loading ? '…' : t(rankKey);

  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4" data-testid="gamification-section">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-900">{t('stats.rank')}</h3>
            <span className="text-sm text-indigo-600 font-medium">{rankName}</span>
          </div>
          <span className="text-xs text-gray-500" data-testid="total-xp">
            {xpLabel}
          </span>
        </div>
        {/* Progress bar removed to avoid showing potentially non-actual XP progress */}
      </div>

      <DirectCalendarStats selectedDate={selectedDate || undefined} />

      {showAchievements && (
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <FaTrophy className="text-yellow-500 text-sm" />
              <span className="text-xs font-medium text-yellow-900">Achievements</span>
            </div>
            <span className="text-sm font-bold text-yellow-900">{achievements.length}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2" data-testid="achievement-badges">
            {achievements.slice(0, 3).map((achievement, index) => (
              <AchievementBadge key={index} achievement={achievement} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsSidebar;
