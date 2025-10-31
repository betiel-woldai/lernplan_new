import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, Calendar, BarChart3, X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/router';

interface SessionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  session?: {
    id: string;
    duration: number; // minutes
    subjectName: string;
    subjectColor: string;
    points: number;
    completedAt: Date;
  };
}

export default function SessionSummary({ isOpen, onClose, session }: SessionSummaryProps) {
  const router = useRouter();
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<'syncing' | 'success' | 'error'>('syncing');

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Simulate calendar sync process
  useEffect(() => {
    if (isOpen && session) {
      setCalendarSyncStatus('syncing');
      
      // Simulate calendar sync API call
      const syncTimer = setTimeout(() => {
        setCalendarSyncStatus('success'); // Could be 'error' in case of failure
      }, Math.random() * 2000 + 1000); // 1-3 seconds

      return () => clearTimeout(syncTimer);
    }
  }, [isOpen, session]);

  const handleViewDashboard = () => {
    onClose();
    router.push('/analytics');
  };

  const handleViewCalendar = () => {
    onClose();
    router.push('/?view=calendar');
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Session Complete!</h2>
              <p className="text-sm text-gray-600">Great work on your learning session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Session Details */}
        <div className="p-6 space-y-4">
          {/* Subject and Duration */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: session.subjectColor }}
              />
              <div>
                <div className="font-medium text-gray-900">{session.subjectName}</div>
                <div className="text-sm text-gray-600">Learning Session</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatDuration(session.duration)}
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{session.points}</div>
              <div className="text-sm text-purple-700">XP Earned</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {new Date(session.completedAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-blue-700">Completed</div>
            </div>
          </div>

          {/* Calendar Sync Status */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">Calendar Sync</div>
                  <div className="text-sm text-gray-600">
                    {calendarSyncStatus === 'syncing' && 'Syncing to calendar...'}
                    {calendarSyncStatus === 'success' && 'Successfully synced to calendar'}
                    {calendarSyncStatus === 'error' && 'Sync failed - will retry automatically'}
                  </div>
                </div>
              </div>
              <div>
                {calendarSyncStatus === 'syncing' && (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                {calendarSyncStatus === 'success' && (
                  <CheckCircle size={20} className="text-green-500" />
                )}
                {calendarSyncStatus === 'error' && (
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Close
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleViewCalendar}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Calendar size={16} />
              <span>View Calendar</span>
            </button>
            <button
              onClick={handleViewDashboard}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              <BarChart3 size={16} />
              <span>Statistics</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}