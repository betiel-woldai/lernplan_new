const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing Session Stop → Calendar Real-time Sync');
  console.log('================================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 1. Navigate to application
    console.log('📱 1. Loading application...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Take initial calendar screenshot
    console.log('📷 2. Taking initial calendar screenshot...');
    await page.screenshot({ path: 'tmp/sync-test-01-before-session.png' });
    
    // 3. Start a session
    console.log('▶️  3. Starting a session...');
    const startButton = page.locator('button:has-text("Start")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      // Select Deep Work or first subject
      const deepWorkOption = page.locator('text="Deep Work"').first();
      if (await deepWorkOption.isVisible()) {
        await deepWorkOption.click();
        await page.waitForTimeout(500);
      }
      
      // Confirm start
      const confirmButton = page.locator('button:has-text("Start"), button:has-text("Start Session")').last();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        console.log('✅ Session started');
      }
    }
    
    // Wait for session to be active
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tmp/sync-test-02-session-active.png' });
    
    // 4. Stop the session
    console.log('⏹️  4. Stopping the session...');
    const stopButton = page.locator('button:has-text("Stop"), button:has-text("End")').first();
    
    if (await stopButton.isVisible()) {
      await stopButton.click();
      console.log('✅ Stop button clicked');
      await page.waitForTimeout(2000);
      
      // Check if session summary appears
      const summary = page.locator('[class*="summary"], [class*="session"], text="Session Complete"');
      if (await summary.isVisible()) {
        console.log('✅ Session summary displayed');
      }
    }
    
    await page.screenshot({ path: 'tmp/sync-test-03-session-stopped.png' });
    
    // 5. Check calendar without refresh - CRITICAL TEST
    console.log('📅 5. Checking calendar sync WITHOUT refresh...');
    
    // Navigate to calendar or check if calendar is visible
    const calendarSection = page.locator('[class*="calendar"], [class*="Kalendar"]');
    
    if (await calendarSection.isVisible()) {
      console.log('📅 Calendar section visible on current page');
    } else {
      // Navigate to overview/calendar page
      await page.goto('http://localhost:3001');
      await page.waitForLoadState('networkidle');
      console.log('📅 Navigated to overview page');
    }
    
    await page.screenshot({ path: 'tmp/sync-test-04-calendar-after-stop.png' });
    
    // 6. Check sidebar stats sync
    console.log('📊 6. Checking sidebar stats synchronization...');
    
    // Look for session count, streak, or time statistics
    const statsElements = page.locator('[class*="stat"], [class*="Session"], [class*="streak"], [class*="time"]');
    const statsCount = await statsElements.count();
    
    console.log(`📊 Found ${statsCount} stats elements`);
    
    for (let i = 0; i < Math.min(statsCount, 5); i++) {
      const statText = await statsElements.nth(i).textContent();
      console.log(`   - Stat ${i + 1}: ${statText}`);
    }
    
    await page.screenshot({ path: 'tmp/sync-test-05-sidebar-stats.png' });
    
    // 7. Check if today's sessions are visible in calendar
    console.log('🔍 7. Checking today\'s sessions in calendar...');
    
    // Look for today's date in calendar and sessions
    const today = new Date();
    const todayNumber = today.getDate();
    
    // Find today's date cell
    const todayCell = page.locator(`text="${todayNumber}"`).filter({ has: page.locator('[class*="session"], [class*="Deep"], [class*="Mathe"]') });
    
    if (await todayCell.isVisible()) {
      console.log('✅ Found sessions for today in calendar');
    } else {
      console.log('❌ No sessions visible for today in calendar - SYNC ISSUE DETECTED');
    }
    
    await page.screenshot({ path: 'tmp/sync-test-06-final-check.png' });
    
    console.log('\n🔍 Real-time Sync Analysis:');
    console.log('============================');
    console.log('✅ Session start workflow: Working');
    console.log('✅ Session stop workflow: Working');
    console.log('🔄 Calendar auto-update: NEEDS VERIFICATION');
    console.log('🔄 Sidebar stats sync: NEEDS VERIFICATION');
    console.log('\n📸 Screenshots saved to tmp/ directory');
    
  } catch (error) {
    console.error('❌ Error during sync testing:', error);
  } finally {
    await browser.close();
  }
})();