import React from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useActiveSession, SessionState } from '../hooks/useActiveSession';

interface SessionTimerProps {
  className?: string;
}

export default function SessionTimer({ className = '' }: SessionTimerProps) {
  const {
    sessionState,
    sessionData,
    progress,
    error,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    clearError
  } = useActiveSession();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStateColor = (state: SessionState): string => {
    switch (state) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (sessionState === 'idle' || !sessionData) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${getStateColor(sessionState)} ${className}`}>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Session Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: sessionData.subjectColor }}
            ></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {sessionData.subjectName}
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>Target: {formatDuration(sessionData.targetDuration)}</span>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress.progress / 100)}`}
                className="text-blue-500 transition-all duration-300"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {formatTime(progress.elapsedSeconds)}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progress.progress)}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {progress.remainingSeconds > 0 ? (
                <>Remaining: {formatTime(progress.remainingSeconds)}</>
              ) : (
                'Target time reached!'
              )}
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          {sessionState === 'active' && (
            <button
              onClick={pauseSession}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
            >
              <Pause size={18} />
              <span>Pause</span>
            </button>
          )}

          {sessionState === 'paused' && (
            <button
              onClick={resumeSession}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Play size={18} />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={() => completeSession(sessionData.notes)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Square size={18} />
            <span>Complete</span>
          </button>

          <button
            onClick={cancelSession}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <span>Cancel</span>
          </button>
        </div>

        {/* Session Notes */}
        {sessionData.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Notes:</strong> {sessionData.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}