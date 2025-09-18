import React, { useState, useCallback, useEffect } from 'react';
import { CalendarView, CalendarSession, CalendarViewState } from '../../types/calendar';
import CalendarGrid from './CalendarGrid';
import CalendarWeekView from './CalendarWeekView';
import CalendarDayView from './CalendarDayView';
import CalendarViewToggle from './CalendarViewToggle';
import CreateSessionModal from './CreateSessionModal';
import CalendarSessionEditModal from './CalendarSessionEditModal';
import DuplicateSessionModal from './DuplicateSessionModal';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import useCalendarSessions from '../../hooks/useCalendarSessions';
import { useLearningSessions } from '../../hooks/useLearningSessions';
import { getActiveUserId } from '@/utils/user';
import { getBerlinTimestamp } from '@/utils/timezone';

interface CalendarProps {
  onSessionClick?: (session: CalendarSession) => void;
  onDateClick?: (date: Date) => void;
  onCreateSession?: (date: Date) => void;
  selectedSession?: CalendarSession | null;
  subjects?: any[];
}

export default function Calendar({ 
  onSessionClick = () => {}, 
  onDateClick = () => {},
  onCreateSession = () => {},
  selectedSession,
  subjects
}: CalendarProps) {
  
  const activeUserId = getActiveUserId();
  const [viewState, setViewState] = useState<CalendarViewState>({
    currentView: 'month',
    currentDate: new Date(),
    selectedDate: null
  });

  // Modal state
  const [createModalState, setCreateModalState] = useState({
    isOpen: false,
    selectedDate: null as Date | null,
  });

  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    session: null as CalendarSession | null,
  });

  const [duplicateModalState, setDuplicateModalState] = useState({
    isOpen: false,
    session: null as CalendarSession | null,
  });

  const {
    sessions,
    loading,
    error,
    fetchSessionsForMonth,
    getSessionsForDate,
    updateSession,
    deleteSession: deleteCalendarSession,
    syncFromSubjects
  } = useCalendarSessions();

  const { deleteSession: deleteLearningSession } = useLearningSessions();

  // Load sessions for current month on mount and when month changes
  useEffect(() => {
    const currentYear = viewState.currentDate.getFullYear();
    const currentMonth = viewState.currentDate.getMonth() + 1; // API expects 1-based month
    fetchSessionsForMonth(currentYear, currentMonth);
  }, [viewState.currentDate, fetchSessionsForMonth]);

  // Listen for subject changes and auto-sync calendar
  useEffect(() => {
    const handleSubjectChange = async () => {
      console.log('Subject changed, syncing calendar...');
      await syncFromSubjects();
    };

    const handleSessionCreated = async () => {
      console.log('Session created, refreshing calendar...');
      const currentYear = viewState.currentDate.getFullYear();
      const currentMonth = viewState.currentDate.getMonth() + 1;
      await fetchSessionsForMonth(currentYear, currentMonth);
    };

    // Listen to custom events from subject hooks
    window.addEventListener('subjectCreated', handleSubjectChange);
    window.addEventListener('subjectUpdated', handleSubjectChange);  
    window.addEventListener('subjectDeleted', handleSubjectChange);
    
    // Listen for session creation
    window.addEventListener('sessionCreated', handleSessionCreated);

    return () => {
      window.removeEventListener('subjectCreated', handleSubjectChange);
      window.removeEventListener('subjectUpdated', handleSubjectChange);
      window.removeEventListener('subjectDeleted', handleSubjectChange);
      window.removeEventListener('sessionCreated', handleSessionCreated);
    };
  }, [syncFromSubjects, viewState.currentDate, fetchSessionsForMonth]);

  useEffect(() => {
    const handleExternalEditRequest = (event: Event) => {
      const { detail } = event as CustomEvent<{ sessionId?: string }>;
      const sessionId = detail?.sessionId;
      if (!sessionId) {
        return;
      }

      const sessionToEdit = sessions.find(s => s.id === sessionId);
      if (!sessionToEdit) {
        console.warn('Calendar: requested edit for unknown session', sessionId);
        return;
      }

      setEditModalState({
        isOpen: true,
        session: sessionToEdit,
      });
    };

    window.addEventListener('calendarSessionEditRequested', handleExternalEditRequest as EventListener);
    return () => {
      window.removeEventListener('calendarSessionEditRequested', handleExternalEditRequest as EventListener);
    };
  }, [sessions]);

  const handleViewChange = useCallback((view: CalendarView) => {
    setViewState(prev => ({ ...prev, currentView: view }));
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setViewState(prev => ({ ...prev, selectedDate: date }));
    // Just select the date, don't automatically open create modal
    onDateClick(date);
  }, [onDateClick]);

  const handleCreateSession = useCallback((date: Date) => {
    setCreateModalState({
      isOpen: true,
      selectedDate: date,
    });
    onCreateSession(date);
  }, [onCreateSession]);

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalState({
      isOpen: false,
      selectedDate: null,
    });
  }, []);

  const handleSessionCreated = useCallback(async (session: CalendarSession) => {
    // Refresh sessions after creation
    const currentYear = viewState.currentDate.getFullYear();
    const currentMonth = viewState.currentDate.getMonth() + 1;
    await fetchSessionsForMonth(currentYear, currentMonth);
  }, [viewState.currentDate, fetchSessionsForMonth]);

  const handleEditSession = useCallback((session: CalendarSession) => {
    setEditModalState({
      isOpen: true,
      session: session,
    });
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalState({
      isOpen: false,
      session: null,
    });
  }, []);

  const handleSessionEdited = useCallback(async (sessionId: string, updates: Partial<CalendarSession>) => {
    // Use the existing updateSession method
    const success = await updateSession(sessionId, updates);
    if (success) {
      // Refresh sessions after editing
      const currentYear = viewState.currentDate.getFullYear();
      const currentMonth = viewState.currentDate.getMonth() + 1;
      await fetchSessionsForMonth(currentYear, currentMonth);
    }
    return success;
  }, [updateSession, viewState.currentDate, fetchSessionsForMonth]);

  const handleDuplicateSession = useCallback((session: CalendarSession) => {
    setDuplicateModalState({
      isOpen: true,
      session: session,
    });
  }, []);

  const handleDeleteSession = useCallback(async (session: CalendarSession) => {
    try {
      const confirmed = window.confirm(`Sind Sie sicher, dass Sie "${session.title}" löschen möchten?`);
      if (!confirmed) return;

      // Check session source to determine which delete function to use
      const sessionSource = session.source ?? 'calendar';

      let success = false;
      if (sessionSource === 'learning') {
        success = await deleteLearningSession(session.id);
      } else {
        success = await deleteCalendarSession(session.id);
      }

      if (success) {
        if (sessionSource === 'learning') {
          window.dispatchEvent(new CustomEvent('sessionDeleted', {
            detail: {
              sessionId: session.id,
              source: sessionSource,
              timestamp: Date.now(),
            }
          }));
        }

        console.log('Session deleted successfully:', session.id, 'source:', sessionSource);
        // Refresh sessions after deletion
        const currentYear = viewState.currentDate.getFullYear();
        const currentMonth = viewState.currentDate.getMonth() + 1;
        await fetchSessionsForMonth(currentYear, currentMonth);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }, [deleteLearningSession, deleteCalendarSession, viewState.currentDate, fetchSessionsForMonth]);

  const handleDeleteFromEditModal = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      // Find the session to determine its source
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        console.error('Session not found for deletion:', sessionId);
        return false;
      }

      const sessionSource = session.source ?? 'calendar';

      let success = false;
      if (sessionSource === 'learning') {
        success = await deleteLearningSession(sessionId);
      } else {
        success = await deleteCalendarSession(sessionId);
      }

      if (success) {
        if (sessionSource === 'learning') {
          window.dispatchEvent(new CustomEvent('sessionDeleted', {
            detail: {
              sessionId,
              source: sessionSource,
              timestamp: Date.now(),
            }
          }));
        }

        console.log('Session deleted successfully from edit modal:', sessionId, 'source:', sessionSource);
        // Refresh sessions after deletion
        const currentYear = viewState.currentDate.getFullYear();
        const currentMonth = viewState.currentDate.getMonth() + 1;
        await fetchSessionsForMonth(currentYear, currentMonth);
      }
      return success;
    } catch (error) {
      console.error('Failed to delete session from edit modal:', error);
      return false;
    }
  }, [sessions, deleteLearningSession, deleteCalendarSession, viewState.currentDate, fetchSessionsForMonth]);

  const handleCloseDuplicateModal = useCallback(() => {
    setDuplicateModalState({
      isOpen: false,
      session: null,
    });
  }, []);

  const handleSessionDuplicated = useCallback(async (session: CalendarSession, targetDate: Date, count: number) => {
    try {
      for (let i = 0; i < count; i++) {
        const duplicateDate = new Date(targetDate);
        if (count > 1 && i > 0) {
          duplicateDate.setDate(duplicateDate.getDate() + i);
        }

        // Calculate new start and end times
        const originalStart = new Date(session.startTime);
        const originalEnd = new Date(session.endTime);
        
        const newStartTime = new Date(duplicateDate);
        newStartTime.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
        
        const newEndTime = new Date(duplicateDate);
        newEndTime.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);

        const duplicateData = {
          userId: activeUserId,
          subjectId: session.subjectId,
          title: `${session.title} (Kopie)`,
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
          sessionType: session.type,
          description: session.description || undefined,
          location: session.location || undefined,
        };

        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(duplicateData),
        });

        if (!response.ok) {
          throw new Error('Failed to duplicate session');
        }
      }

      // Refresh sessions after duplication
      const currentYear = viewState.currentDate.getFullYear();
      const currentMonth = viewState.currentDate.getMonth() + 1;
      await fetchSessionsForMonth(currentYear, currentMonth);

      // Emit duplication event
      window.dispatchEvent(new CustomEvent('sessionDuplicated', {
        detail: {
          originalSessionId: session.id,
          targetDate: targetDate,
          count: count,
        }
      }));

    } catch (error) {
      console.error('Failed to duplicate session:', error);
      throw error;
    }
  }, [viewState.currentDate, fetchSessionsForMonth, activeUserId]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setViewState(prev => {
      const newDate = new Date(prev.currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return { ...prev, currentDate: newDate };
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = getBerlinTimestamp();
    setViewState(prev => ({
      ...prev,
      currentDate: today,
      selectedDate: today,
    }));
  }, []);

  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const currentMonth = monthNames[viewState.currentDate.getMonth()];
  const currentYear = viewState.currentDate.getFullYear();

  return (
    <div className="calendar-container space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Month/Year Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              title="Vorheriger Monat"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
              {currentMonth} {currentYear}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              title="Nächster Monat"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Heute
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* Add Session Button */}
          <button
            onClick={() => viewState.selectedDate && handleCreateSession(viewState.selectedDate)}
            disabled={!viewState.selectedDate}
            className={`
              flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${viewState.selectedDate 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
            title={viewState.selectedDate ? 'Session hinzufügen' : 'Wähle ein Datum aus'}
          >
            <FaPlus className="w-3 h-3" />
            <span className="hidden sm:inline">Session</span>
          </button>

          {/* View Toggle */}
          <CalendarViewToggle
            currentView={viewState.currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      {/* Calendar Content */}
      <div className="calendar-content">
        {viewState.currentView === 'month' && (
          <CalendarGrid
            month={viewState.currentDate.getMonth()}
            year={viewState.currentDate.getFullYear()}
            selectedDate={viewState.selectedDate}
            onDateClick={handleDateClick}
            onSessionClick={onSessionClick}
            onSessionToggleComplete={updateSession}
            onSessionEdit={handleEditSession}
            onSessionDuplicate={handleDuplicateSession}
            onSessionDelete={handleDeleteSession}
            getSessionsForDate={getSessionsForDate}
            loading={loading}
            error={error}
          />
        )}
        
        {viewState.currentView === 'week' && (
          <CalendarWeekView
            currentDate={viewState.currentDate}
            selectedDate={viewState.selectedDate}
            onDateClick={handleDateClick}
            onSessionClick={onSessionClick}
            onSessionToggleComplete={updateSession}
            onSessionDelete={handleDeleteSession}
            getSessionsForDate={getSessionsForDate}
            loading={loading}
            error={error}
          />
        )}
        
        {viewState.currentView === 'day' && (
          <CalendarDayView
            currentDate={viewState.currentDate}
            selectedDate={viewState.selectedDate}
            onDateClick={handleDateClick}
            onSessionClick={onSessionClick}
            onSessionToggleComplete={updateSession}
            onSessionDelete={handleDeleteSession}
            getSessionsForDate={getSessionsForDate}
            loading={loading}
            error={error}
          />
        )}
      </div>

      {/* Selected Date Info */}
      {viewState.selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Ausgewähltes Datum:</span>{' '}
            {viewState.selectedDate.toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric', 
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      )}

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={createModalState.isOpen}
        selectedDate={createModalState.selectedDate}
        onClose={handleCloseCreateModal}
        onSessionCreated={handleSessionCreated}
      />

      {/* Edit Session Modal */}
      <CalendarSessionEditModal
        isOpen={editModalState.isOpen}
        session={editModalState.session}
        onClose={handleCloseEditModal}
        onSave={handleSessionEdited}
        onDelete={handleDeleteFromEditModal}
      />

      {/* Duplicate Session Modal */}
      <DuplicateSessionModal
        isOpen={duplicateModalState.isOpen}
        session={duplicateModalState.session}
        onClose={handleCloseDuplicateModal}
        onDuplicate={handleSessionDuplicated}
      />
    </div>
  );
}
