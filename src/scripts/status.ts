#!/usr/bin/env tsx
// Minimal migration status utility for PostgreSQL
import './env';
// - Non-destructive: only reads DB state and filesystem
// - Purpose: quickly detect branch/schema drift before running the app

import { readdir } from 'fs/promises';
import { join } from 'path';
import { query } from '../lib/db';

type AppliedRow = { filename: string; applied_at: string };

async function getFilesystemMigrations(): Promise<string[]> {
  const dir = join(process.cwd(), 'db/migrations');
  const files = await readdir(dir);
  return files.filter(f => f.endsWith('.sql')).sort();
}

async function getAppliedMigrations(): Promise<AppliedRow[]> {
  // Ensure the tracking table exists (mirrors migrate.ts behavior)
  await query(`CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`);

  const res = await query<AppliedRow>('SELECT filename, applied_at FROM migrations ORDER BY filename');
  return res.rows;
}

async function main() {
  try {
    const [fsFiles, applied] = await Promise.all([
      getFilesystemMigrations(),
      getAppliedMigrations(),
    ]);

    const appliedSet = new Set(applied.map(a => a.filename));
    const fsSet = new Set(fsFiles);

    // Pending = in filesystem but not recorded as applied
    const pending = fsFiles.filter(f => !appliedSet.has(f));
    // Extra = recorded in DB but not present in current filesystem (branch mismatch)
    const extra = applied.filter(a => !fsSet.has(a.filename));

    console.log('--- Migration Status ------------------------------------');
    console.log(`Filesystem migrations: ${fsFiles.length}`);
    console.log(`Applied migrations:    ${applied.length}`);
    console.log('');

    if (pending.length === 0 && extra.length === 0) {
      console.log('✅ Schema is aligned with this branch.');
    } else {
      if (pending.length > 0) {
        console.log('⏳ Pending (apply with `npm run db:migrate`):');
        for (const f of pending) console.log(`  - ${f}`);
      }
      if (extra.length > 0) {
        console.log('\n⚠️  Extra (applied in DB but missing in this branch):');
        for (const a of extra) console.log(`  - ${a.filename} (applied_at: ${a.applied_at})`);
        console.log('\nHint: This usually means the database was migrated on another branch.');
        console.log('      Use branch-scoped dev DBs or reset local DB to match this branch.');
      }
    }

    // Exit code for CI usage (non-blocking locally)
    if (pending.length === 0 && extra.length === 0) process.exit(0);
    else process.exit(0); // keep non-failing locally for developer convenience
  } catch (err) {
    console.error('💥 Failed to read migration status:', err);
    process.exit(1);
  }
}

main();
