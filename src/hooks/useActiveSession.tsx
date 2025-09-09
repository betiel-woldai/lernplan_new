import { useState, useEffect, useCallback, useRef } from 'react';
import { useLearningSessions, CreateSessionData } from './useLearningSessions';
import { dispatchEvent, createThrottledDispatcher } from '../utils/eventBus';

export type SessionState = 'idle' | 'active' | 'paused' | 'completed';

interface ActiveSessionData {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  targetDuration: number; // in minutes
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

      // Auto-complete when time is up
      if (remainingSeconds === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Trigger auto-completion
        setSessionState('completed');
        setTimeout(async () => {
          try {
            const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 1000 / 60));
            const sessionApiData: CreateSessionData = {
              subjectId: sessionData.subjectId,
              duration: elapsedMinutes,
              date: new Date().toISOString().split('T')[0],
              notes: sessionData.notes,
              completed: true
            };

            const autoSavedSession = await createSession(sessionApiData);
            
            // Dispatch session completed event for auto-completion
            if (autoSavedSession) {
              dispatchEvent('sessionCompleted', {
                session: autoSavedSession,
                xpGained: autoSavedSession.points,
                completedAt: Date.now(),
                elapsedMinutes
              }, 'useActiveSession-auto');
            }
            
            // Clear session after completion
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
            }, 3000);
          } catch (err) {
            setError('Failed to save completed session');
            setSessionState('active'); // Revert to active state
          }
        }, 100);
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

  // Save to localStorage whenever session data changes
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
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [sessionState, sessionData, startTime, pausedDuration, progress]);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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

  const startSession = useCallback((data: ActiveSessionData) => {
    try {
      setError(null);
      
      // Set session data and start time
      setSessionData(data);
      setStartTime(Date.now());
      setPausedDuration(0);
      setSessionState('active');

      // Initialize progress
      const initialProgress = calculateProgress(data, 0);
      setProgress(initialProgress);

      // Dispatch session started event
      dispatchEvent('sessionStarted', {
        session: {
          subjectId: data.subjectId,
          subjectName: data.subjectName,
          subjectColor: data.subjectColor,
          targetDuration: data.targetDuration,
          startTime: Date.now()
        }
      }, 'useActiveSession');

      console.log(`Session started: ${data.subjectName} for ${data.targetDuration} minutes`);
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

      // Create session data for API
      const sessionApiData: CreateSessionData = {
        subjectId: sessionData.subjectId,
        duration: elapsedMinutes,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        notes: notes || sessionData.notes,
        completed: true
      };

      // Save session to database
      const savedSession = await createSession(sessionApiData);
      
      if (savedSession) {
        console.log(`Session completed: ${elapsedMinutes} minutes, ${savedSession.points} XP earned`);
        
        // Dispatch session completed event
        dispatchEvent('sessionCompleted', {
          session: savedSession,
          xpGained: savedSession.points,
          completedAt: Date.now(),
          elapsedMinutes
        }, 'useActiveSession');
        
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
    clearError: () => setError(null)
  };
}