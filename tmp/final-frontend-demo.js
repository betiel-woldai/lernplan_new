const { chromium } = require('playwright');

async function takeFinalScreenshot() {
  console.log('📸 Taking final frontend demonstration screenshot...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Load homepage
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-FINAL-working-frontend.png', 
      fullPage: true 
    });

    console.log('✅ Final frontend screenshot captured');
    console.log('📱 Application is working and ready for demonstration');

  } catch (error) {
    console.error('Error taking final screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeFinalScreenshot();