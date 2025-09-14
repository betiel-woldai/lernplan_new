/**
 * Simple test to check Session-Typ removal
 */

const { chromium } = require('playwright');

async function testSimple() {
  console.log('🗑️ Testing Session-Typ removal (simple)...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded');
    
    // Look for any empty calendar cell and click
    try {
      const calendarCells = await page.locator('[data-date]').first();
      await calendarCells.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tmp/modal-after-session-type-removal.png',
        fullPage: true 
      });
      
      console.log('✅ Screenshot taken: tmp/modal-after-session-type-removal.png');
      
    } catch (error) {
      console.log('❌ Could not open modal, taking page screenshot instead');
      await page.screenshot({ 
        path: 'tmp/calendar-page-after-changes.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimple();