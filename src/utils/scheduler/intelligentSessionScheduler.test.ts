import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildStudySchedule } from './intelligentSessionScheduler';
import { Subject } from '@/types';
import { CalendarSession } from '@/types/calendar';

const daysFromBase = (days: number) => {
  const base = new Date(Date.UTC(2099, 0, 1));
  base.setUTCDate(base.getUTCDate() + days);
  return base;
};

test('scheduler increases intensity near the exam date', () => {
  const subject: Subject = {
    id: 'sub-intensity',
    userId: 'user-1',
    name: 'Mathe',
    color: '#3366FF',
    startDate: daysFromBase(0),
    examDate: daysFromBase(28),
    hoursPerWeek: 6,
    daysPerWeek: 3,
    intensityWeeks: 2,
    completedHours: 0,
    targetHours: 30,
  };

  const sessions = buildStudySchedule([subject], []);
  assert.ok(sessions.length > 0, 'expected sessions to be generated');

  const intensityWindowStart = new Date(subject.examDate!);
  intensityWindowStart.setUTCDate(intensityWindowStart.getUTCDate() - subject.intensityWeeks * 7);

  const regularSessions = sessions.filter(session => session.startTime < intensityWindowStart).length;
  const intensiveSessions = sessions.filter(session => session.startTime >= intensityWindowStart).length;

  assert.ok(intensiveSessions >= regularSessions, 'intensive period should have at least as many sessions');
});

test('scheduler avoids overlapping existing events', () => {
  const subject: Subject = {
    id: 'sub-conflict',
    userId: 'user-1',
    name: 'Physik',
    color: '#FF3366',
    startDate: daysFromBase(0),
    examDate: daysFromBase(21),
    hoursPerWeek: 4,
    daysPerWeek: 2,
    intensityWeeks: 1,
    completedHours: 0,
    targetHours: 24,
  };

  const existingStart = daysFromBase(7);
  existingStart.setUTCHours(9, 0, 0, 0);
  const existingEnd = new Date(existingStart.getTime() + 2 * 60 * 60 * 1000);

  const existingEvent: CalendarSession = {
    id: 'existing-1',
    title: 'Konflikt',
    subjectId: 'other',
    subjectName: 'Andere',
    subjectColor: '#999999',
    startTime: existingStart,
    endTime: existingEnd,
    plannedDuration: 120,
    duration: 120,
    completed: false,
    type: 'study',
    source: 'calendar',
  };

  const sessions = buildStudySchedule([subject], [existingEvent]);
  const sameDaySessions = sessions.filter(session => session.startTime.toDateString() === existingStart.toDateString());

  sameDaySessions.forEach(session => {
    assert.ok(
      session.startTime.getTime() >= existingEnd.getTime(),
      'auto-generated session should start after existing booking'
    );
  });
});

test('scheduler staggers sessions across subjects without duplicate start times', () => {
  const subjectA: Subject = {
    id: 'sub-a',
    userId: 'user-1',
    name: 'Biologie',
    color: '#22C55E',
    startDate: daysFromBase(0),
    examDate: daysFromBase(21),
    hoursPerWeek: 5,
    daysPerWeek: 3,
    intensityWeeks: 1,
    completedHours: 0,
    targetHours: 25,
  };

  const subjectB: Subject = {
    id: 'sub-b',
    userId: 'user-1',
    name: 'Chemie',
    color: '#F59E0B',
    startDate: daysFromBase(0),
    examDate: daysFromBase(21),
    hoursPerWeek: 5,
    daysPerWeek: 3,
    intensityWeeks: 1,
    completedHours: 0,
    targetHours: 25,
  };

  const sessions = buildStudySchedule([subjectA, subjectB], []);
  const seenStarts = new Set<string>();

  sessions.forEach(session => {
    const key = session.startTime.toISOString();
    assert.ok(!seenStarts.has(key), 'sessions should not overlap with identical start times');
    seenStarts.add(key);
  });
});
