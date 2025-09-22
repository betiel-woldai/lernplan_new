import { useState, useEffect, useCallback, useRef } from 'react';
import { useLearningSessions, CreateSessionData } from './useLearningSessions';
import { dispatchEvent, createThrottledDispatcher } from '../utils/eventBus';
import { LearningSession as DomainLearningSession, TimeAdjustment } from '../types';
import { getBerlinDateString } from '../utils/timezone';

export type SessionState = 'idle' | 'active' | 'paused' | 'completed' | 'saving' | 'extension_needed' | 'pending-approval';

interface ActiveSessionData {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  targetDuration: number; // in minutes
  originalTargetDuration: number; // in minutes - original planned duration
  totalExtensions: number; // in minutes - total time added through extensions
  notes?: string;
  timeAdjustments?: Array<{
    timestamp: number;
    previousDuration: number;
    newDuration: number;
    elapsedAtAdjustment: number;
    reason: string;
    adjustmentType: string;
  }>;
}

interface SessionProgress {
  elapsedSeconds: number;
  targetSeconds: number;
  progress: number; // 0-100
  remainingSeconds: number;
}

export function useActiveSession() {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [sessionData, setSessionData] = useState<ActiveSessionData | null>(null);
  const [progress, setProgress] = useState<SessionProgress>({
    elapsedSeconds: 0,
    targetSeconds: 0,
    progress: 0,
    remainingSeconds: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedDuration, setPausedDuration] = useState<number>(0);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingSessionData, setPendingSessionData] = useState<CreateSessionData | null>(null);
  
  // Flag to prevent circular sync events
  const isSyncingRef = useRef(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { createSession } = useLearningSessions();

  // Create throttled dispatcher for session progress events
  const dispatchProgressThrottled = useRef(
    createThrottledDispatcher('sessionProgress', 2000) // Every 2 seconds
  );

  // localStorage key for session persistence
  const STORAGE_KEY = 'activeSession';


  // Timer functionality - runs every second when session is active
  useEffect(() => {
    if (sessionState !== 'active' || !sessionData || !startTime) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const effectivePausedDuration = pauseStartedAt
        ? pausedDuration + (now - pauseStartedAt)
        : pausedDuration;
      const elapsedMs = now - startTime - effectivePausedDuration;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const targetSeconds = sessionData.targetDuration * 60;
      const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
      const progress = Math.min(100, (elapsedSeconds / targetSeconds) * 100);

      setProgress({
        elapsedSeconds,
        targetSeconds,
        progress,
        remainingSeconds
      });

      // Dispatch throttled session progress event
      dispatchProgressThrottled.current({
        subjectId: sessionData.subjectId,
        progress,
        elapsedSeconds,
        remainingSeconds,
        isActive: true
      }, 'useActiveSession');

      // Show extension dialog when planned time is reached (only for original target, not extensions)
      if (remainingSeconds === 0 && sessionData.totalExtensions === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Trigger extension dialog
        setSessionState('extension_needed');
      }
    };

    // Start the timer
    timerRef.current = setInterval(updateTimer, 1000);
    updateTimer(); // Immediate update

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionState, sessionData, startTime, pausedDuration, pauseStartedAt, createSession]);

  // Save to localStorage and broadcast sync events only for major state changes
  useEffect(() => {
    if (sessionState !== 'idle') {
      const sessionToSave = {
        sessionState,
        sessionData,
        startTime,
        pausedDuration,
        pauseStartedAt,
        progress
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));
      
      // Only broadcast if not currently syncing from another instance
      if (!isSyncingRef.current) {
        console.log('🔄 Broadcasting session sync event:', sessionToSave);
        const syncEvent = new CustomEvent('sessionSync', {
          detail: sessionToSave
        });
        window.dispatchEvent(syncEvent);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      
      // Only broadcast clear event if not currently syncing
      if (!isSyncingRef.current) {
        console.log('🔄 Broadcasting session clear event');
        const syncEvent = new CustomEvent('sessionSync', {
          detail: { sessionState: 'idle' }
        });
        window.dispatchEvent(syncEvent);
      }
    }
  }, [sessionState, sessionData, startTime, pausedDuration, pauseStartedAt]); // Removed progress from dependency array

  // Restore session from localStorage on mount
  useEffect(() => {
    console.log('🔄 useActiveSession: Attempting to restore session from localStorage');
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('🔄 Saved session data:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('🔄 Parsed session:', parsed);
        if (parsed.sessionState && parsed.sessionState !== 'completed' && parsed.sessionData) {
          setSessionState(parsed.sessionState);
          setSessionData(parsed.sessionData);
          setStartTime(parsed.startTime);
          setPausedDuration(parsed.pausedDuration || 0);
          setPauseStartedAt(parsed.pauseStartedAt || null);
          setProgress(parsed.progress || {
            elapsedSeconds: 0,
            targetSeconds: parsed.sessionData.targetDuration * 60,
            progress: 0,
            remainingSeconds: parsed.sessionData.targetDuration * 60
          });
        }
      }
    } catch (err) {
      console.warn('Failed to restore session from localStorage:', err);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Calculate progress helper
  const calculateProgress = useCallback((data: ActiveSessionData, elapsed: number): SessionProgress => {
    const targetSeconds = data.targetDuration * 60;
    const remainingSeconds = Math.max(0, targetSeconds - elapsed);
    const progress = Math.min(100, (elapsed / targetSeconds) * 100);

    return {
      elapsedSeconds: elapsed,
      targetSeconds,
      progress,
      remainingSeconds
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Listen for custom session sync events from other hook instances in the same window
  useEffect(() => {
    const handleSessionSync = (e: CustomEvent) => {
      const sessionData = e.detail;
      console.log('🔄 Session sync event received:', sessionData);
      
      // Set syncing flag to prevent circular broadcasts
      isSyncingRef.current = true;
      
      if (sessionData.sessionState && sessionData.sessionState !== 'completed' && sessionData.sessionData) {
        console.log('🔄 Syncing session state from custom event:', sessionData);
        setSessionState(sessionData.sessionState);
        setSessionData(sessionData.sessionData);
        setStartTime(sessionData.startTime);
        setPausedDuration(sessionData.pausedDuration || 0);
        setPauseStartedAt(sessionData.pauseStartedAt || null);
        setProgress(sessionData.progress || {
          elapsedSeconds: 0,
          targetSeconds: sessionData.sessionData.targetDuration * 60,
          progress: 0,
          remainingSeconds: sessionData.sessionData.targetDuration * 60
        });
      } else if (!sessionData.sessionState || sessionData.sessionState === 'idle') {
        // Session was cleared
        console.log('🔄 Session cleared by sync event');
        setSessionState('idle');
        setSessionData(null);
        setStartTime(null);
        setPausedDuration(0);
        setPauseStartedAt(null);
        setProgress({
          elapsedSeconds: 0,
          targetSeconds: 0,
          progress: 0,
          remainingSeconds: 0
        });
      }
      
      // Reset syncing flag after a short delay
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 10);
    };

    window.addEventListener('sessionSync', handleSessionSync as EventListener);
    return () => window.removeEventListener('sessionSync', handleSessionSync as EventListener);
  }, []);

  const startSession = useCallback((sessionDataParam: Omit<ActiveSessionData, 'originalTargetDuration' | 'totalExtensions'>) => {
    try {
      setError(null);

      // Initialize session data with extension tracking
      const fullSessionData: ActiveSessionData = {
        ...sessionDataParam,
        originalTargetDuration: sessionDataParam.targetDuration,
        totalExtensions: 0
      };

      // Set session data and start time
      setSessionData(fullSessionData);
      setStartTime(Date.now());
      setPausedDuration(0);
      setSessionState('active');
      setPauseStartedAt(null);

      // Initialize progress
      const initialProgress = calculateProgress(fullSessionData, 0);
      setProgress(initialProgress);

      // Save to localStorage for persistence
      const sessionToSave = {
        sessionData: fullSessionData,
        startTime: Date.now(),
        pausedDuration: 0,
        pauseStartedAt: null,
        sessionState: 'active'
      };
      console.log('💾 Saving session to localStorage:', sessionToSave);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));

      // Dispatch session started event
      dispatchEvent('sessionStarted', {
        session: {
          subjectId: sessionDataParam.subjectId,
          subjectName: sessionDataParam.subjectName,
          subjectColor: sessionDataParam.subjectColor,
          targetDuration: sessionDataParam.targetDuration,
          startTime: Date.now()
        }
      }, 'useActiveSession');

      console.log(`Session started: ${sessionDataParam.subjectName} for ${sessionDataParam.targetDuration} minutes`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      console.error('Start session error:', err);
    }
  }, [calculateProgress]);

  const pauseSession = useCallback(() => {
    if (sessionState !== 'active' || !sessionData || !startTime) {
      setError('Cannot pause: no active session');
      return;
    }

    try {
      setError(null);
      setPauseStartedAt(Date.now());
      setSessionState('paused');
      
      console.log('Session paused');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause session';
      setError(errorMessage);
      console.error('Pause session error:', err);
    }
  }, [sessionState, sessionData, startTime]);

  const resumeSession = useCallback(() => {
    if (sessionState !== 'paused' || !sessionData || !startTime) {
      setError('Cannot resume: no paused session');
      return;
    }

    try {
      setError(null);
      
      // Add paused time to total paused duration
      if (!pauseStartedAt) {
        setError('Cannot resume: pause time not recorded');
        return;
      }

      const pausedTime = Date.now() - pauseStartedAt;
      setPausedDuration(prev => prev + pausedTime);
      setPauseStartedAt(null);
      setSessionState('active');

      console.log('Session resumed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume session';
      setError(errorMessage);
      console.error('Resume session error:', err);
    }
  }, [sessionState, sessionData, startTime, pauseStartedAt]);

  const completeSession = useCallback(async (notes?: string): Promise<DomainLearningSession | null> => {
    if (!sessionData || sessionState === 'idle') {
      setError('No active session to complete');
      return null;
    }

    try {
      setError(null);
      // Calculate final elapsed time
      const now = Date.now();
      const totalPausedDuration = pauseStartedAt
        ? pausedDuration + (now - pauseStartedAt)
        : pausedDuration;
      const elapsedMs = Math.max(0, now - (startTime || now) - totalPausedDuration);
      const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 1000 / 60)); // Minimum 1 minute

      const adjustmentsCount = sessionData.timeAdjustments?.length ?? 0;

      // Create session data for approval (don't save yet)
      const sessionApiData: CreateSessionData = {
        subjectId: sessionData.subjectId,
        duration: elapsedMinutes,
        date: getBerlinDateString(), // Today's date in Berlin timezone (YYYY-MM-DD format)
        notes: notes || sessionData.notes,
        completed: true,
        // Include audit data for database logging
        plannedDuration: sessionData.originalTargetDuration,
        timeAdjustments: sessionData.timeAdjustments ?? [],
        manualAdjustmentReason: adjustmentsCount > 0
          ? `${adjustmentsCount} adjustment(s) made`
          : undefined
      };

      // Store data for approval modal, don't save yet
      setPendingSessionData(sessionApiData);
      setSessionState('pending-approval');
      return null; // Return null since session isn't saved yet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save session to calendar';
      setError(errorMessage);
      console.error('Complete session error:', err);

      // Revert to active state on error to allow retry
      setSessionState('active');
      setPauseStartedAt(null);

      // Clear error after 5 seconds to allow retry
      setTimeout(() => {
        setError(null);
      }, 5000);
      return null;
    }
  }, [sessionData, sessionState, startTime, pausedDuration, pauseStartedAt, createSession]);

  const approveAndSaveSession = useCallback(async (finalDuration?: number, finalNotes?: string): Promise<DomainLearningSession | null> => {
    if (!pendingSessionData || sessionState !== 'pending-approval') {
      setError('No pending session to approve');
      return null;
    }

    try {
      setError(null);
      setSessionState('saving');

      // Update session data with final values
      const finalSessionData = {
        ...pendingSessionData,
        duration: finalDuration ?? pendingSessionData.duration,
        notes: finalNotes ?? pendingSessionData.notes
      };

      // Save session to database
      const savedSession = await createSession(finalSessionData);

      if (savedSession) {
        // Clear pending data
        setPendingSessionData(null);
        setSessionState('completed');

        // Clear localStorage and session state
        localStorage.removeItem(STORAGE_KEY);
        setTimeout(() => {
          setSessionState('idle');
          setSessionData(null);
          setStartTime(null);
          setPausedDuration(0);
          setPauseStartedAt(null);
          setProgress({
            elapsedSeconds: 0,
            targetSeconds: 0,
            progress: 0,
            remainingSeconds: 0
          });
        }, 1500);

        return savedSession;
      } else {
        throw new Error('Failed to save session to database');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save session';
      setError(errorMessage);
      console.error('Approve session error:', err);
      setSessionState('pending-approval');
      return null;
    }
  }, [pendingSessionData, sessionState, createSession]);

  const discardPendingSession = useCallback(() => {
    setPendingSessionData(null);
    setSessionState('idle');
    setSessionData(null);
    setStartTime(null);
    setPausedDuration(0);
    setPauseStartedAt(null);
    setProgress({
      elapsedSeconds: 0,
      targetSeconds: 0,
      progress: 0,
      remainingSeconds: 0
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const cancelSession = useCallback(() => {
    if (sessionState === 'idle') {
      return; // Nothing to cancel
    }

    try {
      setError(null);
      
      // Clear all session data
      setSessionState('idle');
      setSessionData(null);
      setStartTime(null);
      setPausedDuration(0);
      setPauseStartedAt(null);
      setProgress({
        elapsedSeconds: 0,
        targetSeconds: 0,
        progress: 0,
        remainingSeconds: 0
      });

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      console.log('Session cancelled');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel session';
      setError(errorMessage);
      console.error('Cancel session error:', err);
    }
  }, [sessionState]);

  const extendSession = useCallback((extensionMinutes?: number) => {
    if (sessionState !== 'extension_needed' || !sessionData) {
      setError('Cannot extend: session is not in extension state');
      return;
    }

    try {
      setError(null);

      // Add extension time to target duration
      const extensionToAdd = extensionMinutes || 0; // 0 means indefinite extension
      const newTargetDuration = extensionToAdd > 0
        ? sessionData.targetDuration + extensionToAdd
        : sessionData.targetDuration + 1440; // Add 24 hours for "indefinite"

      // Update session data with extension
      const updatedSessionData = {
        ...sessionData,
        targetDuration: newTargetDuration,
        totalExtensions: sessionData.totalExtensions + extensionToAdd
      };

      setSessionData(updatedSessionData);
      setPauseStartedAt(null);
      setSessionState('active');

      console.log(`Session extended: +${extensionToAdd || 'indefinite'} minutes`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to extend session';
      setError(errorMessage);
      console.error('Extend session error:', err);
    }
  }, [sessionState, sessionData]);

  const adjustSessionTime = useCallback((newDurationMinutes: number, reason?: string) => {
    if (!sessionData || sessionState === 'idle') {
      setError('No active session to adjust');
      return;
    }

    try {
      setError(null);

      const now = Date.now();
      const effectivePausedDuration = pauseStartedAt
        ? pausedDuration + (now - pauseStartedAt)
        : pausedDuration;
      const elapsedMs = now - (startTime || now) - effectivePausedDuration;
      const currentElapsedMinutes = Math.floor(elapsedMs / 1000 / 60);

      // Create adjustment log entry
      const adjustmentEntry = {
        timestamp: now,
        previousDuration: sessionData.targetDuration,
        newDuration: newDurationMinutes,
        elapsedAtAdjustment: currentElapsedMinutes,
        reason: reason || 'Manual adjustment',
        adjustmentType: 'manual_duration_change'
      };

      // Add to session data time adjustments log
      const updatedSessionData = {
        ...sessionData,
        targetDuration: newDurationMinutes,
        timeAdjustments: [...(sessionData.timeAdjustments || []), adjustmentEntry]
      };

      setSessionData(updatedSessionData);

      // Recalculate progress with new target
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const newProgress = calculateProgress(updatedSessionData, elapsedSeconds);
      setProgress(newProgress);

      console.log(`⚙️ Session time adjusted: ${sessionData.targetDuration}min → ${newDurationMinutes}min (${reason || 'Manual adjustment'})`);
      console.log('📝 Adjustment logged:', adjustmentEntry);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to adjust session time';
      setError(errorMessage);
      console.error('Adjust session time error:', err);
    }
  }, [sessionData, sessionState, startTime, pausedDuration, pauseStartedAt, calculateProgress]);

  return {
    sessionState,
    sessionData,
    pendingSessionData,
    progress,
    error,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    approveAndSaveSession,
    discardPendingSession,
    cancelSession,
    extendSession,
    adjustSessionTime,
    clearError: () => setError(null)
  };
}
