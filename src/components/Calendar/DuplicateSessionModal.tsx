import React, { useState } from 'react';
import { X, Copy, Calendar } from 'lucide-react';
import { CalendarSession } from '../../types/calendar';

interface DuplicateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CalendarSession | null;
  onDuplicate: (session: CalendarSession, targetDate: Date, count: number) => void;
}

const DEFAULT_USER_ID = '62d1b19b-3874-43b1-9424-ca7c2de10557';

export default function DuplicateSessionModal({ 
  isOpen, 
  onClose, 
  session, 
  onDuplicate 
}: DuplicateSessionModalProps) {
  const [targetDate, setTargetDate] = useState('');
  const [duplicateCount, setDuplicateCount] = useState(1);
  const [includeWeekdays, setIncludeWeekdays] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetDate) return;

    setIsSubmitting(true);

    try {
      const selectedDate = new Date(targetDate);
      
      if (includeWeekdays) {
        // Duplicate to multiple weekdays
        let currentDate = new Date(selectedDate);
        let created = 0;
        let attempts = 0;
        const maxAttempts = duplicateCount * 7; // Safety limit
        
        while (created < duplicateCount && attempts < maxAttempts) {
          // Skip weekends (Saturday = 6, Sunday = 0)
          if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            await onDuplicate(session, new Date(currentDate), 1);
            created++;
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
          attempts++;
        }
      } else {
        // Simple duplication to the target date
        await onDuplicate(session, selectedDate, duplicateCount);
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to duplicate session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTargetDate('');
    setDuplicateCount(1);
    setIncludeWeekdays(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Calculate default target date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Copy className="w-5 h-5" />
            <span>Session duplizieren</span>
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-medium text-gray-900">{session.title}</div>
            <div className="text-sm text-gray-600">
              {session.subjectName} - {session.startTime.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} bis {session.endTime.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              Zieldatum *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={defaultDate}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Duplication Options */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anzahl Kopien
              </label>
              <input
                type="number"
                value={duplicateCount}
                onChange={(e) => setDuplicateCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="30"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximale Anzahl: 30
              </p>
            </div>

            {duplicateCount > 1 && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeWeekdays"
                  checked={includeWeekdays}
                  onChange={(e) => setIncludeWeekdays(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="includeWeekdays" className="ml-2 block text-sm text-gray-700">
                  Nur an Werktagen (Mo-Fr) duplizieren
                </label>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <div className="font-medium text-blue-800 mb-1">Vorschau:</div>
            <div className="text-blue-700">
              {includeWeekdays && duplicateCount > 1
                ? `${duplicateCount} Sessions werden an aufeinanderfolgenden Werktagen erstellt, beginnend am ${targetDate ? new Date(targetDate).toLocaleDateString('de-DE') : 'ausgewählten Datum'}`
                : duplicateCount > 1
                ? `${duplicateCount} Sessions werden am ${targetDate ? new Date(targetDate).toLocaleDateString('de-DE') : 'ausgewählten Datum'} erstellt`
                : `1 Session wird am ${targetDate ? new Date(targetDate).toLocaleDateString('de-DE') : 'ausgewählten Datum'} erstellt`
              }
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting || !targetDate}
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <Copy className="w-4 h-4" />
              <span>{isSubmitting ? 'Dupliziert...' : 'Duplizieren'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}