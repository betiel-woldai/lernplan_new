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
        {/* Simple Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Info:</strong> Erstelle ein neues Fach mit "+ Fach hinzufügen", sodass alle Lernsessions automatisch in Deinem Kalender gespeichert und eingeplant werden.
          </p>
        </div>

        {/* Subjects Grid - Main focus */}
        <SubjectsList onStartSession={handleStartSession} />
      </div>
    </Layout>
  );
}
