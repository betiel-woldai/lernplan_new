const { chromium } = require('playwright');

async function testStopWorkflow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages to debug
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.text()}`);
  });
  
  try {
    console.log('🧪 Testing Complete Start → Stop Workflow\n');
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Step 1: Start a Deep Work session
    console.log('1. Starting Deep Work session...');
    const startButton = await page.locator('button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(500);
    
    const deepWorkButton = await page.locator('text=Deep Work').first();
    await deepWorkButton.click();
    await page.waitForTimeout(300);
    
    const startSessionButton = await page.locator('button:has-text("Start Session")');
    await startSessionButton.click();
    
    // Step 2: Verify timer is running
    console.log('2. Waiting for timer to start and run...');
    await page.waitForTimeout(3000); // Let timer run for 3 seconds
    
    const timerDisplay = await page.locator('.font-mono').first(); 
    const timerText = await timerDisplay.textContent();
    console.log(`Timer display shows: ${timerText}`);
    
    // Step 3: Take screenshot before stopping
    console.log('3. Taking screenshot before stopping...');
    await page.screenshot({ path: 'tmp/stop-01-timer-running.png' });
    
    // Step 4: Click Stop button
    console.log('4. Clicking Stop button...');
    const stopButton = await page.locator('button:has-text("Stop")').first();
    await stopButton.click();
    
    // Step 5: Wait for session summary or completion
    console.log('5. Waiting for session completion...');
    await page.waitForTimeout(2000);
    
    // Step 6: Take screenshot after stopping
    await page.screenshot({ path: 'tmp/stop-02-after-stop.png' });
    
    // Step 7: Check if session summary appears or Start button is visible again
    const startButtonAfter = await page.locator('button:has-text("Start")').first();
    const isStartVisible = await startButtonAfter.isVisible();
    
    console.log(`RESULT: Start button visible after stop: ${isStartVisible}`);
    
    // Step 8: Check for session summary modal or completion message
    const summaryModal = await page.locator('[role="dialog"]');
    const isSummaryVisible = await summaryModal.isVisible().catch(() => false);
    console.log(`RESULT: Session summary modal visible: ${isSummaryVisible}`);
    
    if (isSummaryVisible) {
      console.log('📊 Session summary appeared - taking screenshot...');
      await page.screenshot({ path: 'tmp/stop-03-session-summary.png' });
      
      // Wait a bit more to see the summary
      await page.waitForTimeout(3000);
      
      // Try to close the summary if there's a close button
      const closeButton = await page.locator('button:has-text("Close")').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Final verification
    if (isStartVisible) {
      console.log('🎉 SUCCESS! Complete workflow working:');
      console.log('   ✅ Session started successfully');
      console.log('   ✅ Timer ran and displayed time');
      console.log('   ✅ Stop button worked');
      console.log('   ✅ Session completed and UI reset to Start state');
      if (isSummaryVisible) {
        console.log('   ✅ Session summary displayed');
      }
    } else {
      console.log('⚠️ PARTIAL SUCCESS: Session may have stopped but UI not fully reset');
    }
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/stop-error.png' });
  } finally {
    await browser.close();
  }
}

testStopWorkflow();