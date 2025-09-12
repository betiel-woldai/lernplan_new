import React, { useState, useEffect } from 'react';
import { X, Play, Clock } from 'lucide-react';
import { useSubjects } from '../hooks/useSubjects';
import { useActiveSession } from '../hooks/useActiveSession';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedSubjectId?: string;
}

export default function StartSessionModal({ 
  isOpen, 
  onClose, 
  preselectedSubjectId 
}: StartSessionModalProps) {
  const { subjects } = useSubjects();
  const { startSession } = useActiveSession();
  
  const [selectedSubjectId, setSelectedSubjectId] = useState(preselectedSubjectId || '');
  const [targetDuration, setTargetDuration] = useState(25); // Default 25 minutes (Pomodoro)
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedSubjectId) {
      setSelectedSubjectId(preselectedSubjectId);
    } else if (subjects.length > 0 && !selectedSubjectId) {
      // Auto-select first subject if no preselection and no current selection
      setSelectedSubjectId(subjects[0].id);
    }
  }, [preselectedSubjectId, subjects, selectedSubjectId]);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject) {
      return;
    }

    setIsSubmitting(true);

    try {
      await startSession({
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectColor: selectedSubject.color,
        targetDuration,
        notes: notes.trim() || undefined
      });

      onClose();
      // Reset form
      setSelectedSubjectId(preselectedSubjectId || '');
      setTargetDuration(25);
      setNotes('');
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 25, label: '25 minutes (Pomodoro)' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Start Learning Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Subject Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {subjects.map((subject) => (
                <label
                  key={subject.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSubjectId === subject.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="subject"
                    value={subject.id}
                    checked={selectedSubjectId === subject.id}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{subject.name}</div>
                    <div className="text-sm text-gray-500">
                      {Math.round(subject.completedHours)}h / {Math.round(subject.targetHours)}h completed
                    </div>
                  </div>
                  {selectedSubjectId === subject.id && (
                    <div className="text-blue-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
            {subjects.length === 0 && (
              <p className="text-gray-500 text-sm">
                No subjects found. Create a subject first to start a session.
              </p>
            )}
          </div>

          {/* Duration Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Duration
            </label>
            <select
              value={targetDuration}
              onChange={(e) => setTargetDuration(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Session Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What do you plan to work on during this session?"
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {notes.length}/500
            </div>
          </div>

          {/* Session Preview */}
          {selectedSubject && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedSubject.color }}
                />
                <span className="font-medium">{selectedSubject.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>Duration: {targetDuration} minutes</span>
              </div>
              {notes && (
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Notes:</strong> {notes}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSubject || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              <Play size={18} />
              <span>{isSubmitting ? 'Starting...' : 'Start Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}