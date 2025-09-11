import React, { useState, useEffect } from 'react';
import { CalendarDay, CalendarSession } from '../../types/calendar';
import { FaCheck, FaClock } from 'react-icons/fa';

interface CalendarGridProps {
  month: number;
  year: number;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onSessionClick: (session: CalendarSession) => void;
  onSessionToggleComplete?: (sessionId: string, updates: Partial<CalendarSession>) => Promise<boolean>;
  getSessionsForDate: (date: Date) => CalendarSession[];
  loading: boolean;
  error: string | null;
}

export default function CalendarGrid({ 
  month, 
  year, 
  selectedDate, 
  onDateClick, 
  onSessionClick,
  onSessionToggleComplete,
  getSessionsForDate,
  loading,
  error
}: CalendarGridProps) {
  
  // Track sessions that have been reverted from completed to incomplete
  const [revertedSessions, setRevertedSessions] = useState<Set<string>>(new Set());
  // Force re-render when sessions are updated via modal
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Listen for session updates from modal to refresh visual state
  useEffect(() => {
    const handleSessionUpdate = (event: any) => {
      console.log('📅 CalendarGrid: Session updated', event.detail);
      // Force re-render to pick up updated session data
      setRefreshKey(prev => prev + 1);
      
      // If session completion status changed, clear reverted state
      if (event.detail?.completionChanged) {
        setRevertedSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.detail.sessionId);
          return newSet;
        });
      }
    };
    
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    
    return () => {
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
    };
  }, []);
  
  // Helper function to determine session status based on date and completion
  const getSessionStatus = (session: CalendarSession) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);
    
    const isFutureSession = sessionDate > today;
    
    if (isFutureSession) {
      return 'ausstehend'; // Future sessions are always pending
    }
    
    // Check if session was reverted from completed to incomplete
    if (!session.completed && revertedSessions.has(session.id)) {
      return 'reverted'; // Red color for reverted sessions
    }
    
    return session.completed ? 'abgeschlossen' : 'ausstehend';
  };
  
  const handleSessionToggleComplete = async (session: CalendarSession, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onSessionToggleComplete) return;
    
    // Check if session is in the future - future sessions cannot be completed
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);
    
    const isFutureSession = sessionDate > today;
    
    if (isFutureSession) {
      // Future sessions are always "ausstehend" and cannot be toggled
      console.log('Cannot mark future sessions as completed - they remain "ausstehend"');
      return;
    }
    
    const newCompletedStatus = !session.completed;
    
    // Track when a session is reverted from completed to incomplete
    if (session.completed && !newCompletedStatus) {
      // Session is being reverted from completed to incomplete - mark as reverted
      setRevertedSessions(prev => new Set(prev).add(session.id));
    } else if (!session.completed && newCompletedStatus) {
      // Session is being marked as completed - remove from reverted list if present
      setRevertedSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(session.id);
        return newSet;
      });
    }
    
    await onSessionToggleComplete(session.id, { 
      completed: newCompletedStatus,
      duration: session.duration // Needed for XP calculation 
    });
  };
  
  const getDaysInMonth = (month: number, year: number): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Start from the beginning of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at the end of the week containing the last day
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    
    while (currentDate <= endDate) {
      const sessions = getSessionsForDate(currentDate);
      
      days.push({
        date: new Date(currentDate),
        sessions,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === today.toDateString(),
        isSelected: selectedDate ? currentDate.toDateString() === selectedDate.toDateString() : false
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const days = getDaysInMonth(month, year);
  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  // Show error state
  if (error) {
    return (
      <div className="calendar-grid bg-white rounded-xl border border-red-200 p-8 text-center">
        <p className="text-red-600">Fehler beim Laden der Kalenderdaten: {error}</p>
      </div>
    );
  }

  return (
    <div className="calendar-grid bg-white rounded-xl border border-gray-200 overflow-hidden relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Lade Kalenderdaten...</span>
          </div>
        </div>
      )}
      {/* Header with weekdays */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-100 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              relative min-h-[120px] p-2 border-r border-b border-gray-100 last-in-row:border-r-0 cursor-pointer
              hover:bg-gray-50 transition-colors
              ${!day.isCurrentMonth ? 'bg-gray-25 text-gray-400' : ''}
              ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}
              ${day.isSelected ? 'bg-blue-100 border-blue-300' : ''}
            `}
            onClick={() => onDateClick(day.date)}
          >
            {/* Date number */}
            <div className={`
              text-sm font-medium mb-1
              ${day.isToday ? 'text-blue-600 font-bold' : ''}
              ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
            `}>
              {day.date.getDate()}
            </div>

            {/* Sessions */}
            <div className="space-y-1">
              {day.sessions.slice(0, 3).map((session) => {
                const sessionStatus = getSessionStatus(session);
                const isCompleted = sessionStatus === 'abgeschlossen';
                const isReverted = sessionStatus === 'reverted';
                
                return (
                <div
                  key={session.id}
                  className={`
                    text-xs px-2 py-1 rounded cursor-pointer truncate relative
                    hover:shadow-md transition-all duration-200
                    border-l-4
                  `}
                  style={{
                    backgroundColor: isCompleted 
                      ? '#f0fdf4'  // Light green for completed
                      : isReverted
                      ? '#fef2f2'  // Light red for reverted sessions
                      : `${session.subjectColor}20`, // Subject color with transparency for default pending
                    borderLeftColor: isCompleted 
                      ? '#22c55e'  // Green border for completed
                      : isReverted
                      ? '#ef4444'  // Red border for reverted sessions
                      : session.subjectColor, // Subject color border for default pending
                    color: isCompleted 
                      ? '#15803d'  // Dark green text for completed
                      : isReverted
                      ? '#dc2626'  // Red text for reverted sessions
                      : session.subjectColor // Subject color text for default pending
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionClick(session);
                  }}
                  title={`${session.title} - ${session.startTime.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - ${sessionStatus === 'abgeschlossen' ? 'Abgeschlossen' : sessionStatus === 'reverted' ? 'Ausstehend (Rückgängig)' : 'Ausstehend'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{session.title}</span>
                    <div className="flex items-center space-x-1">
                      {/* Clickable completion toggle */}
                      <button
                        onClick={(e) => handleSessionToggleComplete(session, e)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted 
                            ? 'bg-green-100 hover:bg-green-200' 
                            : isReverted
                            ? 'bg-red-100 hover:bg-red-200'
                            : sessionStatus === 'ausstehend' && new Date(session.startTime).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)
                            ? 'bg-orange-100 hover:bg-orange-200'
                            : 'bg-gray-100 cursor-not-allowed'
                        }`}
                        title={
                          new Date(session.startTime).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)
                            ? 'Zukünftige Sessions sind immer ausstehend'
                            : isCompleted 
                            ? 'Als ausstehend markieren' 
                            : isReverted
                            ? 'Als abgeschlossen markieren (war rückgängig)'
                            : 'Als abgeschlossen markieren'
                        }
                      >
                        {isCompleted ? (
                          <FaCheck className="w-2 h-2 text-green-600" />
                        ) : (
                          <FaClock className={`w-2 h-2 ${
                            new Date(session.startTime).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)
                              ? 'text-gray-400'  // Gray for future sessions
                              : isReverted
                              ? 'text-red-600'   // Red for reverted sessions
                              : 'text-orange-500' // Orange for default pending sessions
                          }`} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
              
              {/* Show "+N more" if there are more sessions */}
              {day.sessions.length > 3 && (
                <div className="text-xs text-gray-500 px-2">
                  +{day.sessions.length - 3} mehr
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}