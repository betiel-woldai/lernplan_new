/**
 * Test that Session-Typ section has been removed from CreateSessionModal
 */

const { chromium } = require('playwright');

async function testRemovedSessionType() {
  console.log('🗑️ Testing removal of Session-Typ options...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.calendar-container', { timeout: 10000 });
    
    // Click on a date to open create modal
    const calendarDate = await page.locator('.calendar-grid > div').nth(15);
    await calendarDate.click();
    await page.waitForTimeout(1500);
    
    // Check that Session-Typ section is no longer present
    const sessionTypeExists = await page.locator('text=Session-Typ').count();
    const lernsessionExists = await page.locator('text=Lernsession').count();
    const prufungExists = await page.locator('text=Prüfung').count();
    
    console.log(`Session-Typ section found: ${sessionTypeExists} times`);
    console.log(`Lernsession option found: ${lernsessionExists} times`);
    console.log(`Prüfung option found: ${prufungExists} times`);
    
    // Take screenshot of cleaned modal
    await page.screenshot({ 
      path: 'tmp/modal-without-session-type.png',
      fullPage: true 
    });
    
    if (sessionTypeExists === 0 && lernsessionExists === 0 && prufungExists === 0) {
      console.log('✅ Session-Typ section successfully removed!');
      console.log('📸 Screenshot saved: tmp/modal-without-session-type.png');
    } else {
      console.log('❌ Session-Typ section still present');
    }
    
    // Check what fields remain in the modal
    const titleExists = await page.locator('text=Titel').count();
    const fachExists = await page.locator('text=Fach').count();
    const startzeitExists = await page.locator('text=Startzeit').count();
    const endzeitExists = await page.locator('text=Endzeit').count();
    const ortExists = await page.locator('text=Ort').count();
    const beschreibungExists = await page.locator('text=Beschreibung').count();
    
    console.log('🔍 Remaining modal fields:');
    console.log(`  - Titel: ${titleExists > 0 ? '✅' : '❌'}`);
    console.log(`  - Fach: ${fachExists > 0 ? '✅' : '❌'}`);
    console.log(`  - Startzeit: ${startzeitExists > 0 ? '✅' : '❌'}`);
    console.log(`  - Endzeit: ${endzeitExists > 0 ? '✅' : '❌'}`);
    console.log(`  - Ort: ${ortExists > 0 ? '✅' : '❌'}`);
    console.log(`  - Beschreibung: ${beschreibungExists > 0 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testRemovedSessionType();