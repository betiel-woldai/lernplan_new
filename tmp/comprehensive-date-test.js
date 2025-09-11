const { chromium } = require('playwright');

async function testDateSpecificLogic() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting comprehensive date logic test...');
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Function to get sidebar stats
    const getSidebarStats = async () => {
      const stats = {};
      
      // Get learning time
      try {
        const learningTime = await page.locator('div:has-text("Heute") >> .. >> span:has-text("0h"):last').first().textContent();
        stats.learningTime = learningTime;
      } catch (e) {
        stats.learningTime = 'Not found';
      }
      
      // Get sessions count
      try {
        const sessionsText = await page.locator('div:has-text("Sessions") >> .. >> text=/\\d+\\/\\d+|0|\\d+/').first().textContent();
        stats.sessions = sessionsText;
      } catch (e) {
        stats.sessions = 'Not found';
      }
      
      return stats;
    };
    
    // Test 1: Check initial state (today)
    console.log('📅 Test 1: Checking today (September 11, 2025)');
    let stats = await getSidebarStats();
    console.log('📊 Today stats:', stats);
    
    await page.screenshot({ path: 'tmp/test-today.png', fullPage: true });
    
    // Test 2: Click on a past date with sessions (September 8)
    console.log('📅 Test 2: Clicking on September 8 (has completed sessions)');
    const day8 = page.locator('text=8').first();
    if (await day8.isVisible()) {
      await day8.click();
      await page.waitForTimeout(2000); // Wait for API call and state update
      
      stats = await getSidebarStats();
      console.log('📊 September 8 stats:', stats);
      
      await page.screenshot({ path: 'tmp/test-sep8.png', fullPage: true });
    }
    
    // Test 3: Click on another past date (September 9)
    console.log('📅 Test 3: Clicking on September 9');
    const day9 = page.locator('text=9').first();
    if (await day9.isVisible()) {
      await day9.click();
      await page.waitForTimeout(2000);
      
      stats = await getSidebarStats();
      console.log('📊 September 9 stats:', stats);
      
      await page.screenshot({ path: 'tmp/test-sep9.png', fullPage: true });
    }
    
    // Test 4: Click on a future date (September 15)
    console.log('📅 Test 4: Clicking on September 15 (future date)');
    const day15 = page.locator('text=15').first();
    if (await day15.isVisible()) {
      await day15.click();
      await page.waitForTimeout(2000);
      
      stats = await getSidebarStats();
      console.log('📊 September 15 stats:', stats);
      
      await page.screenshot({ path: 'tmp/test-sep15.png', fullPage: true });
    }
    
    // Test 5: Go back to today
    console.log('📅 Test 5: Going back to today');
    const today = page.locator('text=11').first();
    if (await today.isVisible()) {
      await today.click();
      await page.waitForTimeout(2000);
      
      stats = await getSidebarStats();
      console.log('📊 Back to today stats:', stats);
      
      await page.screenshot({ path: 'tmp/test-back-to-today.png', fullPage: true });
    }
    
    // Check API calls in network
    page.on('response', response => {
      if (response.url().includes('/api/date-specific-stats')) {
        console.log('🌐 API call made:', response.url(), 'Status:', response.status());
      }
    });
    
    // Final verification
    console.log('✅ Test completed! All screenshots saved to tmp/ directory');
    console.log('📝 Summary: The sidebar should now show different statistics based on the selected date');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

testDateSpecificLogic();