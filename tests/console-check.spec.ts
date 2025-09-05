import { test, expect } from '@playwright/test';

test('Check Console Errors', async ({ page }) => {
  console.log('🖥️ Checking browser console for errors...');

  const consoleMessages: string[] = [];
  const errors: string[] = [];

  // Listen for console messages
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  try {
    await page.goto('http://localhost:3001/subjects', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('❌ Failed to load page:', error);
  }

  console.log('📋 Console Messages:');
  consoleMessages.forEach(msg => console.log('  ', msg));

  console.log('🚨 Errors Found:');
  errors.forEach(error => console.log('  ', error));

  // Try accessing the root page
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'tmp/root-page.png',
    fullPage: true 
  });

  console.log('✅ Console check completed');
});