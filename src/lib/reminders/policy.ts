// Minimal reminder policy contracts (no heavy logic yet)

const DAY = 24 * 60 * 60 * 1000; // 86,400,000 milliseconds in a day

export type Priority = 'low' | 'medium' | 'high';

export interface ReminderTrigger {
  offsetMs: number; // negative offsets before event start
  priority: Priority;
}

export interface ReminderPolicy {
  category: string; // e.g., 'deadline', 'exam', 'info', 'tbd'
  triggers: ReminderTrigger[];
}

export const DEFAULT_POLICIES: ReminderPolicy[] = [
  {
    category: 'deadline',
    triggers: offsets([-28, -7, -3, -1, -0.083], 'high'), // weeks/days/hours
  },
  {
    category: 'exam',
    triggers: offsets([-28, -14, -7, -1], 'high'),
  },
  {
    category: 'info',
    triggers: offsets([-7, -1], 'low'),
  },
  {
    category: 'tbd',
    triggers: [{ offsetMs: -7 * DAY, priority: 'low' }],
  },
];

function offsets(days: number[], priority: Priority): ReminderTrigger[] {
  return days.map(d => ({ offsetMs: toMs(d), priority }));
}

function toMs(relativeDays: number) {
  // allow hours for small values (e.g., -0.083 ~= -2h)
  return Math.round(relativeDays * DAY);
}

