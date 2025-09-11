const { chromium } = require('playwright');

async function testLerntrackerZentrale() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to subjects page
    await page.goto('http://localhost:3000/subjects');
    await page.waitForLoadState('networkidle');
    
    // Wait for the main content to load
    await page.waitForSelector('h1');
    
    // Take screenshot of the new Lerntracker-Zentrale design
    await page.screenshot({ 
      path: 'tmp/lerntracker-zentrale-screenshot.png',
      fullPage: true
    });
    
    console.log('✓ Screenshot taken successfully');
    
    // Check if the main elements are present
    const title = await page.textContent('h1');
    console.log('✓ Page title:', title);
    
    // Check for the Lerntracker-Zentrale header
    const lerntrackerTitle = await page.locator('text=Lerntracker-Zentrale').first();
    if (await lerntrackerTitle.isVisible()) {
      console.log('✓ Lerntracker-Zentrale header is visible');
    }
    
    // Check for the enhanced timer display
    const startButton = await page.locator('text=Start Learning Session');
    if (await startButton.isVisible()) {
      console.log('✓ Enhanced start session button is visible');
    }
    
    // Check for stats display
    const statsCards = await page.locator('.text-2xl.font-bold').count();
    console.log(`✓ Found ${statsCards} stat cards`);
    
    // Check console for any errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`Console error: ${msg.text()}`);
      }
    });
    
    await page.waitForTimeout(2000); // Wait for any async operations
    
    if (logs.length > 0) {
      console.log('⚠ Console errors detected:');
      logs.forEach(log => console.log(log));
    } else {
      console.log('✓ No console errors detected');
    }
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLerntrackerZentrale();