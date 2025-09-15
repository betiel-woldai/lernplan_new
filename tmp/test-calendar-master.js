const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take screenshot of main dashboard
    await page.screenshot({
      path: 'tmp/current-dashboard.png',
      fullPage: true
    });

    console.log('✅ Dashboard screenshot taken: tmp/current-dashboard.png');

    // Navigate to analytics page
    await page.click('a[href="/analytics"]');
    await page.waitForLoadState('networkidle');

    // Take screenshot of analytics
    await page.screenshot({
      path: 'tmp/current-analytics.png',
      fullPage: true
    });

    console.log('✅ Analytics screenshot taken: tmp/current-analytics.png');

    // Check console for any errors
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.reload();
    await page.waitForTimeout(2000);

    console.log('Console logs:', logs);

  } catch (error) {
    console.error('Error taking screenshots:', error);
  }

  await browser.close();
})();