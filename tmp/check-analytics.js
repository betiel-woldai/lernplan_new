const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/analytics');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tmp/analytics-screenshot.png', fullPage: false });

  // Check console errors
  page.on('console', msg => console.log('CONSOLE:', msg.text()));

  // Get the rank card HTML
  const rankCard = await page.$eval('.bg-white.p-6.rounded-lg.shadow-sm.border:has-text("Rank")', el => el.outerHTML).catch(() => 'Not found');
  console.log('RANK CARD HTML:', rankCard.substring(0, 500));

  await browser.close();
})();
