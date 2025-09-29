// Canonicalizer: normalize data and compute checksum (Berlin -> UTC handled upstream)
import { CanonicalData, TerminplanEntry } from './contracts';

export interface Canonicalizer {
  normalize(entries: TerminplanEntry[]): CanonicalData;
  checksum(canonical: CanonicalData): string;
}

export const canonicalizer: Canonicalizer = {
  normalize(entries) {
    const norm = entries.map(e => ({
      ...normalizeEntry(e),
    }));
    // stable sort by source key then title
    const sorted = norm
      .map(e => ({ ...e, source_key: e.source_key }))
      .sort((a, b) => (a.source_key < b.source_key ? -1 : a.source_key > b.source_key ? 1 : 0));
    return { entries: sorted };
  },
  checksum(c) {
    // cheap deterministic checksum without external deps
    const payload = JSON.stringify(c.entries);
    return djb2(payload);
  },
};

function normalizeEntry(e: TerminplanEntry & { source_key?: string }) {
  const trim = (s?: string) => (s ?? '').trim();
  const clean = (s?: string) => trim(s).replace(/\s+/g, ' ');
  const normalized: TerminplanEntry = {
    id: trim(e.id),
    title: clean(e.title),
    category: clean(e.category),
    details: clean(e.details),
    popupMessage: clean((e as any).popupMessage),
    date: trim(e.date),
    date_from: trim(e.date_from),
    date_to: trim(e.date_to),
    status: e.status || (e.date ? 'active' : 'tbd'),
  };
  const source_key = (e as any).source_key || `${normalized.id || ''}|${normalized.title}|${normalized.category}|${normalized.date || `${normalized.date_from}-${normalized.date_to}`}`;
  return { ...normalized, source_key } as TerminplanEntry & { source_key: string };
}

function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
