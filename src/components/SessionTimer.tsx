import React, { useState } from 'react';
import { Play, Pause, Square, Clock, Target, Zap, Edit } from 'lucide-react';
import { useActiveSession, SessionState } from '../hooks/useActiveSession';
import QuickProgressStats from './QuickProgressStats';
import SessionExtensionModal from './SessionExtensionModal';

interface SessionTimerProps {
  className?: string;
  onStartSession?: () => void;
}

export default function SessionTimer({ className = '', onStartSession }: SessionTimerProps) {
  const [showTimeAdjustment, setShowTimeAdjustment] = useState(false);
  const [adjustmentMinutes, setAdjustmentMinutes] = useState<number>(0);

  const {
    sessionState,
    sessionData,
    progress,
    error,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    extendSession,
    adjustSessionTime,
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
      case 'extension_needed':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleExtensionComplete = () => {
    completeSession(sessionData?.notes);
  };

  const handleExtensionCancel = () => {
    cancelSession();
  };

  const handleTimeAdjustment = () => {
    if (adjustmentMinutes > 0) {
      adjustSessionTime(adjustmentMinutes, 'Manual adjustment during session');
      setShowTimeAdjustment(false);
      setAdjustmentMinutes(0);
    }
  };

  const currentElapsedMinutes = Math.floor(progress.elapsedSeconds / 60);

  // Always visible - show "Ready to Learn" state when idle
  const isActiveSession = sessionState !== 'idle' && sessionData;
  
  // Ready to Learn state when no active session
  if (!isActiveSession) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg border-2 border-blue-200 ${className}`}>
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lerntracker-Zentrale</h2>
            <p className="text-gray-600">Ready to start your learning journey</p>
          </div>

          {/* Real-time Stats */}
          <QuickProgressStats className="mb-8" />

          {/* Start Session CTA */}
          <div className="text-center">
            <button
              onClick={onStartSession}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Play className="w-6 h-6" />
              <span>Start Learning Session</span>
              <Zap className="w-6 h-6" />
            </button>
            <p className="text-sm text-gray-500 mt-3">Choose a subject and begin your focused learning</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced active session display
  return (
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border-2 ${getStateColor(sessionState)} ${className}`}>
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

        {/* Enhanced Progress Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              {/* Progress circle with gradient */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress.progress / 100)}`}
                className="transition-all duration-500"
                strokeLinecap="round"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 mb-1">
                {formatTime(progress.elapsedSeconds)}
              </span>
              <span className="text-lg font-semibold text-blue-600">
                {Math.round(progress.progress)}%
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {sessionState === 'active' ? 'LEARNING' : sessionState.toUpperCase()}
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
        <div className="flex justify-center space-x-3 mb-4">
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

        {/* Manual Time Adjustment */}
        {(sessionState === 'active' || sessionState === 'paused') && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowTimeAdjustment(!showTimeAdjustment)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
            >
              <Edit size={14} />
              <span>Adjust Time</span>
            </button>
          </div>
        )}

        {/* Time Adjustment Input */}
        {showTimeAdjustment && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Total Session Duration (minutes)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="1"
                max="480"
                value={adjustmentMinutes || currentElapsedMinutes}
                onChange={(e) => setAdjustmentMinutes(parseInt(e.target.value) || currentElapsedMinutes)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={currentElapsedMinutes.toString()}
              />
              <button
                onClick={handleTimeAdjustment}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => setShowTimeAdjustment(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current elapsed time: {currentElapsedMinutes} minutes
            </p>
          </div>
        )}

        {/* Session Notes */}
        {sessionData.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Notes:</strong> {sessionData.notes}
            </p>
          </div>
        )}
      </div>

      {/* Session Extension Modal */}
      <SessionExtensionModal
        isOpen={sessionState === 'extension_needed'}
        onContinue={extendSession}
        onComplete={handleExtensionComplete}
        onCancel={handleExtensionCancel}
        subjectName={sessionData.subjectName}
        subjectColor={sessionData.subjectColor}
        elapsedTime={formatTime(progress.elapsedSeconds)}
        targetDuration={sessionData.originalTargetDuration}
      />
    </div>
  );
}