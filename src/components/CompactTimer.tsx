import React from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useActiveSession } from '../hooks/useActiveSession';

interface CompactTimerProps {
  className?: string;
  onStartSession?: () => void;
}

export default function CompactTimer({ className = '', onStartSession }: CompactTimerProps) {
  const {
    sessionState,
    sessionData,
    progress,
    pauseSession,
    resumeSession,
    completeSession
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

  // Idle state - simple start button
  if (sessionState === 'idle' || !sessionData) {
    return (
      <div className={`flex items-center ${className}`}>
        <button
          onClick={onStartSession}
          className="flex items-center space-x-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Play size={14} />
          <span>Start</span>
        </button>
      </div>
    );
  }

  // Active session - compact timer display
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Subject indicator */}
      <div className="flex items-center space-x-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: sessionData.subjectColor }}
        ></div>
        <span className="text-sm font-medium text-gray-700 max-w-20 truncate">
          {sessionData.subjectName}
        </span>
      </div>

      {/* Timer display */}
      <div className="flex items-center space-x-1 bg-gray-50 rounded-lg px-2 py-1">
        <span className="text-sm font-mono font-semibold text-gray-900">
          {formatTime(progress.elapsedSeconds)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-1">
        {sessionState === 'active' && (
          <button
            onClick={pauseSession}
            className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
            title="Pause"
          >
            <Pause size={12} />
          </button>
        )}

        {sessionState === 'paused' && (
          <button
            onClick={resumeSession}
            className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
            title="Resume"
          >
            <Play size={12} />
          </button>
        )}

        <button
          onClick={() => completeSession(sessionData.notes)}
          className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          title="Complete Session"
        >
          <Square size={12} />
        </button>
      </div>
    </div>
  );
}