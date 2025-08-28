#!/usr/bin/env tsx
// Database connection test script

import { healthCheck, query } from '../lib/db';

async function testDatabaseConnection(): Promise<void> {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection and health
    const health = await healthCheck();
    console.log('📊 Database Health Check:', health);
    
    if (health.status === 'healthy') {
      console.log('✅ Database connection successful!');
      
      // Test basic query
      const result = await query('SELECT version()');
      console.log('🐘 PostgreSQL Version:', result.rows[0].version);
      
      // Check if tables exist
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      console.log('\n📋 Existing tables:');
      if (tables.rows.length > 0) {
        tables.rows.forEach((row: any) => {
          console.log(`  - ${row.table_name}`);
        });
      } else {
        console.log('  No tables found. Run migrations first: npm run db:migrate');
      }
      
      // Check migrations table
      try {
        const migrations = await query('SELECT * FROM migrations ORDER BY id');
        console.log('\n🔄 Applied migrations:');
        if (migrations.rows.length > 0) {
          migrations.rows.forEach((migration: any) => {
            console.log(`  - ${migration.filename} (${migration.applied_at})`);
          });
        } else {
          console.log('  No migrations applied yet');
        }
      } catch (error) {
        console.log('\n🔄 Migrations table not found (this is normal if no migrations have been run yet)');
      }
      
    } else {
      console.error('❌ Database connection failed:', health.error);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();