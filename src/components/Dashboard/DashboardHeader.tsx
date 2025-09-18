import LevelBadge from '@/components/LevelBadge';

interface DashboardHeaderProps {
  level: number;
  userName?: string | null;
}

// Displays the welcome message with the animated level badge.
export function DashboardHeader({ level, userName }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <LevelBadge level={level} size="lg" animated />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Übersicht 📅</h1>
            <p className="text-gray-600">Dein zentraler Lernplaner mit Kalender und Fortschritt</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">Willkommen zurück, {userName || 'Nutzer'}! 👋</div>
      </div>
    </div>
  );
}

export default DashboardHeader;
