import Layout from '@/components/Layout';
import SubjectsList from '@/components/SubjectsList';
import { Subject } from '@/types';
import { useActiveSession } from '../hooks/useActiveSession';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SubjectsPage() {
  const { startSession } = useActiveSession();
  const { t } = useLanguage();

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
            <h1 className="text-2xl font-bold text-gray-900">{t('subject.yourLearningSubjects')}</h1>
            <p className="text-gray-600 mt-1">{t('subject.manageAndConfigureYourLearningSubjects')}</p>
          </div>
        </div>

        {/* Simple Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            {t('subjects.quickStart')}
          </p>
        </div>

        {/* Subjects Grid - Main focus */}
        <SubjectsList onStartSession={handleStartSession} />
      </div>
    </Layout>
  );
}
