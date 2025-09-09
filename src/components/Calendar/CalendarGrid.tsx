import React from 'react';
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
  
  const handleSessionToggleComplete = async (session: CalendarSession, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onSessionToggleComplete) return;
    
    const newCompletedStatus = !session.completed;
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
              {day.sessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className={`
                    text-xs px-2 py-1 rounded cursor-pointer truncate relative
                    hover:shadow-md transition-all duration-200
                    ${session.completed 
                      ? 'bg-green-50 border-l-4 border-green-500 text-green-700' 
                      : 'border-l-4'
                    }
                  `}
                  style={{
                    backgroundColor: session.completed 
                      ? '#f0fdf4' 
                      : `${session.subjectColor}20`,
                    borderLeftColor: session.completed 
                      ? '#22c55e' 
                      : session.subjectColor,
                    color: session.completed 
                      ? '#15803d' 
                      : session.subjectColor
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionClick(session);
                  }}
                  title={`${session.title} - ${session.startTime.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - ${session.completed ? 'Abgeschlossen' : 'Ausstehend'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1">{session.title}</span>
                    <div className="flex items-center space-x-1">
                      {/* Clickable completion toggle */}
                      <button
                        onClick={(e) => handleSessionToggleComplete(session, e)}
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          session.completed 
                            ? 'bg-green-100 hover:bg-green-200' 
                            : 'bg-orange-100 hover:bg-orange-200'
                        }`}
                        title={session.completed ? 'Als ausstehend markieren' : 'Als abgeschlossen markieren'}
                      >
                        {session.completed ? (
                          <FaCheck className="w-2 h-2 text-green-600" />
                        ) : (
                          <FaClock className="w-2 h-2 text-orange-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
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