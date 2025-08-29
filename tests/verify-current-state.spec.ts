import { test, expect } from '@playwright/test';

test('Verify current application state', async ({ page }) => {
  // Check dashboard
  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'tmp/current-dashboard.png', 
    fullPage: true 
  });

  // Check subjects
  await page.goto('http://localhost:3001/subjects');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'tmp/current-subjects.png', 
    fullPage: true 
  });

  // Check calendar
  await page.goto('http://localhost:3001/calendar');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'tmp/current-calendar.png', 
    fullPage: true 
  });

  console.log('Screenshots saved to tmp/ directory');
});