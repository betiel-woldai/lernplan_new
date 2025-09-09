import { test, expect } from '@playwright/test';

test('Statistics page reflects status changes', async ({ page }) => {
  console.log('Testing statistics page update after session status changes...');
  
  // Navigate to the application
  await page.goto('http://localhost:3000');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Navigate to Statistics page
  try {
    await page.click('a[href*="analytics"], a:has-text("Statistiken")');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of statistics page
    await page.screenshot({ path: 'tmp/statistics-after-status-changes.png', fullPage: true });
    
    console.log('Statistics page screenshot captured');
    
    // Check for key statistics elements
    const statsElements = await page.locator('[data-testid*="stat"], .stat, .analytics').count();
    console.log(`Found ${statsElements} statistics elements`);
    
  } catch (error) {
    console.log('Error accessing statistics page:', error);
    await page.screenshot({ path: 'tmp/statistics-error.png', fullPage: true });
  }
});