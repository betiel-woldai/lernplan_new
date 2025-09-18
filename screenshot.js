// Simple screenshot script to capture the current state of the application
const { chromium } = require('playwright');

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📸 Taking screenshot of application at http://localhost:3003');

    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    // Take screenshot of main page
    await page.screenshot({
      path: 'tmp/current-application-state.png',
      fullPage: true
    });

    console.log('✅ Screenshot saved: tmp/current-application-state.png');

    // Navigate to subjects page if it exists
    try {
      await page.click('a[href="/subjects"]');
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: 'tmp/current-subjects-page.png',
        fullPage: true
      });
      console.log('✅ Subjects page screenshot saved: tmp/current-subjects-page.png');
    } catch (e) {
      console.log('ℹ️ Subjects page navigation failed, continuing...');
    }

  } catch (error) {
    console.error('❌ Screenshot failed:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshot();
