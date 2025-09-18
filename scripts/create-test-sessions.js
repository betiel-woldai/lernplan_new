const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'lernplaner',
  password: 'postgres',
  port: 5432,
});

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || process.env.NEXT_PUBLIC_DEFAULT_USER_ID;

if (!DEFAULT_USER_ID) {
  throw new Error('DEFAULT_USER_ID or NEXT_PUBLIC_DEFAULT_USER_ID must be set before running create-test-sessions.');
}

async function createTestSessions() {
  try {
    console.log('🔍 Checking for existing subjects...');
    
    // First, get or create subjects
    const subjects = await pool.query(
      'SELECT id, name FROM subjects WHERE user_id = $1',
      [DEFAULT_USER_ID]
    );
    
    let subjectId;
    if (subjects.rows.length === 0) {
      console.log('📚 Creating test subject...');
      const result = await pool.query(
        `INSERT INTO subjects (id, user_id, name, color, target_hours, difficulty)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
         RETURNING id`,
        [DEFAULT_USER_ID, 'Mathematik', '#3B82F6', 20, 3]
      );
      subjectId = result.rows[0].id;
    } else {
      subjectId = subjects.rows[0].id;
      console.log(`✅ Using existing subject: ${subjects.rows[0].name}`);
    }
    
    console.log('📅 Creating test learning sessions...');
    
    // Create sessions for today and the next few days
    const today = new Date();
    const sessions = [];
    
    for (let i = 0; i < 5; i++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + i);
      
      const session = {
        userId: DEFAULT_USER_ID,
        subjectId: subjectId,
        date: sessionDate.toISOString().split('T')[0],
        duration: 45 + (i * 15), // 45, 60, 75, 90, 105 minutes
        completed: i < 2, // First 2 sessions completed, rest incomplete
        points: i < 2 ? Math.floor((45 + (i * 15)) * 2) : 0, // 2 XP per minute
        notes: `Test session ${i + 1} - ${i < 2 ? 'Completed' : 'Pending'}`
      };
      
      sessions.push(session);
    }
    
    // Insert sessions
    for (const session of sessions) {
      await pool.query(
        `INSERT INTO learning_sessions (
          id, user_id, subject_id, date, duration, completed, points, notes, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()
        )`,
        [
          session.userId,
          session.subjectId,
          session.date,
          session.duration,
          session.completed,
          session.points,
          session.notes
        ]
      );
      
      console.log(`✅ Created session: ${session.date} - ${session.duration}min - ${session.completed ? 'Completed' : 'Pending'}`);
    }
    
    console.log('🎉 Test sessions created successfully!');
    
    // Display summary
    const totalSessions = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed FROM learning_sessions WHERE user_id = $1',
      [DEFAULT_USER_ID]
    );
    
    console.log(`📊 Total sessions: ${totalSessions.rows[0].total}`);
    console.log(`✅ Completed sessions: ${totalSessions.rows[0].completed}`);
    console.log(`⏳ Pending sessions: ${totalSessions.rows[0].total - totalSessions.rows[0].completed}`);
    
  } catch (error) {
    console.error('❌ Error creating test sessions:', error);
  } finally {
    await pool.end();
  }
}

createTestSessions();
