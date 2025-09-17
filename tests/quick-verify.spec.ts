import { test, expect } from '@playwright/test';

test('Quick application verification', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3003');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({
    path: 'tmp/current-app-state.png',
    fullPage: true
  });

  // Check if the start button is visible
  const startButton = page.locator('text=Start Learning Session');
  await expect(startButton).toBeVisible({ timeout: 10000 });

  console.log('Application loaded successfully');
});
