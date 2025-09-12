const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing StartSessionModal fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to Overview page
    console.log('📍 Navigating to Overview page...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Take screenshot before clicking
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/modal-test-01-before.png',
      fullPage: true 
    });
    
    // Find and click the "Lernsession starten" button
    console.log('🖱️ Clicking "Lernsession starten" button...');
    const startButton = await page.locator('button:has-text("Lernsession starten")');
    await startButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after modal opens
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/modal-test-02-modal-open.png',
      fullPage: true 
    });
    
    // Check if Start Session button is enabled
    console.log('🔍 Checking if Start Session button is enabled...');
    const submitButton = await page.locator('button[type="submit"]:has-text("Start Session")');
    const isDisabled = await submitButton.getAttribute('disabled');
    
    if (isDisabled === null) {
      console.log('✅ SUCCESS: Start Session button is ENABLED!');
      
      // Try to click it
      await submitButton.click();
      await page.waitForTimeout(1500);
      
      // Take screenshot after clicking
      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/modal-test-03-after-start.png',
        fullPage: true 
      });
      
      console.log('🎯 Session creation attempted successfully!');
    } else {
      console.log('❌ ISSUE: Start Session button is still DISABLED');
      
      // Check what subjects are available
      const subjectLabels = await page.locator('div[class*="font-medium text-gray-900"]').allTextContents();
      console.log('📋 Available subjects:', subjectLabels);
      
      // Check if any subject is selected
      const selectedSubject = await page.locator('input[type="radio"][name="subject"]:checked').count();
      console.log('🎯 Selected subjects count:', selectedSubject);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/modal-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('🏁 Test completed!');
  }
})();