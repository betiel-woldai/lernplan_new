const { query } = require('../src/lib/db');

async function debugSessionMismatch() {
  const defaultUserId = '62d1b19b-3874-43b1-9424-ca7c2de10557';
  
  console.log('=== DEBUG SESSION MISMATCH ===\n');
  
  try {
    // 1. Check all sessions for today
    const todaySessions = await query(`
      SELECT 
        ls.id,
        ls.date,
        ls.duration,
        ls.completed,
        ls.notes,
        s.name as subject_name,
        s.color as subject_color,
        ls.created_at
      FROM learning_sessions ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ls.user_id = $1 
        AND ls.date = CURRENT_DATE
      ORDER BY ls.created_at ASC
    `, [defaultUserId]);
    
    console.log('📊 TODAY\'S SESSIONS IN DATABASE:');
    console.log(`Found ${todaySessions.rows.length} sessions:`);
    todaySessions.rows.forEach((session, i) => {
      console.log(`${i+1}. ${session.subject_name} - ${session.duration}min - ${session.completed ? 'Completed' : 'Pending'} - ${session.created_at}`);
      console.log(`   ID: ${session.id}, Notes: "${session.notes || 'none'}"`);
    });
    
    // 2. Check what calendar API would return
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    const calendarSessions = await query(`
      SELECT 
        ls.id,
        s.name as title,
        (ls.date::date + TIME '09:00:00') as "startTime",
        (ls.date::date + TIME '09:00:00' + INTERVAL '1 minute' * ls.duration) as "endTime",
        ls.duration,
        'study' as "sessionType",
        ls.completed,
        ls.notes as description,
        s.id as "subjectId",
        s.name as "subjectName",
        s.color as "subjectColor"
      FROM learning_sessions ls
      JOIN subjects s ON ls.subject_id = s.id
      WHERE ls.user_id = $1 AND EXTRACT(MONTH FROM ls.date) = $2 AND EXTRACT(YEAR FROM ls.date) = $3
      ORDER BY ls.date ASC, s.name ASC
    `, [defaultUserId, month, year]);
    
    console.log('\n📅 CALENDAR API WOULD RETURN:');
    console.log(`Found ${calendarSessions.rows.length} sessions:`);
    calendarSessions.rows.forEach((session, i) => {
      console.log(`${i+1}. ${session.subjectName} - ${session.duration}min - ${session.completed ? 'Completed' : 'Pending'}`);
      console.log(`   Start: ${session.startTime}, End: ${session.endTime}`);
    });
    
    // 3. Check session stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE completed = true) as completed_sessions,
        COUNT(*) FILTER (WHERE completed = false) as pending_sessions,
        COUNT(*) FILTER (WHERE date = CURRENT_DATE) as today_sessions,
        COUNT(*) FILTER (WHERE date = CURRENT_DATE AND completed = true) as today_completed,
        SUM(duration) FILTER (WHERE date = CURRENT_DATE) as today_minutes
      FROM learning_sessions 
      WHERE user_id = $1
    `, [defaultUserId]);
    
    const stats = statsResult.rows[0];
    console.log('\n📈 SESSION STATISTICS:');
    console.log(`Total sessions: ${stats.total_sessions}`);
    console.log(`Completed sessions: ${stats.completed_sessions}`);
    console.log(`Pending sessions: ${stats.pending_sessions}`);
    console.log(`Today sessions: ${stats.today_sessions}`);
    console.log(`Today completed: ${stats.today_completed}`);
    console.log(`Today total minutes: ${stats.today_minutes || 0}`);
    
    console.log('\n=== ANALYSIS ===');
    if (todaySessions.rows.length !== parseInt(stats.today_sessions)) {
      console.log(`❌ MISMATCH: Direct query shows ${todaySessions.rows.length} sessions, stats show ${stats.today_sessions}`);
    }
    if (calendarSessions.rows.length !== todaySessions.rows.length) {
      console.log(`❌ MISMATCH: Calendar would show ${calendarSessions.rows.length}, but database has ${todaySessions.rows.length}`);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugSessionMismatch();