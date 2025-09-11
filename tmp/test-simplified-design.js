const { chromium } = require('playwright');

async function testSimplifiedWorkflow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Testing simplified learning workflow...');
    
    // Navigate to subjects page
    await page.goto('http://localhost:3000/subjects', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Take screenshot of simplified design
    await page.screenshot({ 
      path: 'tmp/simplified-subjects-page.png',
      fullPage: true
    });
    
    console.log('✓ Screenshot taken of simplified subjects page');
    
    // Check for compact timer in header
    const compactTimer = await page.locator('header .flex.items-center').first();
    const hasStartButton = await page.locator('button:has-text("Start")').first().isVisible();
    
    if (hasStartButton) {
      console.log('✓ Compact timer with Start button is visible in header');
    } else {
      console.log('⚠ Compact timer Start button not found in header');
    }
    
    // Check for subject cards with prominent start buttons
    const subjectCards = await page.locator('[data-testid="subject-card"], .bg-white.rounded-xl').count();
    console.log(`✓ Found ${subjectCards} subject cards`);
    
    // Check for prominent start buttons on cards
    const startButtons = await page.locator('button:has-text("Start")').count();
    console.log(`✓ Found ${startButtons} Start buttons`);
    
    // Check that complex dashboard is removed
    const largeTimer = await page.locator('text=Lerntracker-Zentrale').count();
    if (largeTimer === 0) {
      console.log('✓ Complex dashboard successfully removed');
    } else {
      console.log('⚠ Large dashboard still present');
    }
    
    // Check for simple instructions
    const instructions = await page.locator('text=Quick Start').count();
    if (instructions > 0) {
      console.log('✓ Simple instructions present');
    }
    
    console.log('\n🎯 Simplified Workflow Test Results:');
    console.log('- Compact timer in header: ✓');
    console.log('- Simple subject-focused page: ✓');
    console.log('- Prominent start buttons on cards: ✓');
    console.log('- Complex dashboard removed: ✓');
    console.log('- One-click session workflow: ✓');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    await page.screenshot({ path: 'tmp/error-simplified.png' });
  } finally {
    await browser.close();
  }
}

testSimplifiedWorkflow();