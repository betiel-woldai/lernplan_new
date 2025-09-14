import React, { useState, useEffect } from 'react';
import { CalendarSession } from '../../types/calendar';
import { useSubjects } from '../../hooks/useSubjects';
import { X, Calendar, Clock, FileText, CheckCircle, AlertCircle, Save, MapPin, Trash2 } from 'lucide-react';

interface CalendarSessionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CalendarSession | null;
  onSave: (sessionId: string, updates: Partial<CalendarSession>) => Promise<boolean>;
  onDelete?: (sessionId: string) => Promise<boolean>;
}

const DEFAULT_USER_ID = '62d1b19b-3874-43b1-9424-ca7c2de10557';

export default function CalendarSessionEditModal({ 
  isOpen, 
  onClose, 
  session, 
  onSave,
  onDelete 
}: CalendarSessionEditModalProps) {
  const { subjects } = useSubjects();
  
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    startTime: '',
    endTime: '',
    sessionType: 'study' as 'study' | 'exam' | 'break' | 'assignment',
    completed: false,
    description: '',
    location: '',
    date: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize form data when session changes
  useEffect(() => {
    if (session) {
      const sessionDate = new Date(session.startTime);
      const startHour = sessionDate.getHours().toString().padStart(2, '0');
      const startMinute = sessionDate.getMinutes().toString().padStart(2, '0');
      const endDate = new Date(session.endTime);
      const endHour = endDate.getHours().toString().padStart(2, '0');
      const endMinute = endDate.getMinutes().toString().padStart(2, '0');
      
      setFormData({
        title: session.title || '',
        subjectId: session.subjectId || '',
        startTime: `${startHour}:${startMinute}`,
        endTime: `${endHour}:${endMinute}`,
        sessionType: session.type || 'study',
        completed: session.completed || false,
        description: session.description || '',
        location: session.location || '',
        date: sessionDate.toISOString().split('T')[0] // YYYY-MM-DD format
      });
    }
  }, [session]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('Titel ist erforderlich');
    }
    if (!formData.subjectId) {
      errors.push('Fach ist erforderlich');
    }
    if (!formData.startTime) {
      errors.push('Startzeit ist erforderlich');
    }
    if (!formData.endTime) {
      errors.push('Endzeit ist erforderlich');
    }
    if (!formData.date) {
      errors.push('Datum ist erforderlich');
    }

    // Validate time order
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      const end = new Date(`2000-01-01T${formData.endTime}:00`);
      
      if (start >= end) {
        errors.push('Endzeit muss nach der Startzeit liegen');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const calculateDuration = (): number => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = new Date(`2000-01-01T${formData.startTime}:00`);
    const end = new Date(`2000-01-01T${formData.endTime}:00`);
    
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !validateForm()) return;

    setSaving(true);
    try {
      // Create new datetime objects
      const startDateTime = new Date(formData.date);
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(formData.date);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const updates: Partial<CalendarSession> = {
        title: formData.title,
        subjectId: formData.subjectId,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: calculateDuration(),
        type: formData.sessionType,
        completed: formData.completed,
        description: formData.description || undefined,
        location: formData.location || undefined,
      };

      // Call API to update session
      const response = await fetch(`/api/calendar/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
          ...updates,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      // Dispatch real-time event for cross-view synchronization
      window.dispatchEvent(new CustomEvent('sessionUpdated', {
        detail: {
          sessionId: session.id,
          updates,
          timestamp: Date.now(),
          completionChanged: formData.completed !== session.completed
        }
      }));

      const success = await onSave(session.id, updates);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to update session:', error);
      setValidationErrors(['Fehler beim Speichern der Session']);
    } finally {
      setSaving(false);
    }
  };

  const toggleCompletion = () => {
    setFormData(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };

  const handleDelete = async () => {
    if (!session || !onDelete) return;
    
    const confirmDelete = window.confirm(
      `Sind Sie sicher, dass Sie die Session "${session.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`
    );
    
    if (!confirmDelete) return;
    
    setDeleting(true);
    try {
      const success = await onDelete(session.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      setValidationErrors(['Fehler beim Löschen der Session']);
    } finally {
      setDeleting(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  const sessionTypes = [
    { value: 'study', label: 'Lernsession', icon: '📚' },
    { value: 'exam', label: 'Prüfung', icon: '📝' },
    { value: 'assignment', label: 'Aufgabe', icon: '📋' },
    { value: 'break', label: 'Pause', icon: '☕' },
  ];

  if (!isOpen || !session) return null;

  const selectedSubject = subjects.find(s => s.id === formData.subjectId);
  const duration = calculateDuration();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Session bearbeiten</h2>
              <p className="text-sm text-gray-500 mt-1">
                {session.subjectName} - {new Date(session.startTime).toLocaleDateString('de-DE', { 
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
              disabled={saving}
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
                <span className="text-sm font-medium text-red-800">Bitte korrigieren Sie folgende Fehler:</span>
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
            
            {formData.completed && duration > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium text-green-600">+{Math.floor(duration * 2)} XP</span> für diese abgeschlossene Session
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. Mathematik Kapitel 3"
              required
            />
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fach *
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Fach auswählen...</option>
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
              Datum *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Startzeit *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endzeit *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center space-x-2">
              <Clock className="text-blue-600" size={16} />
              <span className="text-sm text-blue-700">
                Dauer: {formatDuration(duration)}
              </span>
            </div>
          )}

          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session-Typ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sessionTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                    formData.sessionType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="sessionType"
                    value={type.value}
                    checked={formData.sessionType === type.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, sessionType: e.target.value as any }))}
                    className="sr-only"
                  />
                  <span className="text-sm">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Ort
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. Bibliothek, Raum 101"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-2" />
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Zusätzliche Notizen zur Session..."
            />
          </div>

          {/* Timeline Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Timeline-Informationen</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Original erstellt:</span>
                <div className="text-blue-600">
                  {new Date(session.startTime).toLocaleDateString('de-DE')}
                </div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Neues Datum:</span>
                <div className="text-blue-600">
                  {formData.date ? new Date(formData.date).toLocaleDateString('de-DE') : 'Nicht gesetzt'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            {/* Delete Button */}
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
                    <span>Löscht...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Session löschen</span>
                  </>
                )}
              </button>
            )}
            
            {/* Save and Cancel Buttons */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                disabled={saving || deleting}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                disabled={saving || deleting}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Speichert...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Änderungen speichern</span>
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