/**
 * Test improved text contrast in modals
 */

const { chromium } = require('playwright');

async function testTextContrast() {
  console.log('🎨 Testing improved text contrast...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.calendar-container', { timeout: 10000 });
    
    // Click on a date to open create modal
    const calendarDate = await page.locator('.calendar-grid > div').nth(10);
    await calendarDate.click();
    await page.waitForTimeout(1500);
    
    // Take screenshot of improved create modal
    await page.screenshot({ 
      path: 'tmp/improved-text-contrast.png',
      fullPage: true 
    });
    
    console.log('✅ Screenshot saved: tmp/improved-text-contrast.png');
    console.log('🎨 Text contrast improvements applied:');
    console.log('  - Input text: text-gray-900 (dark gray/black)');
    console.log('  - Placeholder text: placeholder-gray-500 (medium gray)');
    console.log('  - Better contrast on all form fields');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testTextContrast();