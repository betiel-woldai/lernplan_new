const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });
  
  // Collect network errors
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()}: ${response.url()}`);
    }
  });
  
  try {
    console.log('🔍 Navigating to main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    console.log('\n📋 CONSOLE MESSAGES:');
    consoleMessages.forEach(msg => console.log(`  ${msg}`));
    
    console.log('\n🌐 NETWORK ERRORS:');
    networkErrors.forEach(err => console.log(`  ${err}`));
    
    // Check for specific elements
    console.log('\n🔍 ELEMENT INSPECTION:');
    
    const bodyText = await page.textContent('body');
    if (bodyText.includes('missing required error')) {
      console.log('  ❌ React error boundary triggered');
    }
    
    // Check if React is loaded
    const hasReact = await page.evaluate(() => typeof window.React !== 'undefined');
    console.log(`  React loaded: ${hasReact}`);
    
    // Check for navigation elements
    const navigation = await page.locator('nav, [role="navigation"]').count();
    console.log(`  Navigation elements found: ${navigation}`);
    
    // Now check subjects page
    console.log('\n🔍 Navigating to subjects page...');
    await page.goto('http://localhost:3000/subjects', { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    const subjectsBodyText = await page.textContent('body');
    if (subjectsBodyText.includes('missing required error')) {
      console.log('  ❌ React error boundary triggered on subjects page');
    }
    
    // Look for timer-related elements
    const timerElements = await page.locator('[class*="timer"], [id*="timer"], [class*="session"]').count();
    console.log(`  Timer-related elements found: ${timerElements}`);
    
    // Look for start/stop buttons
    const startButtons = await page.locator('button:has-text("Start")').count();
    const stopButtons = await page.locator('button:has-text("Stop")').count();
    console.log(`  Start buttons found: ${startButtons}`);
    console.log(`  Stop buttons found: ${stopButtons}`);
    
  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  } finally {
    await browser.close();
  }
})();