import React, { useState, useEffect } from 'react';
import { LearningSession } from '../hooks/useLearningSessions';
import { useSubjects } from '../hooks/useSubjects';
import { X, Calendar, Clock, FileText, CheckCircle, AlertCircle, Save, Trash2 } from 'lucide-react';

interface SessionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: LearningSession | null;
  onSave: (sessionId: string, updates: Partial<LearningSession>) => Promise<boolean>;
  onDelete?: (sessionId: string) => Promise<boolean>;
}

export default function SessionEditModal({
  isOpen,
  onClose,
  session,
  onSave,
  onDelete
}: SessionEditModalProps) {
  const { subjects } = useSubjects();
  const [formData, setFormData] = useState({
    subjectId: '',
    duration: 0,
    completed: false,
    notes: '',
    date: '',
    points: 0
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize form data when session changes
  useEffect(() => {
    if (session) {
      setFormData({
        subjectId: session.subjectId || '',
        duration: session.duration || 0,
        completed: session.completed || false,
        notes: session.notes || '',
        date: session.date || '',
        points: session.points || 0
      });
    }
  }, [session]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.subjectId) {
      errors.push('Subject is required');
    }
    if (formData.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }
    if (!formData.date) {
      errors.push('Date is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !validateForm()) return;

    setSaving(true);
    try {
      const updates = {
        subjectId: formData.subjectId,
        duration: formData.duration,
        completed: formData.completed,
        notes: formData.notes,
        points: formData.completed ? Math.floor(formData.duration * 2) : 0, // 2 XP per minute
      };

      const success = await onSave(session.id, updates);
      if (success) {
        // Dispatch real-time event for cross-view synchronization
        window.dispatchEvent(new CustomEvent('sessionUpdated', {
          detail: {
            sessionId: session.id,
            updates,
            timestamp: Date.now(),
            completionChanged: formData.completed !== session.completed
          }
        }));
        
        onClose();
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session || !onDelete) return;

    setDeleting(true);
    try {
      const success = await onDelete(session.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleCompletion = () => {
    setFormData(prev => ({
      ...prev,
      completed: !prev.completed,
      points: !prev.completed ? Math.floor(prev.duration * 2) : 0
    }));
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(session.createdAt).toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Please correct the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Completion Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  formData.completed ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="font-medium text-gray-900">
                  Status: {formData.completed ? 'Abgeschlossen' : 'Ausstehend'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleCompletion}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  formData.completed 
                    ? 'bg-green-100 hover:bg-green-200 text-green-800'
                    : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                }`}
              >
                {formData.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {formData.completed ? 'Als ausstehend markieren' : 'Als abgeschlossen markieren'}
                </span>
              </button>
            </div>
            
            {formData.completed && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium text-green-600">+{formData.points} XP</span> für diese abgeschlossene Session
              </div>
            )}
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a subject...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-2" />
              Duration
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                placeholder="Duration in minutes"
                required
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">
                = {formatDuration(formData.duration)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-2" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Add notes about this learning session..."
            />
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {/* Delete Button - Left Side */}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                disabled={saving || deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            )}

            {/* Cancel and Save Buttons - Right Side */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                disabled={saving || deleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                disabled={saving || deleting}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}