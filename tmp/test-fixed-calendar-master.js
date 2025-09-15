const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Wait a moment for APIs to load
    await page.waitForTimeout(3000);

    // Take screenshot of fixed dashboard
    await page.screenshot({
      path: 'tmp/fixed-dashboard.png',
      fullPage: true
    });

    console.log('✅ Fixed dashboard screenshot taken: tmp/fixed-dashboard.png');

    // Check if there are any API errors in console
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`ERROR: ${msg.text()}`);
      }
    });

    // Refresh to check for errors
    await page.reload();
    await page.waitForTimeout(2000);

    if (logs.length > 0) {
      console.log('🚨 Console errors found:', logs);
    } else {
      console.log('✅ No console errors detected');
    }

  } catch (error) {
    console.error('Error testing Calendar-as-Master fix:', error);
  }

  await browser.close();
})();