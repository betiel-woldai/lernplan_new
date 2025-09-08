const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to calendar page...');
    await page.goto('http://localhost:3001/calendar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for data to load
    
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: 'calendar-synchronized.png', 
      fullPage: true 
    });
    console.log('Screenshot saved as calendar-synchronized.png');
    
    // Also capture subjects page for comparison
    console.log('Navigating to subjects page...');
    await page.goto('http://localhost:3001/subjects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'subjects-current.png', 
      fullPage: true 
    });
    console.log('Screenshot saved as subjects-current.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();