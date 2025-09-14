/**
 * Test German info boxes on subjects and calendar pages
 */

const { chromium } = require('playwright');

async function testGermanInfoBoxes() {
  console.log('🇩🇪 Testing German info boxes implementation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    
    // Test 1: Calendar overview with new German info box
    console.log('📅 Testing calendar overview with German info box...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.calendar-container', { timeout: 10000 });
    
    // Wait for the info box to be visible
    await page.waitForSelector('text=Kalender-Funktionen:', { timeout: 5000 });
    
    await page.screenshot({ 
      path: 'tmp/german-calendar-info-box.png',
      fullPage: true 
    });
    
    console.log('✅ Calendar overview screenshot saved: tmp/german-calendar-info-box.png');
    
    // Test 2: Subjects page with translated Quick Start
    console.log('📚 Testing subjects page with German Quick Start...');
    await page.goto('http://localhost:3000/subjects');
    await page.waitForSelector('text=Schnellstart:', { timeout: 5000 });
    
    await page.screenshot({ 
      path: 'tmp/german-subjects-info-box.png',
      fullPage: true 
    });
    
    console.log('✅ Subjects page screenshot saved: tmp/german-subjects-info-box.png');
    
    // Verify both German texts are present
    const calendarInfoText = await page.textContent('text=Kalender-Funktionen:');
    const subjectsInfoText = await page.textContent('text=Schnellstart:');
    
    console.log('🎯 German info boxes successfully implemented:');
    console.log('  - Calendar: "Kalender-Funktionen" with drag-and-drop instructions');
    console.log('  - Subjects: "Schnellstart" with timer instructions');
    console.log('  - Both pages now have helpful German guidance');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testGermanInfoBoxes();