const { chromium } = require('playwright');

async function createCalendarSession() {
  const sessionData = {
    userId: '62d1b19b-3874-43b1-9424-ca7c2de10557',
    subjectId: '1a2b3c4d-5e6f-7890-abcd-ef1234567890', // Will need to get a real subject ID
    title: 'Test Real-Time Sync Session',
    startTime: new Date('2025-09-15T14:00:00.000Z').toISOString(),
    endTime: new Date('2025-09-15T15:00:00.000Z').toISOString(),
    sessionType: 'study',
    description: 'Testing calendar-to-sidebar real-time sync'
  };

  const response = await fetch('http://localhost:3000/api/calendar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData)
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('✅ Calendar session created:', result);
  return result;
}

async function completeCalendarSession(sessionId) {
  const response = await fetch(`http://localhost:3000/api/calendar/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: '62d1b19b-3874-43b1-9424-ca7c2de10557',
      completed: true
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to complete session: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('✅ Calendar session marked as completed:', result);
  return result;
}

async function testRealTimeSync() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing Calendar-as-Master real-time sync via API...');

    // First, get subjects to use a real subject ID
    const subjectsResponse = await fetch('http://localhost:3000/api/subjects?userId=62d1b19b-3874-43b1-9424-ca7c2de10557');
    const subjects = await subjectsResponse.json();
    const subjectId = subjects.length > 0 ? subjects[0].id : null;

    if (!subjectId) {
      console.log('❌ No subjects found. Creating a subject first...');
      const subjectResponse = await fetch('http://localhost:3000/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '62d1b19b-3874-43b1-9424-ca7c2de10557',
          name: 'Test Subject',
          color: '#3B82F6',
          startDate: '2025-09-01',
          hoursPerWeek: 10,
          daysPerWeek: 5,
          targetHours: 50
        })
      });
      const newSubject = await subjectResponse.json();
      subjectId = newSubject.id;
      console.log('✅ Test subject created');
    }

    // Navigate to dashboard and take initial screenshot
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tmp/initial-sidebar-state.png' });

    // Get initial sidebar content
    const initialSidebarText = await page.textContent('body');
    console.log('📊 Initial sidebar content captured');

    // Create calendar session via API
    const sessionData = {
      userId: '62d1b19b-3874-43b1-9424-ca7c2de10557',
      subjectId: subjectId,
      title: 'Test Real-Time Sync Session',
      startTime: new Date('2025-09-15T14:00:00.000Z').toISOString(),
      endTime: new Date('2025-09-15T15:00:00.000Z').toISOString(),
      sessionType: 'study',
      description: 'Testing calendar-to-sidebar real-time sync'
    };

    const createResponse = await fetch('http://localhost:3000/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create session: ${createResponse.status}`);
    }

    const session = await createResponse.json();
    console.log('✅ Calendar session created via API');

    // Wait a moment for potential real-time updates
    await page.waitForTimeout(2000);

    // Mark session as completed via API
    const completeResponse = await fetch(`http://localhost:3000/api/calendar/${session.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '62d1b19b-3874-43b1-9424-ca7c2de10557',
        completed: true
      })
    });

    if (!completeResponse.ok) {
      throw new Error(`Failed to complete session: ${completeResponse.status}`);
    }

    console.log('✅ Session marked as completed via API');

    // Wait for real-time updates
    await page.waitForTimeout(3000);

    // Refresh the page to see if data updates (testing without real-time first)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take final screenshot
    await page.screenshot({ path: 'tmp/final-sidebar-state.png', fullPage: true });

    // Get final sidebar content
    const finalSidebarText = await page.textContent('body');

    // Check if sidebar now shows the completed session
    if (finalSidebarText.includes('1h 0m') || finalSidebarText.includes('1 heute abgeschlossen')) {
      console.log('🎉 SUCCESS: Calendar-as-Master working! Sidebar shows completed session.');
    } else {
      console.log('⚠️  Sidebar may still be showing old data. Checking APIs...');

      // Test the APIs directly
      const sessionStatsResponse = await fetch('http://localhost:3000/api/session-stats');
      const sessionStats = await sessionStatsResponse.json();
      console.log('📊 Session stats API response:', sessionStats);

      const dateStatsResponse = await fetch('http://localhost:3000/api/date-specific-stats?date=2025-09-15');
      const dateStats = await dateStatsResponse.json();
      console.log('📅 Date-specific stats API response:', dateStats);
    }

  } catch (error) {
    console.error('❌ Error during API sync test:', error);
    await page.screenshot({ path: 'tmp/api-test-error.png' });
  }

  await page.waitForTimeout(5000); // Keep browser open to see results
  await browser.close();
}

testRealTimeSync();