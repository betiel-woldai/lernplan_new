#!/usr/bin/env tsx
import '../src/scripts/env';
import { query } from '../src/lib/db';

async function countByTitle(title: string, from: string, to: string) {
  const res = await query<{ count: string }>(
    `SELECT COUNT(*)::int FROM calendar_sessions
     WHERE is_fixed = true AND fixed_source = 'terminplan'
       AND title = $1
       AND (start_time AT TIME ZONE 'Europe/Berlin')::date BETWEEN $2::date AND $3::date`,
    [title, from, to]
  );
  return res.rows[0].count;
}

async function main() {
  const t1 = await countByTitle('Anmeldezeitraum für Prüfungsleistungen', '2025-04-15', '2025-05-04');
  console.log('Anmeldezeitraum 2025-04-15..2025-05-04:', t1);

  const t2 = await countByTitle('Blockwoche', '2025-06-02', '2025-06-05');
  console.log('Blockwoche 2025-06-02..2025-06-05:', t2);

  const t3 = await countByTitle('Prüfungszeitraum', '2025-06-30', '2025-07-25');
  console.log('Prüfungszeitraum 2025-06-30..2025-07-25:', t3);
}

main().catch((e) => { console.error('range coverage failed', e); process.exit(1); });

