// Real-time event system type definitions
// Provides type safety for the custom event-driven architecture

import { LearningSession, UserStats, Subject, Achievement } from './index';

// Base event interface for type safety
interface BaseCustomEvent<T = any> {
  detail: T;
}

// Session-related events
export interface SessionStartedEvent extends BaseCustomEvent {
  detail: {
    session: {
      subjectId: string;
      subjectName: string;
      subjectColor: string;
      targetDuration: number;
      startTime: number;
    };
  };
}

export interface SessionCompletedEvent extends BaseCustomEvent {
  detail: {
    session: LearningSession;
    xpGained: number;
    completedAt: number;
    elapsedMinutes: number;
  };
}

export interface SessionProgressEvent extends BaseCustomEvent {
  detail: {
    subjectId: string;
    progress: number; // 0-100
    elapsedSeconds: number;
    remainingSeconds: number;
    isActive: boolean;
  };
}

// XP and gamification events  
export interface XPGainedEvent extends BaseCustomEvent {
  detail: {
    amount: number;
    source: string;
    totalXP: number;
    previousXP: number;
    sessionId?: string;
  };
}

export interface LevelUpEvent extends BaseCustomEvent {
  detail: {
    newLevel: number;
    previousLevel: number;
    totalXP: number;
    xpToNext: number;
  };
}

export interface AchievementUnlockedEvent extends BaseCustomEvent {
  detail: {
    achievement: Achievement;
    trigger: string; // What caused the achievement
  };
}

export interface StreakUpdatedEvent extends BaseCustomEvent {
  detail: {
    newStreak: number;
    previousStreak: number;
    milestone?: number; // If a milestone was reached
  };
}

// Statistics and analytics events
export interface StatsUpdatedEvent extends BaseCustomEvent {
  detail: {
    stats: Partial<UserStats>;
    changedFields: string[];
    trigger: string; // What caused the stats update
  };
}

export interface ProgressChangedEvent extends BaseCustomEvent {
  detail: {
    subjectId: string;
    previousHours: number;
    newHours: number;
    progressPercentage: number;
    trigger: 'session_completed' | 'manual_update';
  };
}

// Subject management events (extending existing system)
export interface SubjectCreatedEvent extends BaseCustomEvent {
  detail: {
    subject: Subject;
  };
}

export interface SubjectUpdatedEvent extends BaseCustomEvent {
  detail: {
    subjectId: string;
    updatedSubject: Subject;
    changedFields: string[];
  };
}

export interface SubjectDeletedEvent extends BaseCustomEvent {
  detail: {
    subjectId: string;
    subjectName: string;
  };
}

// Calendar synchronization events
export interface CalendarSyncedEvent extends BaseCustomEvent {
  detail: {
    subjectId?: string;
    syncedSessions: number;
    trigger: 'subject_change' | 'manual_sync';
  };
}

// Aggregated event types for type safety
export interface CustomEventMap {
  // Session events
  sessionStarted: SessionStartedEvent;
  sessionCompleted: SessionCompletedEvent;
  sessionProgress: SessionProgressEvent;
  
  // Gamification events
  xpGained: XPGainedEvent;
  levelUp: LevelUpEvent;
  achievementUnlocked: AchievementUnlockedEvent;
  streakUpdated: StreakUpdatedEvent;
  
  // Stats and analytics events
  statsUpdated: StatsUpdatedEvent;
  progressChanged: ProgressChangedEvent;
  
  // Subject management events
  subjectCreated: SubjectCreatedEvent;
  subjectUpdated: SubjectUpdatedEvent;
  subjectDeleted: SubjectDeletedEvent;
  
  // Calendar events
  calendarSynced: CalendarSyncedEvent;
}

// Event type names for runtime usage
export type EventType = keyof CustomEventMap;

// Helper type for event dispatching
export type EventDetail<T extends EventType> = CustomEventMap[T]['detail'];

// Event listener callback types
export type EventCallback<T extends EventType> = (event: CustomEventMap[T]) => void | Promise<void>;

// Generic event listener type for untyped usage
export type GenericEventCallback = (event: CustomEvent) => void | Promise<void>;

// Event dispatcher utility type
export interface EventDispatcher {
  dispatch<T extends EventType>(eventType: T, detail: EventDetail<T>): void;
  listen<T extends EventType>(eventType: T, callback: EventCallback<T>): () => void;
  unlisten<T extends EventType>(eventType: T, callback: EventCallback<T>): void;
}

// Event history for debugging and analytics
export interface EventHistoryEntry {
  type: EventType;
  detail: any;
  timestamp: number;
  source?: string; // Component or hook that dispatched the event
}

// Configuration for event behavior
export interface EventConfig {
  enableDebugLogging: boolean;
  maxHistoryEntries: number;
  throttleSessionProgress: number; // ms between session progress events
}

// Default configuration
export const DEFAULT_EVENT_CONFIG: EventConfig = {
  enableDebugLogging: true, // Always enable for debugging
  maxHistoryEntries: 100,
  throttleSessionProgress: 1000, // 1 second
};