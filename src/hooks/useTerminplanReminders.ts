import { useEffect, useRef } from 'react';
import { CalendarSession } from '@/types/calendar';
import { DEFAULT_POLICIES } from '@/lib/reminders/policy';

type TimerRef = { id: number; key: string };

function classifyCategory(session: CalendarSession): 'exam' | 'deadline' | 'info' | 'tbd' {
  if (session.type === 'exam') return 'exam';
  return 'info';
}

export function useTerminplanReminders(sessions: CalendarSession[]) {
  const timers = useRef<TimerRef[]>([]);

  useEffect(() => {
    // Clear previous timers
    timers.current.forEach(t => clearTimeout(t.id));
    timers.current = [];

    const now = Date.now();

    const fixedSessions = sessions.filter(s => (s as any).isFixed);
    for (const s of fixedSessions) {
      const category = classifyCategory(s);
      const policy = DEFAULT_POLICIES.find(p => p.category === category) || DEFAULT_POLICIES.find(p => p.category === 'info')!;
      const startMs = new Date(s.startTime).getTime();

      for (const trig of policy.triggers) {
        const when = startMs + trig.offsetMs; // offsetMs are negative for before
        if (when <= now) continue; // skip past

        // Only schedule within next 14 days to avoid many timers
        if (when - now > 14 * 24 * 60 * 60 * 1000) continue;

        const key = `${s.id}:${trig.offsetMs}`;
        const delay = Math.max(0, when - now);
        const id = window.setTimeout(() => {
          const event = new CustomEvent('terminplanReminder', {
            detail: {
              sessionId: s.id,
              title: s.title,
              startsAt: s.startTime,
              priority: trig.priority,
            }
          });
          window.dispatchEvent(event);
        }, delay);
        timers.current.push({ id, key });
      }
    }

    return () => {
      timers.current.forEach(t => clearTimeout(t.id));
      timers.current = [];
    };
  }, [sessions]);
}

export default useTerminplanReminders;

