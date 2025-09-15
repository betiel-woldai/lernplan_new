#!/usr/bin/env node

/**
 * Verify Data Reset Script for Lernplaner
 *
 * This script verifies that all data has been successfully cleared
 * and shows current table counts
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

async function verifyDataReset() {
  const client = await pool.connect();

  try {
    console.log('🔍 Verifying data reset status...\n');

    // Tables to check
    const tables = [
      'users',
      'subjects',
      'learning_sessions',
      'calendar_sessions',
      'achievements',
      'user_achievements',
      'gamification_events'
    ];

    let totalRows = 0;
    let emptyTables = 0;

    console.log('📊 Table Status:');
    console.log('─'.repeat(40));

    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      totalRows += count;

      if (count === 0) {
        emptyTables++;
        console.log(`✅ ${table.padEnd(20)} - ${count} rows (EMPTY)`);
      } else {
        console.log(`⚠️  ${table.padEnd(20)} - ${count} rows (HAS DATA)`);
      }
    }

    console.log('─'.repeat(40));
    console.log(`📈 Summary: ${emptyTables}/${tables.length} tables are empty`);
    console.log(`📊 Total rows across all tables: ${totalRows}`);

    if (totalRows === 0) {
      console.log('\n🎉 SUCCESS: All data has been cleared!');
      console.log('✨ The application is now in a fresh, initial state');
    } else {
      console.log('\n⚠️  WARNING: Some data still exists in the database');
      console.log('💡 Consider running the clear-all-data script again');
    }

    // Check database structure integrity
    console.log('\n🔧 Database Structure Verification:');
    const structureCheck = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    const tableStructure = {};
    structureCheck.rows.forEach(row => {
      if (!tableStructure[row.table_name]) {
        tableStructure[row.table_name] = [];
      }
      tableStructure[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });

    console.log(`✅ Found ${Object.keys(tableStructure).length} tables with proper structure`);

    // Show table details
    for (const [tableName, columns] of Object.entries(tableStructure)) {
      console.log(`   📋 ${tableName}: ${columns.length} columns`);
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await verifyDataReset();
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { verifyDataReset };