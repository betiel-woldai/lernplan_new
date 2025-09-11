const { chromium } = require('playwright');

async function testCalendarLogic() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the current state
    await page.screenshot({ 
      path: 'tmp/dashboard-initial.png', 
      fullPage: true 
    });
    
    console.log('📸 Initial dashboard screenshot taken');
    
    // Check if sidebar shows correct date-specific data
    const dailyLearningTime = await page.locator('text=Heute').first().textContent();
    console.log('🕐 Current daily learning time display:', dailyLearningTime);
    
    // Look for sessions widget
    const sessionsWidget = await page.locator('text=Sessions').first();
    if (await sessionsWidget.isVisible()) {
      const sessionsText = await sessionsWidget.locator('..').textContent();
      console.log('📋 Sessions widget content:', sessionsText);
    }
    
    // Try to click on a different date in the calendar (if available)
    const calendarDays = await page.locator('.calendar-grid [role="button"], .calendar-grid .cursor-pointer').all();
    
    if (calendarDays.length > 0) {
      console.log(`📅 Found ${calendarDays.length} clickable calendar days`);
      
      // Click on a different day
      const differentDay = calendarDays[Math.min(5, calendarDays.length - 1)];
      await differentDay.click();
      
      // Wait for potential updates
      await page.waitForTimeout(2000);
      
      // Take another screenshot after clicking
      await page.screenshot({ 
        path: 'tmp/dashboard-after-date-click.png', 
        fullPage: true 
      });
      
      console.log('📸 Screenshot after date click taken');
      
      // Check if sidebar updated
      const updatedSidebar = await page.locator('text=/Today|Heute/').first().textContent();
      console.log('🔄 Updated sidebar content:', updatedSidebar);
    }
    
    // Check for any JavaScript console errors
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(1000);
    console.log('🖥️ Console logs:', logs.filter(log => log.includes('error') || log.includes('Error')));
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

testCalendarLogic();