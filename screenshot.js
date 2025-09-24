const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000); // Wait for page to load
    await page.screenshot({ path: 'frontend-screenshot.png', fullPage: true });
    console.log('Screenshot saved as frontend-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
})();