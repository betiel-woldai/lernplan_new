const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('📱 Taking final screenshots of stable version...');
    
    // Navigate to main page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Take screenshot of dashboard
    await page.screenshot({
      path: 'tmp/stable-01-dashboard.png',
      fullPage: true
    });
    console.log('✅ Dashboard screenshot taken');
    
    // Navigate to subjects page
    await page.goto('http://localhost:3000/subjects', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Take screenshot of subjects page
    await page.screenshot({
      path: 'tmp/stable-02-subjects.png',
      fullPage: true
    });
    console.log('✅ Subjects page screenshot taken');
    
    // Check if start button exists and click it
    const startButton = page.locator('button:has-text("Start")').first();
    if (await startButton.isVisible()) {
      console.log('▶️ Found Start button, clicking...');
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of timer active state
      await page.screenshot({
        path: 'tmp/stable-03-timer-active.png',
        fullPage: true
      });
      console.log('✅ Timer active screenshot taken');
    }
    
    // Navigate to analytics to check other pages
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Take screenshot of analytics
    await page.screenshot({
      path: 'tmp/stable-04-analytics.png',
      fullPage: true
    });
    console.log('✅ Analytics screenshot taken');
    
    console.log('🎉 All screenshots completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during screenshot:', error.message);
    await page.screenshot({
      path: 'tmp/stable-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
})();