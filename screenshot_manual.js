const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to localhost:3003...');
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(3000);

    console.log('Taking initial screenshot...');
    await page.screenshot({ path: 'tmp/current-app-state.png', fullPage: true });

    console.log('Clicking Start button...');
    await page.click('text=Start');
    await page.waitForTimeout(2000);

    console.log('Taking modal screenshot...');
    await page.screenshot({ path: 'tmp/start-modal-state.png', fullPage: true });

    // Check if Deep Work subject is available
    const deepWork = await page.locator('text=Deep Work').count();
    console.log('Deep Work subjects found:', deepWork);

    // Check button state
    const startButton = page.locator('text=Start Session');
    const isEnabled = await startButton.isEnabled();
    console.log('Start Session button enabled:', isEnabled);

    // Check for any error messages
    const errors = await page.locator('[role="alert"], .text-red-500, .text-red-600, .text-red-700').allTextContents();
    console.log('Error messages:', errors);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();