/**
 * Quick Demo Test - Calendar Session Management Features
 * Takes screenshots to demonstrate the implemented functionality
 */

const { chromium } = require('playwright');

async function runDemo() {
  console.log('🚀 Starting Calendar Session Management Demo...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    console.log('📱 Navigated to application');
    
    // Wait for the calendar to load
    await page.waitForSelector('.calendar-container', { timeout: 10000 });
    console.log('📅 Calendar loaded successfully');
    
    // Take screenshot of the main calendar view
    await page.screenshot({ 
      path: 'tmp/demo-01-calendar-main.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 1: Main calendar view saved');
    
    // Try to click on a date to open create modal
    const calendarDate = await page.locator('.calendar-grid > div').nth(10);
    await calendarDate.click();
    
    // Wait a bit for modal to appear
    await page.waitForTimeout(1000);
    
    // Take screenshot showing create modal (if it appears)
    await page.screenshot({ 
      path: 'tmp/demo-02-create-modal.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 2: Create modal view saved');
    
    // Close any modal that might be open
    try {
      await page.click('button:has-text("Abbrechen")', { timeout: 2000 });
    } catch (e) {
      // Modal might not be open
    }
    
    // Look for existing sessions and try right-click
    const sessionElements = await page.locator('.calendar-grid .border-l-4');
    const sessionCount = await sessionElements.count();
    
    if (sessionCount > 0) {
      console.log(`🎯 Found ${sessionCount} sessions in calendar`);
      
      // Right-click on the first session
      await sessionElements.first().click({ button: 'right' });
      await page.waitForTimeout(500);
      
      // Take screenshot showing context menu
      await page.screenshot({ 
        path: 'tmp/demo-03-context-menu.png',
        fullPage: true 
      });
      console.log('📸 Screenshot 3: Context menu view saved');
      
      // Click elsewhere to close context menu
      await page.click('.calendar-container', { position: { x: 100, y: 100 } });
    } else {
      console.log('ℹ️  No existing sessions found for context menu demo');
    }
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: 'tmp/demo-04-final-overview.png',
      fullPage: true 
    });
    console.log('📸 Screenshot 4: Final overview saved');
    
    console.log('✅ Demo completed successfully!');
    console.log('\n📁 Screenshots saved in tmp/ folder:');
    console.log('  - demo-01-calendar-main.png');
    console.log('  - demo-02-create-modal.png');
    console.log('  - demo-03-context-menu.png');
    console.log('  - demo-04-final-overview.png');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the demo
runDemo();