import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, FileText } from 'lucide-react';
import { useSubjects } from '../../hooks/useSubjects';
import { CalendarSession } from '../../types/calendar';
import { getActiveUserId } from '@/utils/user';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSessionCreated: (session: CalendarSession) => void;
  preselectedSubjectId?: string;
  existingSessions?: CalendarSession[];
}

export default function CreateSessionModal({ 
  isOpen, 
  onClose, 
  selectedDate,
  onSessionCreated,
  preselectedSubjectId,
  existingSessions = []
}: CreateSessionModalProps) {
  const activeUserId = getActiveUserId();
  const { subjects } = useSubjects();
  
  const [formData, setFormData] = useState({
    title: '',
    subjectId: preselectedSubjectId || '',
    startTime: '09:00',
    endTime: '10:00', 
    description: '',
    location: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (preselectedSubjectId) {
      setFormData(prev => ({ ...prev, subjectId: preselectedSubjectId }));
    }
  }, [preselectedSubjectId]);

  useEffect(() => {
    if (selectedDate && isOpen) {
      const sortedSessions = [...existingSessions]
        .filter(session => session.startTime.toDateString() === selectedDate.toDateString())
        .sort((a, b) => a.endTime.getTime() - b.endTime.getTime());

      if (sortedSessions.length === 0) {
        setFormData(prev => ({
          ...prev,
          startTime: '09:00',
          endTime: '10:00',
        }));
        return;
      }

      const lastSession = sortedSessions[sortedSessions.length - 1];
      const nextStart = new Date(lastSession.endTime);

      // Round to next quarter hour for neat scheduling sequences
      const roundedMinutes = Math.ceil(nextStart.getMinutes() / 15) * 15;
      if (roundedMinutes === 60) {
        nextStart.setHours(nextStart.getHours() + 1, 0, 0, 0);
      } else {
        nextStart.setMinutes(roundedMinutes, 0, 0);
      }

      const proposedEnd = new Date(nextStart);
      proposedEnd.setMinutes(proposedEnd.getMinutes() + 60);

      // Clamp to late evening to avoid wrapping into next day
      if (proposedEnd.getDate() !== nextStart.getDate()) {
        nextStart.setHours(19, 0, 0, 0);
        proposedEnd.setHours(20, 0, 0, 0);
      }

      const startTime = `${nextStart.getHours().toString().padStart(2, '0')}:${nextStart.getMinutes().toString().padStart(2, '0')}`;
      const endTime = `${proposedEnd.getHours().toString().padStart(2, '0')}:${proposedEnd.getMinutes().toString().padStart(2, '0')}`;

      setFormData(prev => ({
        ...prev,
        startTime,
        endTime,
      }));
    }
  }, [selectedDate, isOpen, existingSessions]);

  const selectedSubject = subjects.find(s => s.id === formData.subjectId);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Bitte wählen Sie ein Fach aus';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Startzeit ist erforderlich';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Endzeit ist erforderlich';
    }

    // Validate time order
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      const end = new Date(`2000-01-01T${formData.endTime}:00`);
      
      if (start >= end) {
        newErrors.endTime = 'Endzeit muss nach der Startzeit liegen';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = new Date(`2000-01-01T${formData.startTime}:00`);
    const end = new Date(`2000-01-01T${formData.endTime}:00`);
    
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedDate || !selectedSubject) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create start and end datetime objects
      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [endHour, endMinute] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const sessionData = {
        userId: activeUserId,
        subjectId: formData.subjectId,
        title: formData.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        sessionType: 'study' as const,
        description: formData.description || undefined,
        location: formData.location || undefined,
      };

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Erstellen der Session');
      }

      const createdSession = await response.json();
      
      // Convert the created session to the expected format
      const formattedSession: CalendarSession = {
        ...createdSession,
        startTime: new Date(createdSession.startTime),
        endTime: new Date(createdSession.endTime),
        subjectName: selectedSubject.name,
        subjectColor: selectedSubject.color,
        duration: calculateDuration(),
        completed: false,
        type: 'study',
      };

      onSessionCreated(formattedSession);
      
      // Reset form and close modal
      setFormData({
        title: '',
        subjectId: preselectedSubjectId || '',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
      });
      setErrors({});
      onClose();

      // Emit event for calendar refresh
      window.dispatchEvent(new CustomEvent('sessionCreated', {
        detail: { session: formattedSession }
      }));

    } catch (error) {
      console.error('Failed to create session:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Unbekannter Fehler' });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Neue Session erstellen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date Display */}
          {selectedDate && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center space-x-2">
              <Calendar className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-blue-800">
                {selectedDate.toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="z.B. Mathematik Kapitel 3"
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fach *
            </label>
            <select
              value={formData.subjectId}
              onChange={(e) => handleInputChange('subjectId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                errors.subjectId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Fach auswählen...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjectId && <p className="text-red-600 text-xs mt-1">{errors.subjectId}</p>}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startzeit *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                  errors.startTime ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.startTime && <p className="text-red-600 text-xs mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endzeit *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                  errors.endTime ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.endTime && <p className="text-red-600 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Duration Display */}
          {formData.startTime && formData.endTime && (
            <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-2">
              <Clock className="text-gray-600" size={16} />
              <span className="text-sm text-gray-700">
                Dauer: {calculateDuration()} Minuten
              </span>
            </div>
          )}


          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="inline w-4 h-4 mr-1" />
              Ort
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="z.B. Bibliothek, Raum 101"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline w-4 h-4 mr-1" />
              Beschreibung
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              rows={3}
              placeholder="Zusätzliche Notizen zur Session..."
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Erstellt...' : 'Erstellen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
