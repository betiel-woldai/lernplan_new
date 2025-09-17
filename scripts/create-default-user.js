const { Pool } = require('pg');

// Database connection using environment variables
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'lernplaner',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

async function createDefaultUser() {
  const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [defaultUserId]);

    if (existingUser.rows.length > 0) {
      console.log('✅ Default user already exists');
      return;
    }

    // Create the default user
    const result = await pool.query(`
      INSERT INTO users (id, name, email, current_level, current_xp, next_level_xp, learning_streak)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email
    `, [
      defaultUserId,
      'Default User',
      'user@lernplaner.dev',
      1,
      0,
      100,
      0
    ]);

    console.log('✅ Default user created successfully:', result.rows[0]);

    // Also create the Deep Work subject for this user
    const deepWorkId = 'd34ab45d-0be7-4b98-af9f-a277c591423c';
    const deepWorkExists = await pool.query('SELECT id FROM subjects WHERE id = $1', [deepWorkId]);

    if (deepWorkExists.rows.length === 0) {
      await pool.query(`
        INSERT INTO subjects (id, user_id, name, color, start_date, hours_per_week, days_per_week, intensity_weeks, target_hours)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        deepWorkId,
        defaultUserId,
        'Deep Work',
        '#8B5CF6',
        new Date().toISOString().split('T')[0], // Today
        10, // 10 hours per week
        5,  // 5 days per week
        12, // 12 weeks
        120 // 120 hours total
      ]);
      console.log('✅ Deep Work subject created');
    }

  } catch (error) {
    console.error('❌ Error creating default user:', error);
  } finally {
    await pool.end();
  }
}

createDefaultUser();