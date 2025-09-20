// Subject type helpers with graceful fallback when migrations aren't applied yet.

export type SubjectType = 'academic' | 'administrative';

/**
 * Classify a subject row into a SubjectType.
 * When subject_type column is unavailable, falls back to name match.
 */
export function classifySubjectType(
  subject: { subject_type?: string | null; name?: string | null },
  hasTypeColumn: boolean
): SubjectType {
  if (hasTypeColumn) {
    const t = (subject.subject_type || 'academic').toLowerCase();
    return (t === 'administrative' ? 'administrative' : 'academic');
  }
  // Fallback: treat canonical admin name as administrative when column missing
  return normalize(subject.name) === 'termine & fristen' ? 'administrative' : 'academic';
}

/** Returns true when the subject is administrative (hidden from learning flows). */
export function isAdministrativeSubject(
  subject: { subject_type?: string | null; name?: string | null },
  hasTypeColumn: boolean
): boolean {
  return classifySubjectType(subject, hasTypeColumn) === 'administrative';
}

function normalize(s?: string | null) {
  return (s || '').trim().toLowerCase();
}

