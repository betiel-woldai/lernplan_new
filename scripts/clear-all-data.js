#!/usr/bin/env node

/**
 * Clear All Data Script for Lernplaner
 *
 * This script will completely reset the database by clearing all user data
 * while preserving the database structure (tables, indexes, etc.)
 *
 * WARNING: This action is irreversible and will delete ALL data!
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/"/g, '');
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Database configuration
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'lernplaner',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

async function clearAllData() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting data clearing process...');

    // Begin transaction to ensure atomicity
    await client.query('BEGIN');

    // Disable foreign key checks temporarily for faster deletion
    await client.query('SET session_replication_role = replica');

    // Clear data in dependency order (child tables first)
    const tablesToClear = [
      'user_achievements',
      'gamification_events',
      'learning_sessions',
      'calendar_sessions',
      'achievements',
      'subjects',
      'users'
    ];

    let totalRowsDeleted = 0;

    for (const table of tablesToClear) {
      console.log(`🗑️  Clearing table: ${table}`);

      // Get count before deletion
      const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const rowCount = parseInt(countResult.rows[0].count);

      if (rowCount > 0) {
        // Clear the table
        await client.query(`DELETE FROM ${table}`);
        console.log(`   ✅ Deleted ${rowCount} rows from ${table}`);
        totalRowsDeleted += rowCount;
      } else {
        console.log(`   ℹ️  Table ${table} was already empty`);
      }
    }

    // Reset sequences to start from 1 (for any SERIAL columns)
    console.log('🔄 Resetting sequences...');
    const sequenceResult = await client.query(`
      SELECT 'SELECT SETVAL(' || quote_literal(quote_ident(PGT.schemaname)||'.'||quote_ident(S.relname)) ||
             ', 1, false);' as reset_query
      FROM pg_class AS S, pg_depend AS D, pg_class AS T, pg_attribute AS C, pg_tables AS PGT
      WHERE S.relkind = 'S'
        AND T.relkind = 'r'
        AND D.refobjid = T.oid
        AND D.objid = S.oid
        AND D.refobjsubid = C.attnum
        AND C.attrelid = T.oid
        AND T.relname = PGT.tablename
        AND PGT.schemaname = 'public'
    `);

    for (const row of sequenceResult.rows) {
      await client.query(row.reset_query);
    }

    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT');

    // Commit transaction
    await client.query('COMMIT');

    // Vacuum the database to reclaim space (outside of transaction)
    console.log('🧹 Vacuuming database...');
    await client.query('VACUUM ANALYZE');

    console.log('\n✅ Data clearing completed successfully!');
    console.log(`📊 Total rows deleted: ${totalRowsDeleted}`);
    console.log('📋 Database structure preserved');
    console.log('🎯 Application is now reset to initial state');

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error during data clearing:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function confirmAction() {
  // Simple confirmation for safety
  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('   This includes:');
  console.log('   - All users and their profiles');
  console.log('   - All subjects and learning plans');
  console.log('   - All learning sessions and progress');
  console.log('   - All calendar events');
  console.log('   - All achievements and gamification data');
  console.log('');

  const args = process.argv.slice(2);
  const forceFlag = args.includes('--force') || args.includes('-f');

  if (!forceFlag) {
    console.log('💡 To proceed, run this script with --force flag:');
    console.log('   node scripts/clear-all-data.js --force');
    process.exit(0);
  }

  return true;
}

async function main() {
  try {
    await confirmAction();
    await clearAllData();
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { clearAllData };