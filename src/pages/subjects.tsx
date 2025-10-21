import Layout from '@/components/Layout';
import SubjectsList from '@/components/SubjectsList';
import { Subject } from '@/types';
import { useActiveSession } from '../hooks/useActiveSession';

export default function SubjectsPage() {
  const { startSession } = useActiveSession();

  const handleStartSession = async (subject: Subject) => {
    // Start with default 60-minute block and no notes when launched directly from the list
    await startSession({
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color,
      targetDuration: 60,
      notes: ''
    });
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
            <strong>Schnellstart:</strong> Klicken Sie auf den grünen &quot;Start&quot;-Button auf einer beliebigen Fach-Karte, um eine Lernsession zu beginnen.
            Der kompakte Timer erscheint in der Kopfzeile und Sessions werden automatisch in Ihrem Kalender gespeichert, wenn sie abgeschlossen sind.
          </p>
        </div>

        {/* Subjects Grid - Main focus */}
        <SubjectsList onStartSession={handleStartSession} />
      </div>
    </Layout>
  );
}
