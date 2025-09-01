import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Award, Trash2, Filter, Search } from 'lucide-react';
import { useLearningSessions, LearningSession } from '../hooks/useLearningSessions';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface SessionHistoryProps {
  subjectId?: string;
  showSubjectFilter?: boolean;
  className?: string;
}

export default function SessionHistory({ 
  subjectId, 
  showSubjectFilter = true, 
  className = '' 
}: SessionHistoryProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { 
    sessions, 
    loading, 
    error, 
    deleteSession, 
    loadMore, 
    pagination 
  } = useLearningSessions({ 
    subjectId: selectedSubjectId || undefined,
    limit: 20 
  });

  // Filter sessions based on search and date filters
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.subject?.name.toLowerCase().includes(query) ||
        session.notes?.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(session => {
        const sessionDate = parseISO(session.date);
        
        switch (dateFilter) {
          case 'today':
            return sessionDate >= today;
          case 'week':
            return isWithinInterval(sessionDate, {
              start: startOfWeek(now, { weekStartsOn: 1 }),
              end: endOfWeek(now, { weekStartsOn: 1 })
            });
          case 'month':
            return sessionDate.getMonth() === now.getMonth() && 
                   sessionDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [sessions, searchQuery, dateFilter]);

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const groups: { [key: string]: LearningSession[] } = {};
    
    filteredSessions.forEach(session => {
      const dateKey = session.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredSessions]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleDeleteSession = async (sessionId: string) => {
    const success = await deleteSession(sessionId);
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  const totalStats = useMemo(() => {
    const completed = filteredSessions.filter(s => s.completed);
    const totalDuration = completed.reduce((sum, s) => sum + s.duration, 0);
    const totalXP = completed.reduce((sum, s) => sum + s.points, 0);
    
    return {
      totalSessions: completed.length,
      totalDuration,
      totalXP,
      averageDuration: completed.length > 0 ? Math.round(totalDuration / completed.length) : 0
    };
  }, [filteredSessions]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading sessions: {error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Learning Sessions</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>{totalStats.totalSessions} completed sessions</span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Time</div>
            <div className="text-lg font-bold text-blue-900">
              {formatDuration(totalStats.totalDuration)}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total XP</div>
            <div className="text-lg font-bold text-green-900">
              {totalStats.totalXP}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Sessions</div>
            <div className="text-lg font-bold text-purple-900">
              {totalStats.totalSessions}
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Average</div>
            <div className="text-lg font-bold text-orange-900">
              {formatDuration(totalStats.averageDuration)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Session List */}
        {loading && sessions.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sessionsByDate.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {sessions.length === 0 ? 'No learning sessions yet.' : 'No sessions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sessionsByDate.map(([date, dateSessions]) => (
              <div key={date}>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </h3>
                <div className="space-y-3">
                  {dateSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: session.subject?.color || '#6B7280' }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {session.subject?.name || 'Unknown Subject'}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(session.duration)}</span>
                            </div>
                            {session.completed && (
                              <div className="flex items-center space-x-1">
                                <Award className="w-4 h-4" />
                                <span>{session.points} XP</span>
                              </div>
                            )}
                          </div>
                          {session.notes && (
                            <div className="text-sm text-gray-600 mt-1">
                              {session.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!session.completed && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Incomplete
                          </span>
                        )}
                        <button
                          onClick={() => setShowDeleteConfirm(session.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Learning Session
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this learning session? This action cannot be undone and will affect your progress statistics.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSession(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}