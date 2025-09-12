const playwright = require('playwright');

async function testCompleteSessionSync() {
  const browser = await playwright.chromium.launch({ 
    headless: false, 
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🧪 TESTING COMPLETE SESSION SYNCHRONIZATION');
    
    // 1. Navigate to dashboard
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('📊 Step 1: Checking initial state...');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tmp/sync-test-01-initial.png' });
    
    // Check current sessions count in overview
    const initialSessionsText = await page.locator('[data-testid="sessions-card"], .bg-gradient-to-br.from-green-50.to-green-100 >> text').first().textContent();
    console.log(`Initial sessions display: "${initialSessionsText}"`);
    
    // Check calendar for today
    const today = new Date();
    const todayElement = await page.locator(`.calendar-grid [data-date="${today.toISOString().split('T')[0]}"]`);
    const todaySessionsBefore = await todayElement.locator('.session-item').count();
    console.log(`Calendar sessions before: ${todaySessionsBefore}`);
    
    // 2. Start timer
    console.log('⏱️ Step 2: Starting timer...');
    
    const startButton = page.locator('text=Start').first();
    await startButton.click();
    
    // Select subject from modal
    await page.waitForSelector('.subject-selector', { timeout: 5000 });
    await page.screenshot({ path: 'tmp/sync-test-02-subject-modal.png' });
    
    // Choose Mathe
    await page.locator('text=Mathe').click();
    await page.locator('text=Start Session').click();
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tmp/sync-test-03-timer-active.png' });
    
    // Verify timer is running
    const timerText = await page.locator('.timer-display').textContent();
    console.log(`Timer showing: ${timerText}`);
    
    // 3. Wait a bit then stop timer
    console.log('⏹️ Step 3: Stopping timer after brief session...');
    await page.waitForTimeout(3000); // Wait 3 seconds for a short session
    
    const stopButton = page.locator('text=Stop').first();
    await stopButton.click();
    
    // 4. Check synchronization
    console.log('🔄 Step 4: Checking synchronization...');
    
    // Wait for any backend API calls to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot after completion
    await page.screenshot({ path: 'tmp/sync-test-04-after-completion.png' });
    
    // Check if sessions count updated
    const finalSessionsText = await page.locator('[data-testid="sessions-card"], .bg-gradient-to-br.from-green-50.to-green-100 >> text').first().textContent();
    console.log(`Final sessions display: "${finalSessionsText}"`);
    
    // Check calendar for new session
    await page.waitForTimeout(1000);
    const todaySessionsAfter = await todayElement.locator('.session-item').count();
    console.log(`Calendar sessions after: ${todaySessionsAfter}`);
    
    // 5. Results
    console.log('\n📋 SYNC TEST RESULTS:');
    console.log(`Sessions before: ${initialSessionsText}`);
    console.log(`Sessions after:  ${finalSessionsText}`);
    console.log(`Calendar before: ${todaySessionsBefore} sessions`);
    console.log(`Calendar after:  ${todaySessionsAfter} sessions`);
    
    if (todaySessionsAfter > todaySessionsBefore) {
      console.log('✅ SUCCESS: New session appeared in calendar');
    } else {
      console.log('❌ ISSUE: Session did not appear in calendar');
    }
    
    // Wait for manual inspection
    console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'tmp/sync-test-error.png' });
  } finally {
    await browser.close();
    console.log('🔚 Test completed');
  }
}

testCompleteSessionSync();