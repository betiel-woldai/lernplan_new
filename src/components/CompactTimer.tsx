import React, { useState } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { useActiveSession } from '../hooks/useActiveSession';
import SessionCompletionModal from './SessionCompletionModal';

interface CompactTimerProps {
  className?: string;
  onShowSubjectSelector?: () => void;
  onShowSessionSummary?: (session: any) => void;
}

export default function CompactTimer({ className = '', onShowSubjectSelector, onShowSessionSummary }: CompactTimerProps) {
  const {
    sessionState,
    sessionData,
    pendingSessionData,
    progress,
    completeSession,
    approveAndSaveSession,
    discardPendingSession
  } = useActiveSession();

  // Debug logging to see what's happening
  console.log('🔍 CompactTimer render:', {
    sessionState,
    sessionData: sessionData ? `${sessionData.subjectName} (${sessionData.subjectId})` : null,
    progress: `${progress.elapsedSeconds}s (${progress.progress}%)`
  });

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = async () => {
    if (sessionData) {
      try {
        // This will now set state to 'pending-approval' and show modal
        await completeSession(sessionData.notes);
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    }
  };

  const handleApproveSession = async (finalDuration: number, finalNotes?: string) => {
    try {
      const completedSession = await approveAndSaveSession(finalDuration, finalNotes);
      if (completedSession && onShowSessionSummary) {
        // Format session data for summary display
        const sessionSummary = {
          id: completedSession.id,
          duration: completedSession.duration,
          subjectName: sessionData?.subjectName || '',
          subjectColor: sessionData?.subjectColor || '#000',
          points: completedSession.points || 0,
          completedAt: new Date()
        };
        onShowSessionSummary(sessionSummary);
      }
    } catch (error) {
      console.error('Failed to approve session:', error);
    }
  };

  const handleDiscardSession = () => {
    discardPendingSession();
  };

  return (
    <>
      {/* IDLE STATE: Green "Start" button prominently displayed */}
      {(sessionState === 'idle' || !sessionData) && (
        <div className={`flex items-center ${className}`}>
          <button
            onClick={onShowSubjectSelector}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            title="Start a learning session"
          >
            <Play size={16} />
            <span>Start</span>
          </button>
        </div>
      )}

      {/* ACTIVE SESSION: Red "Stop" button + Live timer display */}
      {sessionData && sessionState !== 'idle' && (
        <div className={`flex items-center space-x-3 ${className}`}>
          {/* Live timer display */}
          <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-1">
            <Clock size={14} className="text-blue-600" />
            <span className="text-sm font-mono font-semibold text-blue-900">
              {formatTime(progress.elapsedSeconds)}
            </span>
          </div>

          {/* Subject indicator */}
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: sessionData.subjectColor }}
            ></div>
            <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
              {sessionData.subjectName}
            </span>
          </div>

          {/* Red "Stop" button */}
          <button
            onClick={handleStop}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            title="Stop session and save"
          >
            <Square size={16} />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* Session Completion Modal */}
      <SessionCompletionModal
        isOpen={sessionState === 'pending-approval' && !!pendingSessionData}
        onApprove={handleApproveSession}
        onDiscard={handleDiscardSession}
        subjectName={sessionData?.subjectName || ''}
        subjectColor={sessionData?.subjectColor || '#000'}
        targetDuration={sessionData?.originalTargetDuration || 0}
        actualDuration={pendingSessionData?.duration ?? Math.floor(progress.elapsedSeconds / 60)}
        notes={pendingSessionData?.notes || ''}
      />
    </>
  );
}
