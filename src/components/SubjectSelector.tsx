import React, { useEffect, useState } from 'react';
import { X, Play } from 'lucide-react';
import { useActiveSession } from '../hooks/useActiveSession';
import useSubjects from '../hooks/useSubjects';

interface SubjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionStarted?: () => void;
}

export default function SubjectSelector({ isOpen, onClose, onSessionStarted }: SubjectSelectorProps) {
  const { subjects, loading } = useSubjects();
  const { startSession } = useActiveSession();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    if (!selectedSubjectId) return;

    setIsStarting(true);
    try {
      // Find selected subject
      const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

      if (selectedSubject) {
        const sessionData = {
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          subjectColor: selectedSubject.color,
          targetDuration: 60,
          notes: ''
        };
        await startSession(sessionData);
      } else {
        throw new Error('Selected subject not found');
      }

      onClose();
      if (onSessionStarted) onSessionStarted();
    } catch (error) {
      console.error('Failed to start session:', error);
      // Show user-friendly error
      alert('Failed to start session. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSubjectId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Start Learning Session</h2>
              <p className="text-sm text-gray-600">Choose a subject to begin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Subject List */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading subjects...</span>
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <p className="mb-2">No subjects available</p>
              <p className="text-sm">Please create a subject first to start a session.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                    selectedSubjectId === subject.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">
                      {subject.name}
                    </div>
                  </div>
                  {selectedSubjectId === subject.id && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleStartSession}
            disabled={!selectedSubjectId || isStarting}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
              selectedSubjectId && !isStarting
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Start Session</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}