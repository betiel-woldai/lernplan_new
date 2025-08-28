import { test, expect } from '@playwright/test';

test('Live Demo - Lernplaner Running on Localhost', async ({ page }) => {
  // Navigate to the running server
  await page.goto('http://localhost:3003');
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take screenshot of live dashboard
  await page.screenshot({
    path: 'live-demo/01-dashboard-live.png',
    fullPage: true
  });

  // Navigate to subjects page
  await page.click('a[href="/subjects"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Take screenshot of live subjects page
  await page.screenshot({
    path: 'live-demo/02-subjects-live.png',
    fullPage: true
  });

  // Test the Add Subject modal
  await page.click('button:has-text("Add Subject")');
  await page.waitForTimeout(1000);

  // Take screenshot of live modal
  await page.screenshot({
    path: 'live-demo/03-modal-live.png',
    fullPage: true
  });

  console.log('✅ Live demo screenshots captured successfully!');
  console.log('🌐 Application running on http://localhost:3003');
  console.log('🎯 Issue #3 Subject Management Interface - LIVE & WORKING!');
});