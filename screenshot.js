const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('📷 Taking screenshot of the Learning Tracker...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for any animations

    const screenshotPath = '/tmp/learning-tracker-frontend.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: false // Just the viewport
    });

    console.log(`✅ Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('❌ Error taking screenshot:', error.message);
  } finally {
    await browser.close();
  }
})();