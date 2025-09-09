import React from 'react';
import { CalendarSession } from '../../types/calendar';
import { FaCheck, FaClock, FaMapMarkerAlt, FaBookOpen } from 'react-icons/fa';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarDayViewProps {
  currentDate: Date;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onSessionClick: (session: CalendarSession) => void;
  getSessionsForDate: (date: Date) => CalendarSession[];
  loading: boolean;
  error: string | null;
}

export default function CalendarDayView({
  currentDate,
  selectedDate,
  onDateClick,
  onSessionClick,
  getSessionsForDate,
  loading,
  error
}: CalendarDayViewProps) {
  
  const viewDate = selectedDate || currentDate;
  const sessions = getSessionsForDate(viewDate);
  const today = new Date();
  const isToday = viewDate.toDateString() === today.toDateString();
  
  // Generate time slots from 6 AM to 11 PM
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour: hour
    };
  });

  // Group sessions by hour
  const sessionsByHour = sessions.reduce((acc, session) => {
    const hour = session.startTime.getHours();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(session);
    return acc;
  }, {} as Record<number, CalendarSession[]>);

  const completedSessions = sessions.filter(s => s.completed).length;
  const totalSessions = sessions.length;

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

      {/* Day header */}
      <div className={`
        p-6 border-b border-gray-200 
        ${isToday ? 'bg-blue-50' : 'bg-gray-50'}
      `}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
              {format(viewDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </h2>
            {isToday && (
              <p className="text-blue-600 text-sm font-medium mt-1">Heute</p>
            )}
          </div>
          
          {totalSessions > 0 && (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-lg">
                <FaCheck className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">
                  {completedSessions} abgeschlossen
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-100 px-3 py-2 rounded-lg">
                <FaClock className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700 font-medium">
                  {totalSessions - completedSessions} ausstehend
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day schedule */}
      <div className="max-h-96 overflow-y-auto">
        {totalSessions === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaBookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Keine Lernsessions für diesen Tag geplant.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sessions
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
              .map((session) => (
                <div
                  key={session.id}
                  className={`
                    p-4 rounded-lg border-l-4 cursor-pointer
                    hover:shadow-md transition-all duration-200
                    ${session.completed 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-gray-50'
                    }
                  `}
                  style={{
                    backgroundColor: session.completed 
                      ? '#f0fdf4' 
                      : `${session.subjectColor}10`,
                    borderLeftColor: session.completed 
                      ? '#22c55e' 
                      : session.subjectColor
                  }}
                  onClick={() => onSessionClick(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`font-semibold text-lg ${
                          session.completed ? 'text-green-800' : 'text-gray-900'
                        }`}>
                          {session.title}
                        </h3>
                        <div className="flex-shrink-0">
                          {session.completed ? (
                            <div className="flex items-center space-x-1 bg-green-200 px-2 py-1 rounded-full">
                              <FaCheck className="w-3 h-3 text-green-700" />
                              <span className="text-xs text-green-700 font-medium">Abgeschlossen</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 bg-orange-200 px-2 py-1 rounded-full">
                              <FaClock className="w-3 h-3 text-orange-700" />
                              <span className="text-xs text-orange-700 font-medium">Ausstehend</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <FaClock className="w-4 h-4" />
                          <span>
                            {session.startTime.toLocaleTimeString('de-DE', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {session.endTime.toLocaleTimeString('de-DE', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{session.duration} Min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: session.subjectColor }}
                          />
                          <span>{session.subjectName}</span>
                        </div>
                      </div>

                      {session.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                          <FaMapMarkerAlt className="w-4 h-4" />
                          <span>{session.location}</span>
                        </div>
                      )}

                      {session.description && (
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                          {session.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}