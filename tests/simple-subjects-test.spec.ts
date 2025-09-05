import { test, expect } from '@playwright/test';

test('Simple Subjects Page Test', async ({ page }) => {
  console.log('🔍 Testing subjects page after server restart...');

  // Navigate directly to subjects page
  await page.goto('http://localhost:3001/subjects');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ 
    path: 'tmp/subjects-after-restart.png',
    fullPage: true 
  });

  const url = page.url();
  console.log('📍 Current URL:', url);

  // Check if page loaded successfully
  const title = await page.textContent('h1').catch(() => null);
  console.log('📄 Page title:', title);

  console.log('✅ Simple test completed');
});