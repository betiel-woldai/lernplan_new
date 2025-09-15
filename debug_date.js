const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen to console messages
  page.on('console', msg => {
    console.log(`Console: ${msg.text()}`);
  });

  try {
    // Add date debugging to the page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Execute JavaScript to check current date
    const dateInfo = await page.evaluate(() => {
      const now = new Date();
      const localDateStr = now.toLocaleDateString('de-DE');
      const isoDateStr = now.toISOString().split('T')[0];
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return {
        localDateStr,  // "15.09.2025" format
        isoDateStr,    // "2025-09-15" format
        timezone,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      };
    });

    console.log('🗓️ Browser Date Info:', dateInfo);

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();