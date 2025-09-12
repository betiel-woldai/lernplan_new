const { chromium } = require('playwright');

async function testFinalDatabaseWorkflow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages to debug
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.text()}`);
  });
  
  try {
    console.log('🧪 Testing Complete Database Workflow - Calendar & Statistics Integration\n');
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Step 1: Take screenshot of initial state - check XP
    console.log('1. Recording initial XP and session count...');
    await page.screenshot({ path: 'tmp/final-db-01-before.png' });
    
    const initialXP = await page.locator('[title*="XP"], text=/\\d+ XP/, .text-blue-600').first().textContent();
    console.log(`   Initial XP: ${initialXP}`);
    
    // Step 2: Start Deep Work session
    console.log('2. Starting Deep Work session...');
    const startButton = await page.locator('button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(500);
    
    // Click Deep Work - use better selector
    await page.locator('[data-testid="subject-option"], button:has(.truncate:has-text("Deep Work"))').first().click();
    await page.waitForTimeout(300);
    
    // Start session
    const startSessionButton = await page.locator('button:has-text("Start Session")');
    await startSessionButton.click();
    
    // Step 3: Verify timer is running with proper subject
    console.log('3. Verifying timer is running...');
    await page.waitForTimeout(2000); // Let it run 2 seconds
    
    const timerDisplay = await page.locator('.font-mono').first();
    const timerText = await timerDisplay.textContent();
    console.log(`   Timer shows: ${timerText}`);
    
    const subjectLabel = await page.locator('text=Deep Work').first();
    const isDeepWorkVisible = await subjectLabel.isVisible();
    console.log(`   Deep Work subject visible: ${isDeepWorkVisible}`);
    
    await page.screenshot({ path: 'tmp/final-db-02-timer-running.png' });
    
    // Step 4: Stop the session
    console.log('4. Stopping session...');
    const stopButton = await page.locator('button:has-text("Stop")').first();
    await stopButton.click();
    
    // Step 5: Wait for session to complete and database save
    console.log('5. Waiting for session completion and database save...');
    await page.waitForTimeout(5000); // Wait for completion and stats update
    
    await page.screenshot({ path: 'tmp/final-db-03-after-completion.png' });
    
    // Step 6: Check for XP update
    console.log('6. Checking XP and statistics update...');
    const finalXP = await page.locator('[title*="XP"], text=/\\d+ XP/, .text-blue-600').first().textContent();
    console.log(`   Final XP: ${finalXP}`);
    
    // Step 7: Reload page to ensure database persistence
    console.log('7. Reloading page to verify database persistence...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tmp/final-db-04-after-reload.png' });
    
    // Check if session appears on calendar
    const calendarSessions = await page.locator('[data-testid="session"], .bg-green-500, .bg-blue-500').count();
    console.log(`   Calendar sessions found: ${calendarSessions}`);
    
    // Final verification
    console.log('\n📊 Final Database Integration Test Results:');
    console.log(`   ✅ Timer started and ran: ${timerText !== null}`);
    console.log(`   ✅ Deep Work subject visible: ${isDeepWorkVisible}`);
    console.log(`   ✅ Initial XP: ${initialXP}`);
    console.log(`   ✅ Final XP: ${finalXP}`);
    console.log(`   ✅ XP increased: ${initialXP !== finalXP}`);
    console.log(`   ✅ Calendar sessions: ${calendarSessions}`);
    
    if (initialXP !== finalXP && calendarSessions > 0) {
      console.log('🎉 SUCCESS! Database integration working perfectly!');
    } else {
      console.log('⚠️ Possible issues with database integration');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/final-db-error.png' });
  } finally {
    await browser.close();
  }
}

testFinalDatabaseWorkflow();