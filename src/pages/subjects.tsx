import { useState } from 'react';
import Layout from '@/components/Layout';
import SubjectsList from '@/components/SubjectsList';
import { useActiveSession } from '../hooks/useActiveSession';

export default function SubjectsPage() {
  const { startSession } = useActiveSession();

  const handleStartSession = async (subject: any) => {
    // Simplified: start session immediately without modal/duration selection
    await startSession(subject.id, 60, ''); // Default 60 minutes, no notes
  };

  return (
    <Layout title="Learning Subjects - Lernplaner">
      <div className="space-y-6">
        {/* Simple header - subject management focused */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Learning Subjects</h1>
            <p className="text-gray-600 mt-1">Manage and configure your learning subjects</p>
          </div>
        </div>

        {/* Simple Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Quick Start:</strong> Click the green "Start" button on any subject card to begin a learning session. 
            The compact timer will appear in the header and sessions automatically save to your calendar when completed.
          </p>
        </div>

        {/* Subjects Grid - Main focus */}
        <SubjectsList onStartSession={handleStartSession} />
      </div>
    </Layout>
  );
}