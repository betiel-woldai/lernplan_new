import { CanonicalData, Diff, FieldChange, ModificationDelta } from './contracts';

export const diffEngine = {
  computeDiff(oldC: CanonicalData, newC: CanonicalData): Diff {
    const oldMap = new Map(oldC.entries.map(e => [e.source_key, e]));
    const newMap = new Map(newC.entries.map(e => [e.source_key, e]));

    const added = [] as any[];
    const removed = [] as any[];
    const modified: ModificationDelta[] = [];
    const unchanged = [] as any[];

    // Additions and modifications
    for (const [key, n] of newMap.entries()) {
      const o = oldMap.get(key);
      if (!o) {
        added.push(n);
        continue;
      }
      const changes = fieldChanges(o, n);
      if (changes.length) {
        modified.push({ source_key: key, changes, impact: classify(changes) });
      } else {
        unchanged.push(n);
      }
    }

    // Removals
    for (const [key, o] of oldMap.entries()) {
      if (!newMap.has(key)) removed.push(o);
    }

    return { added, removed, modified, unchanged } as Diff;
  },
};

function fieldChanges(a: any, b: any): FieldChange[] {
  const fields = ['title', 'category', 'details', 'date', 'date_from', 'date_to', 'status'] as const;
  const changes: FieldChange[] = [];
  for (const f of fields) {
    if ((a as any)[f] !== (b as any)[f]) {
      changes.push({ field: f, oldValue: (a as any)[f], newValue: (b as any)[f] });
    }
  }
  return changes;
}

function classify(changes: FieldChange[]) {
  // high if any high-impact field changed; else medium if title; else low
  const high = changes.some(c => c.field === 'date' || c.field === 'date_from' || c.field === 'date_to' || c.field === 'status');
  if (high) return 'high';
  const medium = changes.some(c => c.field === 'title');
  if (medium) return 'medium';
  return 'low';
}

