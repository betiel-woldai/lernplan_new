import React, { useState } from 'react';
import { Play, Square, Clock, Info } from 'lucide-react';
import { useActiveSession } from '../hooks/useActiveSession';
import SessionCompletionModal from './SessionCompletionModal';
import LernplanFeedbackModal from './LernplanFeedbackModal';
import { useFeedbackCooldown } from '../hooks/useFeedbackCooldown';
import { useLanguage } from '@/contexts/LanguageContext';

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

  const { canShowFeedback, recheckCooldown } = useFeedbackCooldown();

  const [showTooltip, setShowTooltip] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const { t } = useLanguage();
  
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

      // Show feedback modal after successful session save (if cooldown allows)
      if (canShowFeedback) {
        setFeedbackModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to approve session:', error);
    }
  };

  const handleFeedbackSubmit = () => {
    // Recheck cooldown after feedback submission
    recheckCooldown();
  };

  const handleDiscardSession = () => {
    discardPendingSession();
  };

  return (
    <>
      {/* IDLE STATE: Green "Start" button prominently displayed */}
      {(sessionState === 'idle' || !sessionData) && (
        <div className={`flex items-center space-x-2 ${className}`}>
          <button
            onClick={onShowSubjectSelector}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md z-10"
            title="Schnellstart: Klicke auf den grünen 'Start'-Button, um direkt eine Lernsession zu beginnen und zu tracken. Der Tracker erscheint in der Kopfzeile und Sessions werden automatisch in deinem Kalender gespeichert, wenn sie abgeschlossen sind."
          >
            <Play size={16} />
            <span>Start</span>
          </button>

          {/* Info icon with tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
              aria-label="Informationen zum Start-Button"
            >
              <Info size={18} className="text-gray-500 hover:text-gray-700" />
            </button>

            {showTooltip && (
              <div className="absolute right-0 md:-left-32 top-8 z-50 w-64 md:w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl">
                <p>
                  {t('subjects.quickStart')}
                </p>
                <div className="absolute -top-2 right-4 md:left-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
              </div>
            )}
          </div>
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

      {/* Feedback Modal */}
      <LernplanFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        triggerAction="session_saved"
      />
    </>
  );
}
