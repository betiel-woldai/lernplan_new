import { test } from '@playwright/test';

test('Quick Analytics Screenshot', async ({ page }) => {
  try {
    console.log('📊 Navigating to analytics page...');
    await page.goto('http://localhost:3000/analytics', { timeout: 10000 });
    
    console.log('⏱️ Waiting a moment for loading...');
    await page.waitForTimeout(3000);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'tmp/analytics-current.png', 
      fullPage: true 
    });
    
    console.log('✅ Screenshot saved to tmp/analytics-current.png');
  } catch (error) {
    console.log('❌ Error:', error);
    // Take screenshot anyway
    await page.screenshot({ 
      path: 'tmp/analytics-error.png', 
      fullPage: true 
    });
  }
});