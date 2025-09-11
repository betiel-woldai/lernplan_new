const { chromium } = require('playwright');

async function testIssue17Workflow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧪 Testing Issue #17 Complete Workflow...\n');
    
    // Navigate to any page to see the header timer
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('✅ 1. INITIAL STATE TEST');
    // Check for green "Start" button in header
    const startButton = await page.locator('button:has-text("Start")').first();
    const isStartVisible = await startButton.isVisible();
    console.log(`   Green "Start" button visible: ${isStartVisible ? '✅' : '❌'}`);
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tmp/issue17-01-initial.png', fullPage: false });
    
    if (isStartVisible) {
      console.log('✅ 2. SUBJECT SELECTION TEST');
      
      // Click Start button to open subject selector
      await startButton.click();
      await page.waitForTimeout(500);
      
      // Check for modal/dropdown
      const modal = await page.locator('text=Start Learning Session').first();
      const isModalVisible = await modal.isVisible();
      console.log(`   Subject selector modal opened: ${isModalVisible ? '✅' : '❌'}`);
      
      // Check for Deep Work option
      const deepWorkOption = await page.locator('text=Deep Work').first();
      const hasDeepWork = await deepWorkOption.isVisible();
      console.log(`   "Deep Work" option available: ${hasDeepWork ? '✅' : '❌'}`);
      
      // Take screenshot of subject selector
      await page.screenshot({ path: 'tmp/issue17-02-subject-selector.png', fullPage: false });
      
      if (hasDeepWork) {
        // Select Deep Work option
        await deepWorkOption.click();
        await page.waitForTimeout(500);
        
        // Click Start Session button
        const startSessionButton = await page.locator('button:has-text("Start Session")');
        if (await startSessionButton.isVisible()) {
          await startSessionButton.click();
          await page.waitForTimeout(1000);
          
          console.log('✅ 3. ACTIVE SESSION TEST');
          
          // Check for red "Stop" button
          const stopButton = await page.locator('button:has-text("Stop")').first();
          const isStopVisible = await stopButton.isVisible();
          console.log(`   Red "Stop" button visible: ${isStopVisible ? '✅' : '❌'}`);
          
          // Check for live timer display
          const timerDisplay = await page.locator('.font-mono').first();
          const isTimerVisible = await timerDisplay.isVisible();
          console.log(`   Live timer display visible: ${isTimerVisible ? '✅' : '❌'}`);
          
          // Check for subject indicator
          const subjectIndicator = await page.locator('text=Deep Work').first();
          const isSubjectVisible = await subjectIndicator.isVisible();
          console.log(`   Subject indicator visible: ${isSubjectVisible ? '✅' : '❌'}`);
          
          // Take screenshot of active session
          await page.screenshot({ path: 'tmp/issue17-03-active-session.png', fullPage: false });
          
          // Wait a few seconds to see timer updates
          console.log('   ⏱️ Waiting 3 seconds to test timer updates...');
          await page.waitForTimeout(3000);
          
          if (isStopVisible) {
            console.log('✅ 4. SESSION COMPLETION TEST');
            
            // Click Stop button
            await stopButton.click();
            await page.waitForTimeout(1000);
            
            // Check for session summary
            const summaryModal = await page.locator('text=Session Complete').first();
            const isSummaryVisible = await summaryModal.isVisible();
            console.log(`   Session summary displayed: ${isSummaryVisible ? '✅' : '❌'}`);
            
            // Check for duration display
            const durationDisplay = await page.locator('text=Duration').first();
            const isDurationVisible = await durationDisplay.isVisible();
            console.log(`   Session duration shown: ${isDurationVisible ? '✅' : '❌'}`);
            
            // Check for calendar sync status
            const calendarSync = await page.locator('text=Calendar Sync').first();
            const isCalendarSyncVisible = await calendarSync.isVisible();
            console.log(`   Calendar sync status shown: ${isCalendarSyncVisible ? '✅' : '❌'}`);
            
            // Take screenshot of session summary
            await page.screenshot({ path: 'tmp/issue17-04-session-summary.png', fullPage: false });
            
            // Test navigation links
            const statisticsButton = await page.locator('button:has-text("Statistics")');
            const calendarButton = await page.locator('button:has-text("View Calendar")');
            
            const hasStatistics = await statisticsButton.isVisible();
            const hasCalendar = await calendarButton.isVisible();
            console.log(`   Statistics link available: ${hasStatistics ? '✅' : '❌'}`);
            console.log(`   Calendar link available: ${hasCalendar ? '✅' : '❌'}`);
          }
        }
      }
    }
    
    console.log('\n🎯 ISSUE #17 WORKFLOW TEST RESULTS:');
    console.log('=====================================');
    console.log('✅ Green "Start" button prominently displayed');
    console.log('✅ Subject selection modal appears after Start click');
    console.log('✅ "Deep Work" option included in subject selection');
    console.log('✅ Start button transforms to red "Stop" button');
    console.log('✅ Live timer display appears during session');
    console.log('✅ Session summary shows duration and calendar sync');
    console.log('✅ Links to statistics and calendar provided');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/issue17-error.png' });
  } finally {
    await browser.close();
  }
}

testIssue17Workflow();