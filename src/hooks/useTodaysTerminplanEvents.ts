import { useMemo } from 'react';
import { CalendarSession } from '@/types/calendar';
import { getBerlinDateString, toBerlinDateString } from '@/utils/timezone';

export interface TodaysTerminplanEvent {
  id: string;
  title: string;
  details?: string;
  popupMessage?: string;
  priority: 'low' | 'medium' | 'high';
}

export function useTodaysTerminplanEvents(sessions: CalendarSession[]) {
  const todaysEvents = useMemo(() => {
    const todayBerlin = getBerlinDateString(); // Format: YYYY-MM-DD

    const terminplanSessionsToday = sessions.filter(session => {
      // Only consider fixed terminplan events
      if (!session.isFixed || session.fixedSource !== 'terminplan') {
        return false;
      }

      // Check if the event is happening today
      // Handle both Date object and string formats, using Berlin timezone
      const sessionStartTime = session.startTime instanceof Date
        ? session.startTime
        : new Date(session.startTime);
      const sessionDateBerlin = toBerlinDateString(sessionStartTime);
      const isToday = sessionDateBerlin === todayBerlin;

      return isToday;
    });

    // Transform to our TodaysTerminplanEvent format
    return terminplanSessionsToday.map(session => {
      // Determine priority based on session type and title
      let priority: 'low' | 'medium' | 'high' = 'medium';

      const titleLower = session.title.toLowerCase();
      if (titleLower.includes('prüfung') || titleLower.includes('exam') || titleLower.includes('deadline')) {
        priority = 'high';
      } else if (titleLower.includes('anmeldung') || titleLower.includes('registration') || titleLower.includes('abgabe')) {
        priority = 'high';
      } else if (titleLower.includes('feier') || titleLower.includes('holiday') || titleLower.includes('frei')) {
        priority = 'low';
      }

      return {
        id: session.id,
        title: session.title,
        details: session.description || undefined,
        popupMessage: session.popupMessage || undefined,
        priority
      };
    });
  }, [sessions]);

  return {
    todaysEvents,
    hasEvents: todaysEvents.length > 0,
    eventCount: todaysEvents.length
  };
}