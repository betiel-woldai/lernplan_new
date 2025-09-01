import { test } from '@playwright/test';

test('Analytics Page Screenshot', async ({ page }) => {
  // Navigate to analytics page
  await page.goto('http://localhost:3000/analytics');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tmp/analytics-page.png', 
    fullPage: true 
  });
  
  console.log('📊 Analytics page screenshot taken!');
});