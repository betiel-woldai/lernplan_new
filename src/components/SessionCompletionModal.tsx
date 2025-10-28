import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, CheckCircle, XCircle, Edit3 } from 'lucide-react';

interface SessionCompletionModalProps {
  isOpen: boolean;
  onApprove: (finalDuration: number, finalNotes?: string) => void;
  onDiscard: () => void;
  subjectName: string;
  subjectColor: string;
  targetDuration: number; // in minutes
  actualDuration: number; // in minutes
  notes?: string;
}

export default function SessionCompletionModal({
  isOpen,
  onApprove,
  onDiscard,
  subjectName,
  subjectColor,
  targetDuration,
  actualDuration,
  notes
}: SessionCompletionModalProps) {
  const [editedDuration, setEditedDuration] = useState<number>(actualDuration);
  const [editedNotes, setEditedNotes] = useState<string>(notes || '');

  // Keep local state in sync when the modal opens or incoming values change
  useEffect(() => {
    if (isOpen) {
      setEditedDuration(actualDuration);
      setEditedNotes(notes || '');
    }
  }, [isOpen, actualDuration, notes]);

  if (!isOpen) return null;

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleApprove = () => {
    onApprove(editedDuration, editedNotes);
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          {/* Modal */}
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: subjectColor }}
            />
            <h2 className="text-xl font-bold text-gray-900">Session beenden</h2>
          </div>

          {/* Session Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{subjectName}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Geplant: {formatDuration(targetDuration)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Tatsächlich: {formatDuration(actualDuration)}</span>
              </div>
            </div>
          </div>

          {/* Edit Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Edit3 className="w-4 h-4 inline mr-1" />
              Finale Dauer (Minuten)
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={editedDuration}
              onChange={(e) => setEditedDuration(parseInt(e.target.value) || actualDuration)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Edit Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notizen (optional)
            </label>
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Session-Notizen hinzufügen..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Session speichern
            </button>
            <button
              onClick={onDiscard}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Verwerfen
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );

  // Use portal to render modal at body level, ensuring it appears above everything
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
