import { useState, useEffect, useCallback, useRef } from 'react';
import { useLearningSessions, CreateSessionData } from './useLearningSessions';
import { dispatchEvent, createThrottledDispatcher } from '../utils/eventBus';

export type SessionState = 'idle' | 'active' | 'paused' | 'completed' | 'extension_needed';

interface ActiveSessionData {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  targetDuration: number; // in minutes
  originalTargetDuration: number; // in minutes - original planned duration
  totalExtensions: number; // in minutes - total time added through extensions
  notes?: string;
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
  const [error, setError] = useState<string | null>(null);
  
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
      const elapsedMs = now - startTime - pausedDuration;
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
  }, [sessionState, sessionData, startTime, pausedDuration, createSession]);

  // Save to localStorage and broadcast sync events only for major state changes
  useEffect(() => {
    if (sessionState !== 'idle') {
      const sessionToSave = {
        sessionState,
        sessionData,
        startTime,
        pausedDuration,
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
  }, [sessionState, sessionData, startTime, pausedDuration]); // Removed progress from dependency array

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

      // Initialize progress
      const initialProgress = calculateProgress(fullSessionData, 0);
      setProgress(initialProgress);

      // Save to localStorage for persistence
      const sessionToSave = {
        sessionData: fullSessionData,
        startTime: Date.now(),
        pausedDuration: 0,
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
      const pausedTime = Date.now() - startTime;
      setPausedDuration(prev => prev + pausedTime);
      setStartTime(Date.now());
      setSessionState('active');

      console.log('Session resumed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume session';
      setError(errorMessage);
      console.error('Resume session error:', err);
    }
  }, [sessionState, sessionData, startTime]);

  const completeSession = useCallback(async (notes?: string) => {
    if (!sessionData || sessionState === 'idle') {
      setError('No active session to complete');
      return;
    }

    try {
      setError(null);
      setSessionState('completed');

      // Calculate final elapsed time
      const now = Date.now();
      const elapsedMs = now - (startTime || now) - pausedDuration;
      const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 1000 / 60)); // Minimum 1 minute

      // Create session data for API (all subjects including Deep Work)
      const sessionApiData: CreateSessionData = {
        subjectId: sessionData.subjectId,
        duration: elapsedMinutes,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        notes: notes || sessionData.notes,
        completed: true
      };

      // Save session to database (now includes Deep Work with proper UUID)
      const savedSession = await createSession(sessionApiData);
      console.log('Session saved to database:', {
        id: savedSession?.id,
        subject: sessionData.subjectName,
        duration: elapsedMinutes,
        points: savedSession?.points
      });
      
      if (savedSession) {
        console.log(`Session completed: ${elapsedMinutes} minutes, ${savedSession.points} XP earned`);
        
        // Dispatch session completed event
        dispatchEvent('sessionCompleted', {
          session: savedSession,
          xpGained: savedSession.points,
          completedAt: Date.now(),
          elapsedMinutes
        }, 'useActiveSession');
        
        // Clear localStorage immediately
        localStorage.removeItem(STORAGE_KEY);
        
        // Clear session state after a short delay
        setTimeout(() => {
          setSessionState('idle');
          setSessionData(null);
          setStartTime(null);
          setPausedDuration(0);
          setProgress({
            elapsedSeconds: 0,
            targetSeconds: 0,
            progress: 0,
            remainingSeconds: 0
          });
        }, 3000); // 3 second delay to show completion state
      } else {
        throw new Error('Failed to save session to database');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete session';
      setError(errorMessage);
      console.error('Complete session error:', err);
      
      // Revert to previous state on error
      if (sessionState === 'completed') {
        setSessionState('active');
      }
    }
  }, [sessionData, sessionState, startTime, pausedDuration, createSession]);

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

      // Adjust the target duration to match the new duration
      const updatedSessionData = {
        ...sessionData,
        targetDuration: newDurationMinutes
      };

      setSessionData(updatedSessionData);

      // Recalculate progress with new target
      const now = Date.now();
      const elapsedMs = now - (startTime || now) - pausedDuration;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const newProgress = calculateProgress(updatedSessionData, elapsedSeconds);
      setProgress(newProgress);

      console.log(`Session time adjusted to ${newDurationMinutes} minutes: ${reason || 'Manual adjustment'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to adjust session time';
      setError(errorMessage);
      console.error('Adjust session time error:', err);
    }
  }, [sessionData, sessionState, startTime, pausedDuration, calculateProgress]);

  return {
    sessionState,
    sessionData,
    progress,
    error,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    extendSession,
    adjustSessionTime,
    clearError: () => setError(null)
  };
}