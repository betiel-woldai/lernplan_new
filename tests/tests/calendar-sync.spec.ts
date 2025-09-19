import { test, expect } from '@playwright/test';
import { createHash } from 'crypto';

const formatDate = (date: Date) => date.toISOString();

const buildSubjectPayload = (examDate: Date) => ({
  name: 'Integration Mathe',
  color: '#2563EB',
  startDate: formatDate(new Date(examDate.getTime() - 21 * 24 * 60 * 60 * 1000)),
  examDate: formatDate(examDate),
  hoursPerWeek: 6,
  daysPerWeek: 3,
  intensityWeeks: 2,
  userId: '00000000-0000-0000-0000-000000000000',
  targetHours: 30,
});

test.describe('Calendar ↔ Subject exam date synchronisation', () => {
  test('updates subject exam date when calendar exam is moved', async ({ request }) => {
    const newExamDate = new Date(Date.UTC(2099, 5, 15, 8, 0, 0));
    const payload = buildSubjectPayload(newExamDate);

    const subjectResponse = await request.post('/api/subjects', {
      data: payload,
    });

    expect(subjectResponse.ok()).toBeTruthy();
    const createdSubject = await subjectResponse.json();
    expect(createdSubject.id).toBeTruthy();

    const examEventId = createHash('sha256')
      .update(`exam-${createdSubject.id}`)
      .digest('hex')
      .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

    const movedExamDate = new Date(newExamDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const updateResponse = await request.put(`/api/calendar/${examEventId}`, {
      data: {
        startTime: movedExamDate.toISOString(),
        endTime: new Date(movedExamDate.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        title: 'Integration Mathe Final Exam',
      },
    });

    expect(updateResponse.ok()).toBeTruthy();
    const updatePayload = await updateResponse.json();
    expect(updatePayload.subjectExamUpdate?.subjectId).toBe(createdSubject.id);
    expect(new Date(updatePayload.subjectExamUpdate.examDate).toISOString()).toBe(movedExamDate.toISOString());

    const subjectFetch = await request.get(`/api/subjects/${createdSubject.id}`);
    expect(subjectFetch.ok()).toBeTruthy();
    const subjectAfterUpdate = await subjectFetch.json();
    expect(new Date(subjectAfterUpdate.examDate).toISOString()).toBe(movedExamDate.toISOString());
  });
});
