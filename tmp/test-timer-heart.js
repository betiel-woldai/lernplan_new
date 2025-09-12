const { chromium } = require('playwright');

async function testTimerHeart() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages to debug
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.text()}`);
  });
  
  try {
    console.log('🧪 Testing Timer Heart - Core Functionality\n');
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Step 1: Click Start
    console.log('1. Clicking Start button...');
    await page.screenshot({ path: 'tmp/heart-01-before-start.png' });
    const startButton = await page.locator('button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(1000);
    
    // Step 2: Take screenshot of modal
    console.log('2. Taking screenshot of subject selector...');
    await page.screenshot({ path: 'tmp/heart-02-subject-modal.png' });
    
    // Step 3: Select Deep Work
    console.log('3. Selecting Deep Work...');
    const deepWorkButton = await page.locator('text=Deep Work').first();
    await deepWorkButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tmp/heart-03-deep-work-selected.png' });
    
    // Step 4: Click Start Session
    console.log('4. Clicking Start Session...');
    const startSessionButton = await page.locator('button:has-text("Start Session")');
    await startSessionButton.click();
    
    // Step 5: Wait and check what happened
    console.log('5. Waiting 3 seconds to see what happens...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tmp/heart-04-after-start.png' });
    
    // Step 6: Check elements
    const stopButton = await page.locator('button:has-text("Stop")').first();
    const timerDisplay = await page.locator('.font-mono').first(); 
    
    console.log(`RESULT: Stop button visible: ${await stopButton.isVisible()}`);
    console.log(`RESULT: Timer display visible: ${await timerDisplay.isVisible()}`);
    
    if (await stopButton.isVisible()) {
      console.log('🎉 SUCCESS! Timer heart is beating!');
    } else {
      console.log('💔 FAILED: Timer heart is not beating');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/heart-error.png' });
  } finally {
    await browser.close();
  }
}

testTimerHeart();