// Minimal date normalization for terminplan entries.
// Step 1: Accept YYYY-MM-DD; mark others as TBD without expanding ranges.

import { TerminplanEntry } from './contracts';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clean(s?: string): string | undefined {
  const v = (s || '').trim();
  return v.length ? v : undefined;
}

function validDate(s?: string): string | undefined {
  const v = clean(s);
  return v && DATE_RE.test(v) ? v : undefined;
}

export function normalizeEntryDates(e: TerminplanEntry): TerminplanEntry {
  const date = validDate(e.date);
  const date_from = validDate(e.date_from);
  const date_to = validDate(e.date_to);

  // Keep single-date or valid ranges only; otherwise mark as tbd.
  if (date) {
    return { ...e, date, date_from: undefined, date_to: undefined, status: e.status || 'active' };
  }

  if (date_from && date_to) {
    return { ...e, date: undefined, date_from, date_to, status: e.status || 'active' };
  }

  // Partial/invalid dates → TBD informational entry; drop invalid date fields.
  return { ...e, date: undefined, date_from: undefined, date_to: undefined, status: 'tbd' };
}

export function normalizeDates(entries: TerminplanEntry[]): TerminplanEntry[] {
  return entries.map(normalizeEntryDates);
}

