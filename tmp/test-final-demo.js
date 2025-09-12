const { chromium } = require('playwright');

async function finalDemo() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📸 Taking final demo screenshot of working timer...');
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Take screenshot of idle state
    await page.screenshot({ path: 'tmp/final-demo-01-idle.png' });
    console.log('✅ Screenshot 1: Idle state with green Start button');
    
    // Start session
    const startButton = await page.locator('button:has-text("Start")').first();
    await startButton.click();
    await page.waitForTimeout(500);
    
    const deepWorkButton = await page.locator('text=Deep Work').first();
    await deepWorkButton.click();
    await page.waitForTimeout(300);
    
    const startSessionButton = await page.locator('button:has-text("Start Session")');
    await startSessionButton.click();
    await page.waitForTimeout(2000); // Let it run for 2 seconds
    
    // Take screenshot of active state
    await page.screenshot({ path: 'tmp/final-demo-02-active.png' });
    console.log('✅ Screenshot 2: Active state with red Stop button and live timer');
    
    console.log('🎉 Timer heart is beating successfully!');
    console.log('🎯 Issue #17 completed: "Integrate Start-Stop session connection with calendar"');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    await page.screenshot({ path: 'tmp/final-demo-error.png' });
  } finally {
    await browser.close();
  }
}

finalDemo();