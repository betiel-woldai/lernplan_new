import { useState } from 'react';
import Layout from '@/components/Layout';
import SubjectsList from '@/components/SubjectsList';
import SessionTimer from '@/components/SessionTimer';
import StartSessionModal from '@/components/StartSessionModal';
import SessionHistory from '@/components/SessionHistory';
import { Play, History, BarChart3, Calendar } from 'lucide-react';

export default function SubjectsPage() {
  const [showStartSession, setShowStartSession] = useState(false);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const handleStartSession = (subject: any) => {
    setSelectedSubjectId(subject.id);
    setShowStartSession(true);
  };

  return (
    <Layout title="Lerntracker-Zentrale - Lernplaner">
      <div className="space-y-8">
        {/* Lerntracker-Zentrale - Always visible enhanced timer */}
        <SessionTimer 
          onStartSession={() => setShowStartSession(true)}
          className="mb-8"
        />

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Command Center</h1>
            <p className="text-gray-600">Manage your subjects and track learning progress</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSessionHistory(!showSessionHistory)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <History size={18} />
              <span>Session History</span>
            </button>
            <button
              onClick={() => setShowStartSession(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Play size={18} />
              <span>Quick Start</span>
            </button>
          </div>
        </div>

        {/* Session History (collapsible) */}
        {showSessionHistory && (
          <div className="bg-white rounded-xl shadow-lg p-1">
            <SessionHistory className="mb-0" />
          </div>
        )}

        {/* Subjects Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Learning Subjects</h2>
            <div className="text-sm text-gray-500">
              Click any subject card to start a focused session
            </div>
          </div>
          <SubjectsList onStartSession={handleStartSession} />
        </div>
      </div>

      {/* Start Session Modal */}
      <StartSessionModal
        isOpen={showStartSession}
        onClose={() => {
          setShowStartSession(false);
          setSelectedSubjectId(undefined);
        }}
        preselectedSubjectId={selectedSubjectId}
      />
    </Layout>
  );
}