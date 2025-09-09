const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lernplaner',
  password: 'postgres',
  port: 5432,
});

const DEFAULT_USER_ID = '62d1b19b-3874-43b1-9424-ca7c2de10557';

async function testSessionUpdate() {
  try {
    console.log('🧪 Testing session update directly...');
    
    // Get the first incomplete session
    const sessions = await pool.query(
      'SELECT id, duration, completed, points FROM learning_sessions WHERE user_id = $1 AND completed = false LIMIT 1',
      [DEFAULT_USER_ID]
    );
    
    if (sessions.rows.length === 0) {
      console.log('❌ No incomplete sessions found');
      return;
    }
    
    const session = sessions.rows[0];
    console.log('📋 Found session:', session);
    
    // Test direct API call with fetch
    const response = await fetch('http://localhost:3000/api/sessions/' + session.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completed: true,
        duration: session.duration, // Keep existing duration
        points: Math.floor(session.duration * 2) // Calculate XP
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.log('❌ API Error:', errorData);
      console.log('📊 Response status:', response.status);
    } else {
      const result = await response.json();
      console.log('✅ Session updated successfully:', result);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await pool.end();
  }
}

testSessionUpdate();