#!/usr/bin/env tsx
// Minimal, safe PostgreSQL database reset for local development
// Drops and recreates the DATABASE_NAME using credentials from .env.local

import './env';
import { Pool } from 'pg';

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

async function main() {
  const host = req('DATABASE_HOST');
  const port = parseInt(process.env.DATABASE_PORT || '5432', 10);
  const user = req('DATABASE_USER');
  const password = req('DATABASE_PASSWORD');
  const dbName = req('DATABASE_NAME');

  const pool = new Pool({ host, port, user, password, database: 'postgres' });

  console.log(`🧨 Resetting database "${dbName}" on ${host}:${port} ...`);

  try {
    // Ensure no active connections block DROP DATABASE
    await pool.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [dbName]
    );

    await pool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    await pool.query(`CREATE DATABASE "${dbName}"`);

    console.log('✅ Database reset complete.');
    console.log('➡️  Next: npm run db:migrate && npm run db:seed');
  } catch (err) {
    console.error('💥 Reset failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
