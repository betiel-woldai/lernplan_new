import { useState } from 'react';
import Layout from '@/components/Layout';
import SubjectsList from '@/components/SubjectsList';
import SessionTimer from '@/components/SessionTimer';
import StartSessionModal from '@/components/StartSessionModal';
import SessionHistory from '@/components/SessionHistory';
import { Play, History } from 'lucide-react';

export default function SubjectsPage() {
  const [showStartSession, setShowStartSession] = useState(false);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const handleStartSession = (subject: any) => {
    setSelectedSubjectId(subject.id);
    setShowStartSession(true);
  };

  return (
    <Layout title="Subjects - Lernplaner">
      <div className="space-y-6">
        {/* Active Session Timer (shows when session is active) */}
        <SessionTimer />

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Learning Subjects</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSessionHistory(!showSessionHistory)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <History size={18} />
              <span>Session History</span>
            </button>
            <button
              onClick={() => setShowStartSession(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Play size={18} />
              <span>Start Session</span>
            </button>
          </div>
        </div>

        {/* Session History (collapsible) */}
        {showSessionHistory && (
          <SessionHistory className="mb-6" />
        )}

        {/* Subjects List */}
        <SubjectsList onStartSession={handleStartSession} />
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