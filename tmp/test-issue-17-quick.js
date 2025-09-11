const { chromium } = require('playwright');

async function quickWorkflowTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🧪 Quick Issue #17 Workflow Test...\n');
    
    // Navigate and test complete workflow
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Click Start button
    console.log('1. Clicking Start button...');
    const startButton = await page.locator('button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(1000);
    
    // Select Deep Work
    console.log('2. Selecting Deep Work...');
    const deepWorkOption = await page.locator('text=Deep Work').first();
    await deepWorkOption.click();
    await page.waitForTimeout(500);
    
    // Click Start Session
    console.log('3. Starting session...');
    const startSessionButton = await page.locator('button:has-text("Start Session")');
    await startSessionButton.click();
    await page.waitForTimeout(2000);
    
    // Check for active session elements
    const stopButton = await page.locator('button:has-text("Stop")').first();
    const timerDisplay = await page.locator('.font-mono').first();
    const subjectIndicator = await page.locator('text=Deep Work').first();
    
    console.log(`✅ Stop button visible: ${await stopButton.isVisible()}`);
    console.log(`✅ Timer display visible: ${await timerDisplay.isVisible()}`);
    console.log(`✅ Subject indicator visible: ${await subjectIndicator.isVisible()}`);
    
    if (await stopButton.isVisible()) {
      // Take screenshot of active session
      await page.screenshot({ path: 'tmp/issue17-working-session.png', fullPage: false });
      
      // Wait a bit then stop
      console.log('4. Waiting 3 seconds then stopping session...');
      await page.waitForTimeout(3000);
      
      await stopButton.click();
      await page.waitForTimeout(1000);
      
      // Check for session summary
      const summaryModal = await page.locator('text=Session Complete').first();
      console.log(`✅ Session summary visible: ${await summaryModal.isVisible()}`);
      
      if (await summaryModal.isVisible()) {
        await page.screenshot({ path: 'tmp/issue17-working-summary.png', fullPage: false });
        console.log('\n🎉 SUCCESS! Complete workflow working correctly!');
      }
    } else {
      console.log('❌ Session did not start properly');
      await page.screenshot({ path: 'tmp/issue17-debug.png', fullPage: false });
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/issue17-error-debug.png' });
  } finally {
    await browser.close();
  }
}

quickWorkflowTest();