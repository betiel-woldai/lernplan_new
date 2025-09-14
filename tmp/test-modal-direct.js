/**
 * Direct test to open modal and check for Session-Typ removal
 */

const { chromium } = require('playwright');

async function testModalDirect() {
  console.log('🎯 Testing modal directly...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded');
    
    // Try clicking the + Session button instead
    try {
      await page.click('text=+ Session');
      await page.waitForTimeout(2000);
      console.log('✅ Modal opened via + Session button');
    } catch (error) {
      console.log('❌ + Session button not found, trying calendar cell...');
      
      // Try clicking on an empty calendar cell
      const emptyCells = await page.locator('.calendar-grid .calendar-cell').all();
      if (emptyCells.length > 0) {
        await emptyCells[10].click();
        await page.waitForTimeout(2000);
        console.log('✅ Modal opened via calendar cell');
      }
    }
    
    // Check for modal
    const modalVisible = await page.isVisible('text=Neue Session erstellen');
    console.log(`Modal visible: ${modalVisible}`);
    
    if (modalVisible) {
      // Check for Session-Typ elements
      const sessionTypExists = await page.locator('text=Session-Typ').count();
      const lernsessionExists = await page.locator('text=Lernsession').count();
      const studyIconExists = await page.locator('text=📚').count();
      
      console.log(`Session-Typ label: ${sessionTypExists} occurrences`);
      console.log(`Lernsession option: ${lernsessionExists} occurrences`);
      console.log(`Study icon (📚): ${studyIconExists} occurrences`);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'tmp/modal-session-typ-removed.png',
        fullPage: true 
      });
      
      if (sessionTypExists === 0 && lernsessionExists === 0) {
        console.log('✅ SUCCESS: Session-Typ section completely removed!');
      } else {
        console.log('❌ FAIL: Session-Typ section still present');
      }
    } else {
      console.log('❌ Modal not found');
      await page.screenshot({ 
        path: 'tmp/calendar-no-modal.png',
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testModalDirect();