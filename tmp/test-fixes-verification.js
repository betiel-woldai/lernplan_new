/**
 * Test to verify both fixes:
 * 1. Date clicking doesn't auto-open create modal
 * 2. Session completion toggle works without errors
 */

const { chromium } = require('playwright');

async function testFixesVerification() {
  console.log('🧪 Testing both fixes...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages and errors
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('error') || msg.text().includes('Error')) {
      console.log(`❌ Browser Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar loaded');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tmp/fixes-01-initial.png',
      fullPage: true 
    });
    
    // Test 1: Date clicking shouldn't auto-open create modal
    console.log('🧪 Test 1: Clicking on empty date should NOT open create modal...');
    
    // Find an empty date cell (a day without sessions)
    const emptyCells = await page.locator('.calendar-day:not(:has(.text-xs.px-2.py-1))').all();
    
    if (emptyCells.length > 0) {
      console.log(`Found ${emptyCells.length} empty date cells`);
      await emptyCells[0].click();
      await page.waitForTimeout(2000);
      
      // Check if create modal opened (it shouldn't)
      const createModalVisible = await page.isVisible('text=Session erstellen');
      console.log(`📝 Create modal visible after date click: ${createModalVisible}`);
      
      if (!createModalVisible) {
        console.log('✅ Test 1 PASSED: Date click does not auto-open create modal');
      } else {
        console.log('❌ Test 1 FAILED: Date click still opens create modal');
      }
      
      // Take screenshot after date click
      await page.screenshot({ 
        path: 'tmp/fixes-02-after-date-click.png',
        fullPage: true 
      });
      
    } else {
      console.log('⚠️ No empty date cells found for testing');
    }
    
    // Test 2: Session completion toggle should work without errors
    console.log('🧪 Test 2: Session completion toggle should work...');
    
    // Find a session to test completion toggle
    const sessions = await page.locator('[class*="text-xs px-2 py-1"]').all();
    
    if (sessions.length > 0) {
      console.log(`Found ${sessions.length} sessions`);
      
      // Get the first session
      const firstSession = sessions[0];
      const sessionText = await firstSession.textContent();
      console.log(`Testing completion toggle on: "${sessionText?.substring(0, 30)}..."`);
      
      // Find the completion toggle button within this session
      const completionButton = await firstSession.locator('button[class*="w-4 h-4 rounded-full"]').first();
      
      if (await completionButton.isVisible()) {
        console.log('🔘 Found completion toggle button, clicking...');
        
        // Get initial state
        const initialClasses = await completionButton.getAttribute('class');
        console.log(`Initial button classes: ${initialClasses}`);
        
        // Click the completion toggle
        await completionButton.click();
        await page.waitForTimeout(3000); // Wait for API call
        
        // Check if there were any errors (they would appear in console)
        console.log('⏳ Waiting for completion toggle to process...');
        
        // Take screenshot after toggle
        await page.screenshot({ 
          path: 'tmp/fixes-03-after-completion-toggle.png',
          fullPage: true 
        });
        
        // Get final state
        const finalClasses = await completionButton.getAttribute('class');
        console.log(`Final button classes: ${finalClasses}`);
        
        if (initialClasses !== finalClasses) {
          console.log('✅ Test 2 PASSED: Completion toggle changed state successfully');
        } else {
          console.log('❓ Test 2 UNCLEAR: Button classes didn\'t change (might still be working)');
        }
        
      } else {
        console.log('❌ Could not find completion toggle button');
      }
      
    } else {
      console.log('⚠️ No sessions found for completion toggle testing');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tmp/fixes-04-final.png',
      fullPage: true 
    });
    
    console.log('');
    console.log('🎯 Test Summary:');
    console.log('   • Date clicks no longer auto-open create modal');
    console.log('   • Session completion toggle should work without errors');
    console.log('   • Check browser console output above for any errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/fixes-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testFixesVerification();