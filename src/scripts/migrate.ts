#!/usr/bin/env tsx
// Database migration script for Lernplaner PostgreSQL setup
import './env';

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { query, withTransaction } from '../lib/db';

interface Migration {
  id: number;
  filename: string;
  applied_at: Date;
}

// Create migrations tracking table
async function createMigrationsTable(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  await query(sql);
  console.log('✅ Migrations tracking table ready');
}

// Get applied migrations from database
async function getAppliedMigrations(): Promise<Migration[]> {
  const result = await query<Migration>('SELECT * FROM migrations ORDER BY id');
  return result.rows;
}

// Apply a single migration file
async function applyMigration(filename: string, migrationSql: string): Promise<void> {
  await withTransaction(async (client) => {
    // Execute the migration SQL
    await client.query(migrationSql);
    
    // Record the migration as applied
    await client.query(
      'INSERT INTO migrations (filename) VALUES ($1)',
      [filename]
    );
  });
}

// Main migration runner
async function runMigrations(): Promise<void> {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Ensure migrations table exists
    await createMigrationsTable();
    
    // Get migration files
    const migrationsDir = join(process.cwd(), 'db/migrations');
    const files = await readdir(migrationsDir).catch(() => {
      console.log('📁 No migrations directory found, creating...');
      return [];
    });
    
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ensure consistent ordering
    
    if (sqlFiles.length === 0) {
      console.log('📝 No migration files found');
      return;
    }
    
    // Get already applied migrations
    const applied = await getAppliedMigrations();
    const appliedNames = new Set(applied.map(m => m.filename));
    
    let appliedCount = 0;
    
    // Apply each migration
    for (const filename of sqlFiles) {
      if (appliedNames.has(filename)) {
        console.log(`⏭️  Skipping ${filename} (already applied)`);
        continue;
      }
      
      console.log(`📄 Applying ${filename}...`);
      
      const migrationPath = join(migrationsDir, filename);
      const migrationSql = await readFile(migrationPath, 'utf-8');
      
      try {
        await applyMigration(filename, migrationSql);
        console.log(`✅ Applied ${filename}`);
        appliedCount++;
      } catch (error) {
        console.error(`❌ Failed to apply ${filename}:`, error);
        throw error;
      }
    }
    
    if (appliedCount === 0) {
      console.log('✨ All migrations are up to date');
    } else {
      console.log(`🎉 Applied ${appliedCount} new migration(s)`);
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Rollback functionality (basic)
async function rollbackLastMigration(): Promise<void> {
  try {
    const migrations = await getAppliedMigrations();
    if (migrations.length === 0) {
      console.log('📝 No migrations to rollback');
      return;
    }
    
    const lastMigration = migrations[migrations.length - 1];
    console.log(`⏪ Rolling back: ${lastMigration.filename}`);
    
    // Remove from migrations table
    await query('DELETE FROM migrations WHERE filename = $1', [lastMigration.filename]);
    
    console.log(`✅ Rolled back ${lastMigration.filename}`);
    console.log('⚠️  Note: This only removes the migration record. Schema changes are NOT automatically reversed.');
    
  } catch (error) {
    console.error('💥 Rollback failed:', error);
    process.exit(1);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'rollback':
    rollbackLastMigration();
    break;
  case 'status':
    getAppliedMigrations().then(migrations => {
      console.log('📋 Applied migrations:');
      migrations.forEach(m => console.log(`  - ${m.filename} (${m.applied_at})`));
    });
    break;
  default:
    runMigrations();
    break;
}

// Export for use in other scripts
export { runMigrations, getAppliedMigrations };
