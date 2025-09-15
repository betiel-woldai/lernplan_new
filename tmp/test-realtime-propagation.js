const { chromium } = require('playwright');

async function testRealTimePropagation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('⚡ Testing real-time event propagation across modules...');

    // Navigate to dashboard
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('📍 Dashboard loaded');

    // Capture initial state
    const initialSidebar = await page.textContent('.bg-blue-50'); // Today's stats
    console.log('📊 Initial sidebar stats captured');

    // Create another calendar session via API (without refreshing page)
    console.log('🔧 Creating second calendar session via API...');

    const sessionData = {
      userId: '62d1b19b-3874-43b1-9424-ca7c2de10557',
      subjectId: 'ae8f4c2d-1234-5678-90ab-cdef12345678', // Will use existing subject
      title: 'Real-Time Test Session #2',
      startTime: new Date('2025-09-15T16:00:00.000Z').toISOString(),
      endTime: new Date('2025-09-15T17:30:00.000Z').toISOString(),
      sessionType: 'study',
      description: 'Testing real-time propagation'
    };

    // Get subjects first
    const subjectsResponse = await fetch('http://localhost:3000/api/subjects?userId=62d1b19b-3874-43b1-9424-ca7c2de10557');
    const subjects = await subjectsResponse.json();
    if (subjects.length > 0) {
      sessionData.subjectId = subjects[0].id;
    }

    // Create session via API
    const createResponse = await fetch('http://localhost:3000/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });

    const newSession = await createResponse.json();
    console.log('✅ Second session created via API');

    // Wait for potential real-time events
    await page.waitForTimeout(2000);

    // Mark as completed via API
    const completeResponse = await fetch(`http://localhost:3000/api/calendar/${newSession.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '62d1b19b-3874-43b1-9424-ca7c2de10557',
        completed: true
      })
    });

    console.log('✅ Second session marked as completed');

    // Wait for real-time updates (NO PAGE REFRESH)
    console.log('⏱️  Waiting for real-time updates (no page refresh)...');
    await page.waitForTimeout(5000);

    // Check if sidebar updated without refresh
    const updatedSidebar = await page.textContent('.bg-blue-50');

    console.log('📊 Initial sidebar:', initialSidebar);
    console.log('📊 Updated sidebar:', updatedSidebar);

    if (updatedSidebar.includes('2h 30m') || updatedSidebar.includes('2 heute abgeschlossen')) {
      console.log('🎉 SUCCESS: Real-time propagation working! Sidebar updated without refresh.');

      // Test analytics page sync
      console.log('📈 Testing analytics page sync...');
      await page.click('a[href="/analytics"]');
      await page.waitForLoadState('networkidle');

      await page.screenshot({ path: 'tmp/analytics-realtime-test.png', fullPage: true });
      console.log('📸 Analytics page captured');

      const analyticsContent = await page.textContent('body');
      if (analyticsContent.includes('2.5') || analyticsContent.includes('150')) { // 2.5 hours or 150 minutes
        console.log('🎉 SUCCESS: Analytics also shows calendar session data!');
      } else {
        console.log('⚠️  Analytics may need refresh or has different timing');
      }

    } else {
      console.log('⚠️  Real-time propagation may not be working. Testing with refresh...');

      // Refresh and test
      await page.reload();
      await page.waitForLoadState('networkidle');

      const refreshedSidebar = await page.textContent('.bg-blue-50');
      console.log('📊 After refresh:', refreshedSidebar);

      if (refreshedSidebar.includes('2h 30m') || refreshedSidebar.includes('2 heute abgeschlossen')) {
        console.log('✅ Calendar-as-Master working, but real-time events need improvement');
      }
    }

    await page.screenshot({ path: 'tmp/final-realtime-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Error during real-time propagation test:', error);
    await page.screenshot({ path: 'tmp/realtime-error.png' });
  }

  await page.waitForTimeout(5000);
  await browser.close();
}

testRealTimePropagation();