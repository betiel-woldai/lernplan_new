import { test } from '@playwright/test';

test('Current Frontend State', async ({ page }) => {
  // Dashboard
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'tmp/dashboard-current.png', 
    fullPage: true 
  });
  
  // Subjects
  await page.goto('http://localhost:3000/subjects');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'tmp/subjects-current.png', 
    fullPage: true 
  });
  
  // Calendar
  await page.goto('http://localhost:3000/calendar');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: 'tmp/calendar-current.png', 
    fullPage: true 
  });
});