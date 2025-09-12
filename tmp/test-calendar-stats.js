const { chromium } = require('playwright');

async function testCalendarAndStats() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages to debug
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.text()}`);
  });
  
  try {
    console.log('🧪 Testing Calendar & Statistics Update After Session Completion\n');
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Step 1: Take screenshot of initial state
    console.log('1. Taking screenshot of initial calendar and stats...');
    await page.screenshot({ path: 'tmp/calendar-01-before-session.png' });
    
    // Check initial statistics
    const initialStats = await page.locator('[data-testid="sessions-count"], .text-green-600, .font-semibold').allTextContents();
    console.log('Initial stats visible:', initialStats);
    
    // Step 2: Start a session with a real subject (not Deep Work)
    console.log('2. Starting Mathematics session...');
    const startButton = await page.locator('button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(500);
    
    // Look for Mathematics subject instead of Deep Work
    const mathSubject = await page.locator('text=Mathematik, text=Mathe, text=Mathematics').first();
    const isMatheVisible = await mathSubject.isVisible().catch(() => false);
    
    if (isMatheVisible) {
      console.log('   Using Mathematics subject...');
      await mathSubject.click();
    } else {
      console.log('   Mathematics not found, using Deep Work...');
      const deepWorkButton = await page.locator('text=Deep Work').first();
      await deepWorkButton.click();
    }
    
    await page.waitForTimeout(300);
    const startSessionButton = await page.locator('button:has-text("Start Session")');
    await startSessionButton.click();
    
    // Step 3: Let timer run for 5 seconds
    console.log('3. Letting timer run for 5 seconds...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tmp/calendar-02-session-running.png' });
    
    // Step 4: Stop the session
    console.log('4. Stopping session...');
    const stopButton = await page.locator('button:has-text("Stop")').first();
    await stopButton.click();
    
    // Step 5: Wait for completion and take screenshot
    console.log('5. Waiting for session completion...');
    await page.waitForTimeout(4000); // Wait for completion and UI reset
    
    await page.screenshot({ path: 'tmp/calendar-03-after-completion.png' });
    
    // Step 6: Check if session appears on calendar
    console.log('6. Checking calendar for new session...');
    
    // Look for today's date with session markers
    const todaySessionMarkers = await page.locator('.bg-green-500, .bg-blue-500, [data-completed="true"]').count();
    console.log(`Found ${todaySessionMarkers} session markers on calendar`);
    
    // Check for completed session indicators
    const completedSessions = await page.locator('text=✓, .completed, [title*="completed"]').count();
    console.log(`Found ${completedSessions} completed session indicators`);
    
    // Step 7: Check statistics update
    console.log('7. Checking statistics update...');
    const finalStats = await page.locator('[data-testid="sessions-count"], .text-green-600, .font-semibold').allTextContents();
    console.log('Final stats visible:', finalStats);
    
    // Step 8: Navigate to statistics page if available
    const statsLink = await page.locator('text=Statistiken, a[href="/statistics"]').first();
    const hasStatsLink = await statsLink.isVisible().catch(() => false);
    
    if (hasStatsLink) {
      console.log('8. Navigating to statistics page...');
      await statsLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tmp/calendar-04-statistics-page.png' });
    }
    
    console.log('\n📊 Session Completion Analysis:');
    console.log(`   Calendar markers: ${todaySessionMarkers}`);
    console.log(`   Completed indicators: ${completedSessions}`);
    console.log(`   Initial stats: ${JSON.stringify(initialStats)}`);
    console.log(`   Final stats: ${JSON.stringify(finalStats)}`);
    
    if (todaySessionMarkers > 0 || completedSessions > 0) {
      console.log('✅ SUCCESS: Session appears to be documented on calendar');
    } else {
      console.log('❌ ISSUE: Session may not be appearing on calendar');
    }
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/calendar-error.png' });
  } finally {
    await browser.close();
  }
}

testCalendarAndStats();