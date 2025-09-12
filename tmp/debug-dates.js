// Debug script to check exact dates in database
const sessions = [
  {"id":"fbe3c756-7662-4041-a209-1abccf3dee2f","date":"2025-09-12T22:00:00.000Z","duration":105,"completed":true},
  {"id":"824c6062-d430-49bb-8cb3-0336f6d47ea3","date":"2025-09-11T22:00:00.000Z","duration":90,"completed":false}
];

console.log('=== DATE ANALYSIS ===');

sessions.forEach((session, i) => {
  const dateStr = session.date;
  const dateObj = new Date(dateStr);
  
  console.log(`\nSession ${i+1}:`);
  console.log(`  Original: ${dateStr}`);
  console.log(`  Parsed Date: ${dateObj.toISOString()}`);
  console.log(`  Local Date: ${dateObj.toLocaleDateString('de-DE')}`);
  console.log(`  Date Only: ${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`);
  console.log(`  Duration: ${session.duration}min, Completed: ${session.completed}`);
  
  // What SQL DATE() function would return
  const sqlDate = dateObj.toISOString().split('T')[0];
  console.log(`  SQL DATE(): ${sqlDate}`);
});

console.log('\n=== EXPECTED BEHAVIOR ===');
console.log('Session fbe3c756... should appear on which date?');
const troubleSession = new Date("2025-09-12T22:00:00.000Z");
console.log(`- UTC Date: ${troubleSession.toISOString().split('T')[0]}`);
console.log(`- Local Date (assuming European time): ${troubleSession.toLocaleDateString('de-DE')}`);

// Check what today is
const today = new Date();
console.log(`\nToday is: ${today.toISOString().split('T')[0]} (${today.toLocaleDateString('de-DE')})`);