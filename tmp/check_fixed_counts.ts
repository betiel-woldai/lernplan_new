#!/usr/bin/env tsx
import '../src/scripts/env';
import { query } from '../src/lib/db';

async function main() {
  const total = await query<{ count: string }>(
    `SELECT COUNT(*)::int FROM calendar_sessions WHERE is_fixed = true AND fixed_source = 'terminplan'`
  );
  console.log('total_fixed_terminplan:', total.rows[0].count);

  const sample = await query<{ d: string; c: number }>(
    `SELECT (start_time AT TIME ZONE 'Europe/Berlin')::date as d, COUNT(*)::int as c
     FROM calendar_sessions
     WHERE is_fixed = true AND fixed_source='terminplan'
       AND (start_time AT TIME ZONE 'Europe/Berlin')::date BETWEEN '2025-04-15' AND '2025-05-04'
     GROUP BY 1 ORDER BY 1`
  );
  console.log('sample_range_counts:');
  for (const row of sample.rows) {
    console.log(`${row.d}: ${row.c}`);
  }
}

main().catch((e) => { console.error('check failed', e); process.exit(1); });

