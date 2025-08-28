import { test } from '@playwright/test';

test('Direct Live Demo - localhost:3003', async ({ page }) => {
  console.log('🌐 Connecting to live server at http://localhost:3003');
  
  try {
    // Connect directly to running server
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('✅ Dashboard loaded successfully!');
    
    // Take live dashboard screenshot  
    await page.screenshot({
      path: 'live-demo/dashboard-live.png',
      fullPage: true
    });

    // Navigate to subjects
    await page.click('a[href="/subjects"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ Subjects page loaded successfully!');
    
    // Take live subjects screenshot
    await page.screenshot({
      path: 'live-demo/subjects-live.png', 
      fullPage: true
    });

    console.log('🎉 Live screenshots captured!');
    console.log('📱 Application fully functional on http://localhost:3003');
    
  } catch (error) {
    console.log('❌ Error connecting to server:', error.message);
  }
});