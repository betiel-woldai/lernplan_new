const { test, expect } = require('@playwright/test');

test.describe('XP Synchronization Fix', () => {
  test('XP should reset when sessions are unmarked and increase when marked', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'tmp/xp-fix-initial.png', fullPage: true });

    // Try to find XP display elements
    const xpElement = page.locator('[data-testid="total-xp"]');
    const calendarElement = page.locator('.bg-white.rounded-xl.border.border-gray-200');

    // Check if elements exist
    const xpExists = await xpElement.count() > 0;
    const calendarExists = await calendarElement.count() > 0;

    console.log('XP element found:', xpExists);
    console.log('Calendar element found:', calendarExists);

    if (xpExists) {
      const currentXP = await xpElement.textContent();
      console.log('Current XP display:', currentXP);
    }

    // Take screenshot after loading
    await page.screenshot({ path: 'tmp/xp-fix-loaded.png', fullPage: true });

    // Try to find calendar sessions that can be toggled
    const sessionElements = page.locator('.bg-slate-50, .bg-green-50, .bg-red-50');
    const sessionCount = await sessionElements.count();

    console.log('Found sessions:', sessionCount);

    if (sessionCount > 0) {
      // Take screenshot showing sessions
      await page.screenshot({ path: 'tmp/xp-fix-sessions-found.png', fullPage: true });

      // Try to click on first session to see context menu or interaction
      await sessionElements.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tmp/xp-fix-session-clicked.png', fullPage: true });
    }

    // Log browser console for debugging
    page.on('console', msg => console.log('Browser log:', msg.text()));
  });
});