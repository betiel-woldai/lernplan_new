const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Take screenshot of the main page
    await page.screenshot({
      path: 'tmp/issue17-current-state-main.png',
      fullPage: true
    });
    
    console.log('📸 Main page screenshot taken');
    
    // Navigate to subjects page (Lerntracker-Zentrale)
    await page.goto('http://localhost:3000/subjects', { waitUntil: 'load', timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Take screenshot of the subjects page
    await page.screenshot({
      path: 'tmp/issue17-current-state-subjects.png',
      fullPage: true
    });
    
    console.log('📸 Subjects page (Lerntracker-Zentrale) screenshot taken');
    
    // Check for timer functionality
    const timerButton = await page.locator('[class*="timer"], [id*="timer"], button:has-text("Start"), button:has-text("Stop")').first();
    if (await timerButton.isVisible()) {
      console.log('✅ Timer button found on subjects page');
      
      // Try to click the start button if visible
      const startButton = page.locator('button:has-text("Start")');
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(1000);
        
        // Take screenshot after clicking start
        await page.screenshot({
          path: 'tmp/issue17-current-state-after-start.png',
          fullPage: true
        });
        console.log('📸 After start button click screenshot taken');
      }
    } else {
      console.log('⚠️ No timer button found on subjects page');
    }
    
    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console error:', msg.text());
      }
    });
    
  } catch (error) {
    console.error('❌ Error during screenshot:', error);
    await page.screenshot({
      path: 'tmp/issue17-current-state-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
})();