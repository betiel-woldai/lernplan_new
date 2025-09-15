const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for components to render
    await page.screenshot({ path: '/tmp/calendar_stats_test.png', fullPage: true });
    console.log('Screenshot saved to /tmp/calendar_stats_test.png');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();