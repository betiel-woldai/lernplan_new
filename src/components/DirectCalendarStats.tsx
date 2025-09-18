import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaFire } from 'react-icons/fa';
import { getBerlinDateString, toBerlinDateString } from '@/utils/timezone';
import { getActiveUserId } from '@/utils/user';

interface DirectCalendarStatsProps {
  selectedDate?: Date;
}

interface CalendarStatsData {
  completedSessions: number;
  formattedDuration: string;
  streakDays: number;
  isToday: boolean;
}

export default function DirectCalendarStats({ selectedDate = new Date() }: DirectCalendarStatsProps) {
  const [stats, setStats] = useState<CalendarStatsData>({
    completedSessions: 0,
    formattedDuration: '0h 0m',
    streakDays: 0,
    isToday: true
  });
  const [loading, setLoading] = useState(true);

  const fetchCalendarStats = async (date: Date) => {
    console.log('🔍 DirectCalendarStats: Fetching for date:', date.toISOString().split('T')[0]);
    setLoading(true);

    try {
      const userId = getActiveUserId();
      // Fetch calendar sessions directly
      const calendarResponse = await fetch(`/api/calendar?userId=${userId}`);
      const sessions = await calendarResponse.json();

      console.log('📅 DirectCalendarStats: Found', sessions.length, 'total sessions');

      // Filter for selected date
      const dateStr = toBerlinDateString(date);
      const todaySessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime).toLocaleDateString('en-CA', {
          timeZone: 'Europe/Berlin',
        });
        return sessionDate === dateStr;
      });

      console.log('📅 DirectCalendarStats: Found', todaySessions.length, 'sessions for', dateStr);

      // Calculate completed sessions and duration
      const completedSessions = todaySessions.filter(s => s.completed).length;
      const totalMinutes = todaySessions
        .filter(s => s.completed)
        .reduce((total, session) => total + (session.duration || 0), 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const formattedDuration = `${hours}h ${minutes}m`;

      // Calculate streak (simplified - just check if today has completed sessions)
      const streakDays = completedSessions > 0 ? 1 : 0;

      const isToday = dateStr === getBerlinDateString();

      const newStats = {
        completedSessions,
        formattedDuration,
        streakDays,
        isToday
      };

      console.log('✅ DirectCalendarStats: Calculated stats:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('❌ DirectCalendarStats: Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and date change
  useEffect(() => {
    fetchCalendarStats(selectedDate);
  }, [selectedDate]);

  // Listen for calendar session updates
  useEffect(() => {
    const handleSessionUpdate = () => {
      console.log('🔄 DirectCalendarStats: Session updated, refreshing stats');
      fetchCalendarStats(selectedDate);
    };

    // Listen to all session events
    window.addEventListener('sessionCompleted', handleSessionUpdate);
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    window.addEventListener('sessionIncomplete', handleSessionUpdate);
    window.addEventListener('sessionDeleted', handleSessionUpdate);
    window.addEventListener('sessionCreated', handleSessionUpdate);

    return () => {
      window.removeEventListener('sessionCompleted', handleSessionUpdate);
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
      window.removeEventListener('sessionIncomplete', handleSessionUpdate);
      window.removeEventListener('sessionDeleted', handleSessionUpdate);
      window.removeEventListener('sessionCreated', handleSessionUpdate);
    };
  }, [selectedDate]);

  const dateLabel = stats.isToday
    ? 'Heute'
    : selectedDate.toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short',
        timeZone: 'Europe/Berlin',
      });


  return (
    <div className="space-y-3">
      {/* Time Duration Compact */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <FaClock className="text-blue-500 text-sm" />
            <span className="text-xs font-medium text-blue-900">{dateLabel}</span>
          </div>
          <span className="text-sm font-bold text-blue-900">
            {loading ? 'Laden...' : stats.formattedDuration}
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-1">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all duration-500"
            style={{ width: loading ? '0%' : `${Math.min(100, (parseInt(stats.formattedDuration) / 2) * 100)}%` }}
          />
        </div>
        <div className="text-xs text-blue-700 mt-1">von 2h Ziel</div>
      </div>

      {/* Completed Sessions Compact */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <FaCheckCircle className="text-green-500 text-sm" />
            <span className="text-xs font-medium text-green-900">Sessions</span>
          </div>
          <span className="text-sm font-bold text-green-900">
            {loading ? '...' : stats.completedSessions}
          </span>
        </div>
        <div className="text-xs text-green-700">
          {stats.isToday ? 'heute abgeschlossen' :
            selectedDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ' abgeschlossen'
          }
        </div>
      </div>

      {/* Learning Streak Compact */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <FaFire className="text-orange-500 text-sm" />
            <span className="text-xs font-medium text-orange-900">Streak</span>
          </div>
          <span className="text-sm font-bold text-orange-900">
            {loading ? '...' : stats.streakDays}
          </span>
        </div>
        <div className="text-xs text-orange-700">
          {stats.isToday ? 'Tage in Folge bis heute' : 'Tage in Folge bis ' + selectedDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
        </div>
      </div>
    </div>
  );
}
