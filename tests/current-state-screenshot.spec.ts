import { test, expect } from '@playwright/test';

test('Take screenshot of current application state', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Take a screenshot
  await page.screenshot({ path: 'tmp/current-application-state.png', fullPage: true });

  // Verify the page has loaded
  await expect(page).toHaveTitle(/Lernplaner/);
});