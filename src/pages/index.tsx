import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Calendar from '@/components/Calendar/Calendar';
import QuickStatsPanel from '@/components/QuickStatsPanel';
import LevelBadge from '@/components/LevelBadge';
import { XPToastContainer } from '@/components/XPToast';
import LevelUpModal from '@/components/LevelUpModal';
import { CalendarSession } from '@/types/calendar';
import { useSubjects } from '@/hooks/useSubjects';
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
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const { subjects, loading: subjectsLoading, refreshSubjects } = useSubjects();
  const userStats = mockUserStats;
  const gamification = useGamification();
  const xpProgress = getXPProgress(gamification.currentXP, gamification.currentLevel);

  // Listen for subject changes to refresh legend
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
              <Calendar
                onSessionClick={handleSessionClick}
                onDateClick={handleDateClick}
                onCreateSession={handleCreateSession}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Panel - Sidebar (1/4 width) */}
        <div className="lg:col-span-1">
          <QuickStatsPanel />
        </div>
      </div>

      {/* Session Details (if session selected) */}
      {selectedSession && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Titel</p>
              <p className="font-medium text-gray-900">{selectedSession.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fach</p>
              <p className="font-medium" style={{ color: selectedSession.subjectColor }}>
                {selectedSession.subjectName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Zeit</p>
              <p className="font-medium text-gray-900">
                {selectedSession.startTime.toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {selectedSession.endTime.toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Typ</p>
              <p className="font-medium text-gray-900 capitalize">{selectedSession.type}</p>
            </div>
            {selectedSession.location && (
              <div>
                <p className="text-sm text-gray-600">Ort</p>
                <p className="font-medium text-gray-900">{selectedSession.location}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`font-medium ${selectedSession.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                {selectedSession.completed ? 'Abgeschlossen' : 'Geplant'}
              </p>
            </div>
          </div>
          {selectedSession.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Beschreibung</p>
              <p className="text-gray-900 mt-1">{selectedSession.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Calendar Legend */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kalender Legende</h3>
        {subjectsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-gray-500">Lade Fächer...</div>
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: subject.color }}
                ></div>
                <span className="text-sm text-gray-700 truncate">{subject.name}</span>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gray-400 opacity-70"></div>
              <span className="text-sm text-gray-700">Abgeschlossen</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Keine Fächer vorhanden.</p>
            <p className="text-gray-400 text-xs mt-1">Füge Fächer hinzu, um sie hier zu sehen.</p>
          </div>
        )}
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