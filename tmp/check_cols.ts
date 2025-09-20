#!/usr/bin/env tsx
// Quick schema column check for calendar_sessions and subjects
import '../src/scripts/env';
import { query } from '../src/lib/db';

async function colExists(table: string, column: string): Promise<boolean> {
  const res = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     ) AS exists`,
    [table, column]
  );
  return Boolean(res.rows[0]?.exists);
}

async function main() {
  const checks = [
    ['calendar_sessions', 'is_fixed'],
    ['calendar_sessions', 'fixed_source'],
    ['calendar_sessions', 'fixed_source_key'],
    ['calendar_sessions', 'is_all_day'],
    ['subjects', 'subject_type'],
  ] as const;

  const results: Record<string, boolean> = {};
  for (const [t, c] of checks) {
    results[`${t}.${c}`] = await colExists(t, c);
  }

  for (const key of Object.keys(results)) {
    console.log(`${key}: ${results[key] ? 'present' : 'missing'}`);
  }
}

main().catch((e) => { console.error('check failed', e); process.exit(1); });

