// Minimal contracts for terminplan sync (keep lean)

export type Impact = 'low' | 'medium' | 'high';

export interface TerminplanEntry {
  id?: string; // official id if present
  title: string;
  category?: string;
  details?: string;
  date?: string; // single date (Berlin)
  date_from?: string; // range start (Berlin)
  date_to?: string; // range end (Berlin)
  status?: 'active' | 'canceled' | 'tbd';
}

export interface CanonicalData {
  entries: (TerminplanEntry & { source_key: string })[];
}

export interface FieldChange {
  field: keyof TerminplanEntry;
  oldValue: unknown;
  newValue: unknown;
}

export interface ModificationDelta {
  source_key: string;
  changes: FieldChange[];
  impact: Impact;
}

export interface Diff {
  added: CanonicalData['entries'];
  removed: CanonicalData['entries'];
  modified: ModificationDelta[];
  unchanged: CanonicalData['entries'];
}

export const FIELD_IMPACT_MAP: Record<string, Impact> = {
  date: 'high',
  date_from: 'high',
  date_to: 'high',
  title: 'medium',
  details: 'low',
  status: 'high',
};

export const TerminplanSchema = {
  // NOTE: keep validation light here to avoid deps; do strict validation at API
  validate(json: unknown): json is TerminplanEntry[] {
    return Array.isArray(json);
  },
  generateSourceKey(entry: TerminplanEntry): string {
    const base = entry.id?.trim() || `${(entry.title || '').trim()}|${(entry.category || '').trim()}|${(entry.date || `${entry.date_from}-${entry.date_to}`)}`;
    return stableHash(base);
  },
  classifyImpact(change: FieldChange): Impact {
    return FIELD_IMPACT_MAP[change.field as string] || 'low';
  },
};

// Tiny stable hash (non-crypto) to avoid pulling deps here
function stableHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(36);
}

