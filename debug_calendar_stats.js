const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => {
    if (msg.text().includes('DirectCalendarStats')) {
      console.log(`🐛 Console: ${msg.text()}`);
    }
  });

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait longer for component to load

    // Check what date is selected
    const dateText = await page.textContent('.space-y-3 .bg-blue-50');
    console.log('🗓️ Selected date from UI:', dateText);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();