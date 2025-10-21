import React, { useState, useEffect } from 'react';
import { CalendarSession } from '../../types/calendar';
import { FaCheck, FaClock } from 'react-icons/fa';
import { format, startOfWeek, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarWeekViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onSessionClick: (session: CalendarSession) => void;
  onSessionToggleComplete?: (sessionId: string, updates: Partial<CalendarSession>) => Promise<boolean>;
  onSessionDelete?: (session: CalendarSession) => void;
  getSessionsForDate: (date: Date) => CalendarSession[];
  loading: boolean;
  error: string | null;
}

export default function CalendarWeekView({
  currentDate,
  selectedDate,
  onDateClick,
  onSessionClick,
  onSessionToggleComplete,
  onSessionDelete,
  getSessionsForDate,
  loading,
  error
}: CalendarWeekViewProps) {
  
  // Track sessions that have been reverted from completed to incomplete
  const [revertedSessions, setRevertedSessions] = useState<Set<string>>(new Set());
  // Force re-render when sessions are updated via modal
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Listen for session updates from modal to refresh visual state
  useEffect(() => {
    const handleSessionUpdate = (event: any) => {
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
    // Fixed/all-day/admin entries are informational; treat as ausstehend
    if ((session as any).isFixed || session.isAllDay || session.subjectName === 'Termine & Fristen') {
      return 'ausstehend';
    }
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
  
  // Handle session toggle with reversion tracking
  const handleSessionToggleComplete = async (session: CalendarSession, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onSessionToggleComplete) return;

    // Do not allow toggling for fixed, all-day, or administrative subject sessions
    if ((session as any).isFixed || session.isAllDay || session.subjectName === 'Termine & Fristen') {
      return;
    }
    
    // Check if session is in the future - future sessions cannot be completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);
    
    const isFutureSession = sessionDate > today;

    if (isFutureSession) {
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
      duration: session.duration
    });
  };
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <p className="text-red-600">Fehler beim Laden der Kalenderdaten: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Lade Kalenderdaten...</span>
          </div>
        </div>
      )}

      {/* Week header with days */}
      <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
        <div className="p-4 text-sm font-medium text-gray-600 border-r border-gray-200">
          Zeit
        </div>
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = selectedDate ? day.toDateString() === selectedDate.toDateString() : false;
          const sessions = getSessionsForDate(day);
          // Only count sessions that are truly completed (not future sessions)
          const completedSessions = sessions.filter(s => getSessionStatus(s) === 'abgeschlossen').length;
          const pendingSessions = sessions.filter(s => getSessionStatus(s) === 'ausstehend').length;
          
          return (
            <div 
              key={index}
              className={`
                p-4 text-center border-r border-gray-200 last:border-r-0 cursor-pointer
                hover:bg-gray-100 transition-colors
                ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
              `}
              onClick={() => onDateClick(day)}
            >
              <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'EEE', { locale: de })}
              </div>
              <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
              {(completedSessions + pendingSessions) > 0 && (
                <div className="flex items-center justify-center space-x-1 mt-1">
                  <div className="flex items-center space-x-1 text-xs">
                    <FaCheck className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">{completedSessions}</span>
                  </div>
                  <div className="text-gray-400 text-xs">/</div>
                  <div className="flex items-center space-x-1 text-xs">
                    <FaClock className="w-3 h-3 text-orange-500" />
                    <span className="text-gray-600">{pendingSessions}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week grid with time slots */}
      <div className="max-h-96 overflow-y-auto">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
            <div className="p-3 text-xs text-gray-500 border-r border-gray-200 bg-gray-25">
              {timeSlot}
            </div>
            {weekDays.map((day, dayIndex) => {
              const sessionsInSlot = getSessionsForDate(day).filter(session => {
                const sessionHour = session.startTime.getHours();
                const slotHour = parseInt(timeSlot.split(':')[0]);
                return sessionHour === slotHour;
              });

              return (
                <div 
                  key={`${timeSlot}-${dayIndex}`}
                  className="p-1 border-r border-gray-100 last:border-r-0 min-h-[60px] relative"
                >
                  {sessionsInSlot.map((session) => {
                    const sessionStatus = getSessionStatus(session);
                    const isCompleted = sessionStatus === 'abgeschlossen';
                    const isReverted = sessionStatus === 'reverted';
                    const autoGenerated = session.isAutoGenerated || session.origin === 'auto';
                    
                    return (
                    <div
                      key={session.id}
                      className={`
                        text-xs p-2 mb-1 rounded cursor-pointer border
                        hover:shadow-md transition-all duration-200
                      `}
                      style={{
                        backgroundColor: isCompleted 
                          ? '#f0fdf4'  // Light green for completed
                          : isReverted
                          ? '#fef2f2'  // Light red for reverted sessions
                          : `${session.subjectColor}20`, // Subject color with transparency for default pending
                        borderColor: isCompleted 
                          ? '#22c55e'  // Green border for completed
                          : isReverted
                          ? '#ef4444'  // Red border for reverted sessions
                          : session.subjectColor, // Subject color border for default pending
                        color: isCompleted 
                          ? '#15803d'  // Dark green text for completed
                          : isReverted
                          ? '#dc2626'  // Red text for reverted sessions
                          : session.subjectColor, // Subject color text for default pending
                        borderStyle: autoGenerated ? 'dashed' : 'solid',
                        boxShadow: autoGenerated ? 'inset 0 0 0 1px rgba(37,99,235,0.15)' : undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSessionToggleComplete(session, e);
                      }}
                      title={`${session.title} - ${session.startTime.toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - ${sessionStatus === 'abgeschlossen' ? 'Abgeschlossen' : sessionStatus === 'reverted' ? 'Ausstehend (Rückgängig)' : 'Ausstehend'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1 font-medium flex items-center space-x-1">
                          <span>{session.title}</span>
                          {autoGenerated && (
                            <span className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">auto</span>
                          )}
                        </span>
                        <div className="flex-shrink-0 ml-1">
                          {isCompleted ? (
                            <FaCheck className="w-3 h-3 text-green-600" />
                          ) : (
                            <FaClock className={`w-3 h-3 ${
                              new Date(session.startTime).setHours(0,0,0,0) > new Date().setHours(0,0,0,0)
                                ? 'text-gray-400'   // Gray for future sessions
                                : isReverted
                                ? 'text-red-600'    // Red for reverted sessions
                                : 'text-orange-500' // Orange for default pending sessions
                            }`} />
                          )}
                        </div>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {session.startTime.toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {session.endTime.toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
