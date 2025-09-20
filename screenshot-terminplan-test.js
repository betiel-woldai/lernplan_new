const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the calendar page
    await page.goto('http://localhost:3000');

    // Wait for the page to load
    await page.waitForSelector('.calendar-grid', { timeout: 10000 });

    // Wait a bit more for data to load
    await page.waitForTimeout(3000);

    // Try to navigate to October 2025 to see terminplan events
    // Look for navigation buttons instead of select elements
    try {
      // Check if there are month navigation arrows - click forward to get to October 2025
      const nextButton = page.locator('button').filter({ hasText: '▶' }).or(page.locator('button').filter({ hasText: '>' }));
      if (await nextButton.count() > 0) {
        // Click next several times to get to October 2025
        for (let i = 0; i < 6; i++) {
          await nextButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    } catch (e) {
      console.log('Navigation buttons not found, continuing with current month');
    }

    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'tmp/terminplan-all-day-test.png',
      fullPage: true
    });

    console.log('Screenshot saved: tmp/terminplan-all-day-test.png');

  } catch (error) {
    console.error('Error taking screenshot:', error);
  }

  await browser.close();
})();