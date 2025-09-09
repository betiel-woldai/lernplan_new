import Layout from '@/components/Layout';
import Calendar from '@/components/Calendar/Calendar';
import QuickStatsPanel from '@/components/QuickStatsPanel';
import LevelBadge from '@/components/LevelBadge';
import { XPToastContainer } from '@/components/XPToast';
import LevelUpModal from '@/components/LevelUpModal';
import useGamification from '@/hooks/useGamification';
import { mockUserStats } from '@/utils/mockData';
import { formatLearningTime, getXPProgress } from '@/utils/formatters';
import { formatXPTotal } from '@/utils/format';

// React Icons
import { 
  FaCalendarAlt,
  FaHome
} from 'react-icons/fa';

export default function Uebersicht() {
  const userStats = mockUserStats;
  const gamification = useGamification();
  const xpProgress = getXPProgress(gamification.currentXP, gamification.currentLevel);

  return (
    <Layout title="Übersicht - Lernplaner">
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <FaHome className="text-blue-600 w-6 h-6" />
          <LevelBadge level={gamification.currentLevel} size="md" animated />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Übersicht - {userStats.name} 👋
            </h1>
            <p className="text-gray-600 text-sm">
              Deine zentrale Lernübersicht mit Kalender und wichtigen Statistiken
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Calendar-Primary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Calendar - Primary View (3/4 width) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-blue-600 w-5 h-5" />
                <h2 className="text-lg font-semibold text-gray-900">Lernkalender</h2>
                <span className="text-sm text-gray-500">- Zentrale Terminübersicht</span>
              </div>
            </div>
            <div className="p-4">
              <Calendar />
            </div>
          </div>
        </div>

        {/* Quick Stats Panel - Sidebar (1/4 width) */}
        <div className="lg:col-span-1">
          <QuickStatsPanel />
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