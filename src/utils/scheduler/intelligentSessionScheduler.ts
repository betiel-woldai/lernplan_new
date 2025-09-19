import { createHash } from 'crypto';
import { Subject } from '@/types';
import { CalendarSession } from '@/types/calendar';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_DAY_START_HOUR = 9;
const SESSION_START_INTERVAL_HOURS = 2;
const LATEST_SESSION_START_HOUR = 19;

interface SessionRequest {
  subject: Subject;
  date: Date;
  minutes: number;
  intensity: boolean;
  priority: number;
}

interface BusySlot {
  start: number;
  end: number;
}

type BusyMap = Map<string, BusySlot[]>;

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function startOfDay(date: Date): Date {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function addDays(date: Date, days: number): Date {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function clampMinutes(value: number): number {
  return Math.max(30, Math.round(value / 5) * 5);
}

function registerBusySlot(busy: BusyMap, date: Date, start: Date, end: Date): void {
  const key = formatDateKey(date);
  const slots = busy.get(key) || [];
  slots.push({ start: start.getTime(), end: end.getTime() });
  busy.set(key, slots);
}

function hasConflict(busy: BusyMap, start: Date, end: Date): boolean {
  const key = formatDateKey(start);
  const slots = busy.get(key);
  if (!slots) return false;

  const candidateStart = start.getTime();
  const candidateEnd = end.getTime();

  return slots.some(slot => !(candidateEnd <= slot.start || candidateStart >= slot.end));
}

function findAvailableSlot(
  date: Date,
  minutes: number,
  busy: BusyMap
): { start: Date; end: Date } | null {
  const durationMs = minutes * 60 * 1000;

  for (let hour = DEFAULT_DAY_START_HOUR; hour <= LATEST_SESSION_START_HOUR; hour += SESSION_START_INTERVAL_HOURS) {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start.getTime() + durationMs);
    if (!hasConflict(busy, start, end)) {
      return { start, end };
    }
  }

  return null;
}

function daysBetween(anchor: Date, target: Date): number {
  return Math.ceil((startOfDay(target).getTime() - startOfDay(anchor).getTime()) / MS_PER_DAY);
}

function buildSessionRequests(subject: Subject): SessionRequest[] {
  if (!subject.examDate) return [];

  const requests: SessionRequest[] = [];
  const today = startOfDay(new Date());
  const start = startOfDay(subject.startDate < today ? today : subject.startDate);
  const exam = startOfDay(subject.examDate);

  if (exam <= start) return [];

  const totalWeeks = Math.max(1, Math.ceil(daysBetween(start, exam) / 7));
  const intensityWeeks = Math.min(subject.intensityWeeks, totalWeeks);
  const intensityWindowStart = addDays(exam, -intensityWeeks * 7);

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const weekStart = addDays(start, weekIndex * 7);
    const weekEnd = addDays(weekStart, 6);

    if (weekStart >= exam) break;

    const inIntensity = intensityWeeks > 0 && weekStart >= intensityWindowStart;
    const baseSessions = Math.max(1, subject.daysPerWeek);
    const sessionsThisWeek = inIntensity ? Math.min(baseSessions + 1, 6) : baseSessions;
    const minutesPerSession = clampMinutes((subject.hoursPerWeek * 60) / sessionsThisWeek);

    const candidateDays: Date[] = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const candidate = addDays(weekStart, dayOffset);
      if (candidate >= exam) continue;
      if (isWeekend(candidate) && sessionsThisWeek <= 5) continue;
      candidateDays.push(candidate);
    }

    if (candidateDays.length === 0) continue;

    const step = Math.max(1, Math.floor(candidateDays.length / sessionsThisWeek));
    for (let sessionIndex = 0; sessionIndex < sessionsThisWeek; sessionIndex++) {
      const dayIndex = Math.min(sessionIndex * step, candidateDays.length - 1);
      const sessionDate = candidateDays[dayIndex];
      const priorityBoost = inIntensity ? 20 : 0;
      const daysToExam = Math.max(0, daysBetween(sessionDate, exam));
      const priority = priorityBoost + Math.max(0, 100 - daysToExam);

      requests.push({
        subject,
        date: sessionDate,
        minutes: minutesPerSession,
        intensity: inIntensity,
        priority,
      });
    }
  }

  return requests;
}

function reserveExistingEvents(busy: BusyMap, events: CalendarSession[]): void {
  events.forEach(event => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    registerBusySlot(busy, start, start, end);
  });
}

function generateSessionId(subjectId: string, start: Date, index: number): string {
  const identifier = `study-${subjectId}-${start.toISOString()}-${index}`;
  const hash = createHash('sha256').update(identifier).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
}

export function buildStudySchedule(
  subjects: Subject[],
  existingEvents: CalendarSession[]
): CalendarSession[] {
  const busy: BusyMap = new Map();
  reserveExistingEvents(busy, existingEvents);

  const requests = subjects
    .flatMap(buildSessionRequests)
    .sort((a, b) => b.priority - a.priority);

  const generated: CalendarSession[] = [];
  let counter = 0;

  for (const request of requests) {
    let scheduled: { start: Date; end: Date } | null = null;

    for (let dayShift = 0; dayShift <= 3 && !scheduled; dayShift++) {
      const targetDate = addDays(request.date, dayShift);
      if (targetDate >= request.subject.examDate!) break;

      const slot = findAvailableSlot(targetDate, request.minutes, busy);
      if (slot) {
        scheduled = slot;
        break;
      }
    }

    if (!scheduled) {
      continue;
    }

    registerBusySlot(busy, scheduled.start, scheduled.start, scheduled.end);

    const session: CalendarSession = {
      id: generateSessionId(request.subject.id, scheduled.start, counter++),
      title: `${request.subject.name} Study Session`,
      subjectId: request.subject.id,
      subjectName: request.subject.name,
      subjectColor: request.subject.color,
      startTime: scheduled.start,
      endTime: scheduled.end,
      plannedDuration: request.minutes,
      duration: request.minutes,
      completed: false,
      description: request.intensity
        ? `Intensive study block for ${request.subject.name}`
        : `Scheduled study block for ${request.subject.name}`,
      type: 'study',
      isAutoGenerated: true,
      origin: 'auto',
      sourceSubjectExamId: request.subject.id,
      schedulingPriority: request.priority,
      source: 'calendar',
    };

    generated.push(session);
  }

  return generated.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}
