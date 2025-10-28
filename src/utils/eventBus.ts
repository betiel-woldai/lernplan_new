// Typed event bus utility for real-time data propagation
// Provides a centralized, type-safe event system for cross-component communication

import { 
  EventType, 
  EventDetail, 
  EventCallback, 
  EventHistoryEntry, 
  EventConfig, 
  DEFAULT_EVENT_CONFIG 
} from '../types/events';

class TypedEventBus {
  private eventHistory: EventHistoryEntry[] = [];
  private config: EventConfig = DEFAULT_EVENT_CONFIG;
  private listeners: Map<EventType, Set<Function>> = new Map();

  constructor(config?: Partial<EventConfig>) {
    if (config) {
      this.config = { ...DEFAULT_EVENT_CONFIG, ...config };
    }
  }

  // Dispatch a typed custom event
  dispatch<T extends EventType>(eventType: T, detail: EventDetail<T>, source?: string): void {
    try {
      // Create the custom event
      const customEvent = new CustomEvent(eventType, { detail });
      
      // Log for debugging
      if (this.config.enableDebugLogging) {
        // console.group(`🚀 Event Dispatched: ${eventType}`);
        // console.log('Detail:', detail);
        // console.log('Source:', source || 'unknown');
        console.groupEnd();
      }

      // Add to history
      this.addToHistory({
        type: eventType,
        detail,
        timestamp: Date.now(),
        source
      });

      // Dispatch via window for global listening
      window.dispatchEvent(customEvent);

      // Call direct listeners
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.forEach(callback => {
          try {
            callback(customEvent);
          } catch (error) {
            console.error(`Error in event listener for ${eventType}:`, error);
          }
        });
      }
    } catch (error) {
      console.error(`Failed to dispatch event ${eventType}:`, error);
    }
  }

  // Listen to typed events with automatic cleanup
  listen<T extends EventType>(
    eventType: T, 
    callback: EventCallback<T>, 
    options?: { once?: boolean }
  ): () => void {
    const wrappedCallback = (event: Event) => {
      if (event instanceof CustomEvent) {
        callback(event as any);
      }
    };

    // Add to window listeners for global events
    window.addEventListener(eventType, wrappedCallback, { once: options?.once });

    // Add to direct listeners
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(wrappedCallback);

    // Return cleanup function
    return () => {
      window.removeEventListener(eventType, wrappedCallback);
      this.listeners.get(eventType)?.delete(wrappedCallback);
    };
  }

  // Remove specific event listener
  unlisten<T extends EventType>(eventType: T, callback: EventCallback<T>): void {
    window.removeEventListener(eventType, callback as any);
    this.listeners.get(eventType)?.delete(callback as any);
  }

  // Clear all listeners for an event type
  clearListeners<T extends EventType>(eventType: T): void {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        window.removeEventListener(eventType, callback as any);
      });
      eventListeners.clear();
    }
  }

  // Clear all event listeners
  clearAllListeners(): void {
    this.listeners.forEach((listeners, eventType) => {
      listeners.forEach(callback => {
        window.removeEventListener(eventType, callback as any);
      });
    });
    this.listeners.clear();
  }

  // Get event history for debugging
  getEventHistory(eventType?: EventType, limit?: number): EventHistoryEntry[] {
    let history = eventType 
      ? this.eventHistory.filter(entry => entry.type === eventType)
      : this.eventHistory;
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = [];
  }

  // Update configuration
  updateConfig(newConfig: Partial<EventConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): EventConfig {
    return { ...this.config };
  }

  // Add event to history with size management
  private addToHistory(entry: EventHistoryEntry): void {
    this.eventHistory.push(entry);
    
    // Trim history if it exceeds max entries
    if (this.eventHistory.length > this.config.maxHistoryEntries) {
      this.eventHistory = this.eventHistory.slice(-this.config.maxHistoryEntries);
    }
  }
}

// Create singleton instance
export const eventBus = new TypedEventBus();

// Convenience functions for common usage patterns
export const dispatchEvent = eventBus.dispatch.bind(eventBus);
export const addEventListener = eventBus.listen.bind(eventBus);
export const removeEventListener = eventBus.unlisten.bind(eventBus);

// Hook-friendly event listener with automatic cleanup
export function useEventListener<T extends EventType>(
  eventType: T,
  callback: EventCallback<T>,
  dependencies?: any[]
): void {
  if (typeof window === 'undefined') return; // SSR safety
  
  // This would typically be used inside a useEffect in React components
  // The actual useEffect wrapper will be in the components/hooks
}

// Throttled event dispatcher (useful for high-frequency events like session progress)
export function createThrottledDispatcher<T extends EventType>(
  eventType: T,
  throttleMs: number = 1000
): (detail: EventDetail<T>, source?: string) => void {
  let lastDispatch = 0;
  
  return (detail: EventDetail<T>, source?: string) => {
    const now = Date.now();
    if (now - lastDispatch >= throttleMs) {
      eventBus.dispatch(eventType, detail, source);
      lastDispatch = now;
    }
  };
}

// Batch event dispatcher (useful for multiple related events)
export function batchDispatchEvents(events: Array<{
  type: EventType;
  detail: any;
  source?: string;
}>): void {
  events.forEach(({ type, detail, source }) => {
    eventBus.dispatch(type, detail, source);
  });
}

// Debug helper - log all events
export function enableEventDebugging(): () => void {
  const cleanup = eventBus.listen('sessionStarted' as any, () => {}, {});
  
  // This is a simplified version - in practice you'd want to listen to all event types
  const allEventTypes: EventType[] = [
    'sessionStarted', 'sessionCompleted', 'sessionProgress',
    'xpGained', 'levelUp', 'achievementUnlocked', 'streakUpdated',
    'statsUpdated', 'progressChanged', 
    'subjectCreated', 'subjectUpdated', 'subjectDeleted',
    'calendarSynced'
  ];
  
  const cleanupFunctions = allEventTypes.map(eventType => 
    eventBus.listen(eventType, (event) => {
      console.log(`📡 Event: ${eventType}`, event.detail);
    })
  );
  
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

// Default export for convenience
export default eventBus;