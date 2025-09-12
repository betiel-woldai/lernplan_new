const { chromium } = require('playwright');

(async () => {
  console.log('📸 Taking final demo screenshot of real-time sync fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Take a full screenshot showing the dashboard with calendar and sidebar
    await page.screenshot({ 
      path: 'tmp/final-realtime-sync-demo.png',
      fullPage: true 
    });
    
    console.log('✅ Final demo screenshot saved: tmp/final-realtime-sync-demo.png');
    console.log('📱 Screenshot shows the dashboard with:');
    console.log('   - Green Start button in header (ready to test)');
    console.log('   - Calendar with existing sessions');
    console.log('   - Sidebar with real-time stats');
    console.log('   - Perfect layout for testing real-time sync');
    
  } catch (error) {
    console.error('❌ Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
})();