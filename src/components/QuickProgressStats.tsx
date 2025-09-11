import React, { useEffect, useState } from 'react';
import { Clock, Target, Zap } from 'lucide-react';

interface QuickProgressStatsProps {
  className?: string;
}

interface DailyStats {
  todayHours: number;
  todaySessions: number;
  todayXP: number;
  weeklyHours: number;
  completedToday: number;
  totalToday: number;
}

export default function QuickProgressStats({ className = '' }: QuickProgressStatsProps) {
  const [stats, setStats] = useState<DailyStats>({
    todayHours: 0,
    todaySessions: 0,
    todayXP: 0,
    weeklyHours: 0,
    completedToday: 0,
    totalToday: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/learning-sessions/stats/today');
      if (response.ok) {
        const data = await response.json();
        setStats({
          todayHours: Math.round((data.todayMinutes || 0) / 60 * 10) / 10,
          todaySessions: data.completedSessions || 0,
          todayXP: data.totalXP || 0,
          weeklyHours: Math.round((data.weeklyMinutes || 0) / 60 * 10) / 10,
          completedToday: data.completedToday || 0,
          totalToday: data.totalToday || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Listen for session events to update stats in real-time
    const handleSessionUpdate = () => {
      fetchStats();
    };

    window.addEventListener('sessionCompleted', handleSessionUpdate);
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    
    return () => {
      window.removeEventListener('sessionCompleted', handleSessionUpdate);
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
    };
  }, []);

  const formatHours = (hours: number): string => {
    if (hours === 0) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours % 1 === 0) return `${hours}h`;
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  const getProgressColor = (completed: number, total: number): string => {
    if (total === 0) return 'text-gray-500';
    const percentage = completed / total;
    if (percentage >= 0.8) return 'text-green-600';
    if (percentage >= 0.5) return 'text-yellow-600';
    return 'text-blue-600';
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center p-4 bg-white rounded-lg shadow-sm animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="w-12 h-6 bg-gray-300 rounded mx-auto mb-1"></div>
            <div className="w-16 h-4 bg-gray-300 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {/* Today's Hours */}
      <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-center mb-2">
          <Clock className="w-6 h-6 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {formatHours(stats.todayHours)}
        </div>
        <div className="text-sm text-gray-600">Today</div>
        {stats.weeklyHours > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {formatHours(stats.weeklyHours)} this week
          </div>
        )}
      </div>

      {/* Today's Sessions */}
      <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-center mb-2">
          <Target className="w-6 h-6 text-green-500" />
        </div>
        <div className={`text-2xl font-bold mb-1 ${getProgressColor(stats.completedToday, stats.totalToday)}`}>
          {stats.todaySessions}
        </div>
        <div className="text-sm text-gray-600">Sessions</div>
        {stats.totalToday > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {stats.completedToday}/{stats.totalToday} planned
          </div>
        )}
      </div>

      {/* Today's XP */}
      <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-center mb-2">
          <Zap className="w-6 h-6 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-purple-600 mb-1">
          {stats.todayXP.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">XP</div>
        {stats.todayXP > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            +{Math.round(stats.todayXP / Math.max(1, stats.todaySessions))} avg/session
          </div>
        )}
      </div>
    </div>
  );
}