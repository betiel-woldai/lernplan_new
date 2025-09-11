const { chromium } = require('playwright');

async function testSimple() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to subjects page...');
    await page.goto('http://localhost:3000/subjects', { waitUntil: 'domcontentloaded' });
    
    // Wait for main content
    await page.waitForSelector('h1', { timeout: 10000 });
    
    console.log('Taking screenshot...');
    await page.screenshot({ 
      path: 'tmp/lerntracker-zentrale-screenshot.png',
      fullPage: true
    });
    
    const title = await page.textContent('h1');
    console.log('✓ Page loaded with title:', title);
    
    await page.waitForTimeout(5000); // Keep browser open to see result
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testSimple();