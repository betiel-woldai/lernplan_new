const { chromium } = require('playwright');

async function testModalVisualFeedback() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🎨 Testing Modal Visual Feedback in Calendar...');
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('📅 Step 1: Taking initial screenshot');
    await page.screenshot({ path: 'tmp/modal-test-01-initial.png', fullPage: true });
    
    // Find a session in the calendar to click on (look for a session with subject color)
    console.log('🔍 Step 2: Looking for a session to click...');
    const sessions = await page.locator('[title*="Mathe"]').first();
    
    if (await sessions.isVisible()) {
      console.log('✅ Found Mathe session, clicking...');
      await sessions.click();
      
      // Wait for modal to open
      await page.waitForSelector('[role="dialog"], .modal, .bg-white.rounded-xl.shadow-2xl', { timeout: 5000 });
      
      console.log('📋 Step 3: Modal opened, taking screenshot');
      await page.screenshot({ path: 'tmp/modal-test-02-modal-opened.png', fullPage: true });
      
      // Check current status
      const currentStatus = await page.locator('text=/Status:.*Abgeschlossen|Status:.*Ausstehend/').first().textContent();
      console.log('📊 Current status:', currentStatus);
      
      // Find and click the status toggle button
      const statusToggleButton = await page.locator('button:has-text("Als abgeschlossen markieren"), button:has-text("Als ausstehend markieren")').first();
      
      if (await statusToggleButton.isVisible()) {
        const buttonText = await statusToggleButton.textContent();
        console.log('🔄 Step 4: Clicking status toggle:', buttonText);
        
        await statusToggleButton.click();
        await page.waitForTimeout(1000); // Wait for UI update
        
        console.log('📸 Step 5: Status toggled, taking screenshot');
        await page.screenshot({ path: 'tmp/modal-test-03-status-toggled.png', fullPage: true });
        
        // Save the changes
        const saveButton = await page.locator('button:has-text("Save Changes"), button:has-text("Speichern")').first();
        if (await saveButton.isVisible()) {
          console.log('💾 Step 6: Saving changes...');
          await saveButton.click();
          
          // Wait for modal to close and calendar to update
          await page.waitForTimeout(3000);
          
          console.log('🎨 Step 7: Changes saved, checking visual update in calendar');
          await page.screenshot({ path: 'tmp/modal-test-04-after-save.png', fullPage: true });
          
          // Check if the session visual changed in calendar
          const updatedSession = await page.locator('[title*="Mathe"]').first();
          const sessionStyles = await updatedSession.evaluate(el => {
            const computedStyle = window.getComputedStyle(el);
            return {
              backgroundColor: computedStyle.backgroundColor,
              borderColor: computedStyle.borderLeftColor || computedStyle.borderColor,
              color: computedStyle.color
            };
          });
          
          console.log('🎨 Session visual styles after update:', sessionStyles);
          
          // Test toggling back
          console.log('🔄 Step 8: Testing toggle back to original state...');
          await updatedSession.click();
          await page.waitForTimeout(2000);
          
          const statusToggleButton2 = await page.locator('button:has-text("Als abgeschlossen markieren"), button:has-text("Als ausstehend markieren")').first();
          if (await statusToggleButton2.isVisible()) {
            await statusToggleButton2.click();
            await page.waitForTimeout(1000);
            
            const saveButton2 = await page.locator('button:has-text("Save Changes"), button:has-text("Speichern")').first();
            if (await saveButton2.isVisible()) {
              await saveButton2.click();
              await page.waitForTimeout(3000);
              
              console.log('🎨 Step 9: Toggled back, final screenshot');
              await page.screenshot({ path: 'tmp/modal-test-05-toggled-back.png', fullPage: true });
            }
          }
          
          console.log('✅ Visual feedback test completed!');
          console.log('📝 Expected behavior:');
          console.log('  - Completed sessions should be GREEN');
          console.log('  - Pending sessions should show SUBJECT COLOR');
          console.log('  - Changes should be visible IMMEDIATELY after save');
          
        } else {
          console.log('❌ Save button not found');
        }
      } else {
        console.log('❌ Status toggle button not found');
      }
    } else {
      console.log('❌ No Mathe session found to test with');
    }
    
  } catch (error) {
    console.error('❌ Modal visual feedback test error:', error);
  } finally {
    await browser.close();
  }
}

testModalVisualFeedback();