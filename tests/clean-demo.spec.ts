import { test, expect } from '@playwright/test';

test('Clean Gamification Demo', async ({ page }) => {
  await page.goto('http://localhost:3002');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Close error dialog if present
  const closeButton = page.locator('[aria-label="Close"]').first();
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Also try clicking the X button in the error dialog
  const xButton = page.locator('button').filter({ hasText: '×' }).first();
  if (await xButton.isVisible()) {
    await xButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Take clean screenshot
  await page.screenshot({
    path: 'demo-screenshots/clean-dashboard.png',
    fullPage: true
  });
  
  console.log('Clean screenshot captured!');
});