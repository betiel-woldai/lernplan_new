import React, { useState, useCallback, useEffect } from 'react';
import { CalendarView, CalendarSession, CalendarViewState } from '../../types/calendar';
import CalendarGrid from './CalendarGrid';
import CalendarWeekView from './CalendarWeekView';
import CalendarDayView from './CalendarDayView';
import CalendarViewToggle from './CalendarViewToggle';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import useCalendarSessions from '../../hooks/useCalendarSessions';

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
  
  const [viewState, setViewState] = useState<CalendarViewState>({
    currentView: 'month',
    currentDate: new Date(),
    selectedDate: null
  });

  const { 
    sessions, 
    loading, 
    error, 
    fetchSessionsForMonth, 
    getSessionsForDate,
    updateSession,
    syncFromSubjects
  } = useCalendarSessions();

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

    // Listen to custom events from subject hooks
    window.addEventListener('subjectCreated', handleSubjectChange);
    window.addEventListener('subjectUpdated', handleSubjectChange);  
    window.addEventListener('subjectDeleted', handleSubjectChange);

    return () => {
      window.removeEventListener('subjectCreated', handleSubjectChange);
      window.removeEventListener('subjectUpdated', handleSubjectChange);
      window.removeEventListener('subjectDeleted', handleSubjectChange);
    };
  }, [syncFromSubjects]);

  const handleViewChange = useCallback((view: CalendarView) => {
    setViewState(prev => ({ ...prev, currentView: view }));
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setViewState(prev => ({ ...prev, selectedDate: date }));
    onDateClick(date);
  }, [onDateClick]);

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
    const today = new Date();
    setViewState(prev => ({ 
      ...prev, 
      currentDate: today,
      selectedDate: today
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
            onClick={() => viewState.selectedDate && onCreateSession(viewState.selectedDate)}
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
    </div>
  );
}