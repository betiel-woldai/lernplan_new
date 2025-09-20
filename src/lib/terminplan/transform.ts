// Transform new hierarchical academic calendar JSON into the legacy flat
// TerminplanEntry[] expected by the existing pipeline. Minimal and isolated.
//
// New format example:
// {
//   "academic_calendar": {
//     "sommersemester_2025": [
//       { "date": "2025-04-15 to 2025-05-04", "title": "Anmeldezeitraum …", "details": "…" },
//       { "date": "2025-03-17", "title": "Beginn des Sommersemesters" }
//     ]
//   }
// }
//
// This module flattens categories and splits range strings into date_from/date_to,
// leaving validation and TBD marking to the existing normalizeDates step.

import { TerminplanEntry } from './contracts';

export function transformAcademicCalendar(json: unknown): TerminplanEntry[] | null {
  if (!isAcademicCalendar(json)) return null; // not the new shape → caller can proceed as before

  const root = (json as any).academic_calendar as Record<string, any>;
  const out: TerminplanEntry[] = [];

  for (const [section, items] of Object.entries(root)) {
    if (!Array.isArray(items)) continue;
    for (const raw of items) {
      const title = (raw?.title || raw?.name || '').toString();
      const details = (raw?.details || raw?.description)?.toString();
      const rawDate = (raw?.date || '').toString().trim();

      let date: string | undefined;
      let date_from: string | undefined;
      let date_to: string | undefined;

      if (rawDate.includes(' to ')) {
        const [from, to] = rawDate.split(' to ');
        date_from = from?.trim();
        date_to = to?.trim();
      } else if (rawDate) {
        date = rawDate;
      }

      out.push({ title, details, category: section, date, date_from, date_to });
    }
  }

  return out;
}

function isAcademicCalendar(json: unknown): boolean {
  return !!json && typeof json === 'object' && json !== null && typeof (json as any).academic_calendar === 'object';
}

