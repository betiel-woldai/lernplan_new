import { test, expect } from '@playwright/test';

test('Debug completion toggle - check logs', async ({ page }) => {
  console.log('🐛 Debugging completion toggle...');
  
  // Listen to console logs from the page
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`📝 [${msg.type()}] ${msg.text()}`);
    }
  });
  
  // Navigate to the main page
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Wait for calendar to load
  await expect(page.locator('.calendar-grid')).toBeVisible();
  
  // Take screenshot to see current state
  await page.screenshot({ path: 'tests/screenshots/debug-before-toggle.png' });
  
  // Find the first session toggle button
  const toggleButton = page.locator('button[title*="Als abgeschlossen markieren"], button[title*="Als ausstehend markieren"]').first();
  
  if (await toggleButton.count() > 0) {
    console.log('🎯 Found toggle button, clicking...');
    
    const initialTitle = await toggleButton.getAttribute('title');
    console.log(`📋 Initial button title: ${initialTitle}`);
    
    // Click the toggle
    await toggleButton.click();
    
    // Wait for any network activity
    await page.waitForTimeout(3000);
    
    // Take screenshot after toggle
    await page.screenshot({ path: 'tests/screenshots/debug-after-toggle.png' });
    
    console.log('✅ Debug toggle test completed');
  } else {
    console.log('⚠️  No toggle buttons found');
    
    // Check if there are any sessions at all
    const sessions = page.locator('[data-testid^="session-"], .calendar-grid [title*="-"]');
    console.log(`📊 Found ${await sessions.count()} session elements`);
    
    // Check for error messages
    const errors = page.locator('[class*="error"], [class*="Error"]');
    if (await errors.count() > 0) {
      console.log(`❌ Found ${await errors.count()} error elements`);
      for (let i = 0; i < await errors.count(); i++) {
        console.log(`Error ${i}: ${await errors.nth(i).textContent()}`);
      }
    }
  }
});