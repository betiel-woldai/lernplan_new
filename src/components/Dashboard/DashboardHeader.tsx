import LevelBadge from '@/components/LevelBadge';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardHeaderProps {
  level: number;
  userName?: string | null;
}

// Displays the welcome message with the animated level badge.
export function DashboardHeader({ level, userName }: DashboardHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <LevelBadge level={level} size="lg" animated />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('header.overview')} 📅</h1>
            <p className="text-gray-600">{t('header.subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {userName && (
            <div className="text-sm font-medium text-gray-700 mb-1">
              {t('header.loggedInAs')}: {userName}
            </div>
          )}
          <div className="text-sm text-gray-500">{t('header.welcomeBack')}</div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
