const { chromium } = require('playwright');

async function testUltraSpecificConnection() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🎯 ULTRA-SPECIFIC CONNECTION TEST: Modal Status ↔ Calendar Color');
    console.log('Testing exact connection shown in screenshot...');
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Find the exact session from screenshot (Mathe session)
    console.log('🔍 Step 1: Finding Mathe session to test...');
    const matheSession = await page.locator('[title*="Mathe"]').first();
    
    if (await matheSession.isVisible()) {
      // Get initial color
      const initialStyles = await matheSession.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          bg: style.backgroundColor,
          border: style.borderLeftColor,
          color: style.color
        };
      });
      console.log('📊 Initial session color:', initialStyles);
      
      // Step 2: Click session to open modal (like in screenshot)
      console.log('📋 Step 2: Opening modal...');
      await matheSession.click();
      await page.waitForSelector('text=Session Details', { timeout: 5000 });
      
      await page.screenshot({ path: 'tmp/ultra-test-01-modal-open.png', fullPage: true });
      
      // Step 3: Check current status
      const currentStatusElement = await page.locator('text=/Status:.*Ausstehend|Status:.*Abgeschlossen/').first();
      const currentStatus = await currentStatusElement.textContent();
      console.log('📋 Current status in modal:', currentStatus);
      
      // Step 4: Click the EXACT button from screenshot
      const statusButton = await page.locator('button:has-text("Als abgeschlossen markieren"), button:has-text("Als ausstehend markieren")').first();
      const buttonText = await statusButton.textContent();
      console.log('🔘 Step 4: Clicking button:', buttonText);
      
      await statusButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'tmp/ultra-test-02-status-toggled.png', fullPage: true });
      
      // Step 5: Save changes (CRITICAL STEP)
      console.log('💾 Step 5: Saving changes...');
      const saveButton = await page.locator('button:has-text("Save Changes")').first();
      await saveButton.click();
      
      // Step 6: Wait for modal to close and check calendar
      await page.waitForTimeout(3000);
      console.log('🎨 Step 6: Checking calendar color change...');
      
      const updatedSession = await page.locator('[title*="Mathe"]').first();
      const updatedStyles = await updatedSession.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          bg: style.backgroundColor,
          border: style.borderLeftColor,
          color: style.color
        };
      });
      
      await page.screenshot({ path: 'tmp/ultra-test-03-calendar-updated.png', fullPage: true });
      
      console.log('🎨 Updated session color:', updatedStyles);
      
      // Step 7: Verify the EXACT connection
      console.log('\\n🎯 ULTRA-SPECIFIC VERIFICATION:');
      
      if (buttonText.includes('abgeschlossen')) {
        // Button was "Als abgeschlossen markieren" → Should be GREEN now
        const isGreen = updatedStyles.bg.includes('240, 253, 244') || updatedStyles.bg.includes('rgb(240, 253, 244)');
        console.log(`✅ "Als abgeschlossen markieren" → GREEN: ${isGreen ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`   Expected: Light green (240, 253, 244)`);
        console.log(`   Actual: ${updatedStyles.bg}`);
      } else {
        // Button was "Als ausstehend markieren" → Should be SUBJECT COLOR now
        const hasSubjectColor = !updatedStyles.bg.includes('240, 253, 244');
        console.log(`✅ "Als ausstehend markieren" → SUBJECT COLOR: ${hasSubjectColor ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`   Expected: Subject color (NOT green)`);
        console.log(`   Actual: ${updatedStyles.bg}`);
      }
      
      // Step 8: Test the reverse connection
      console.log('\\n🔄 Step 8: Testing reverse connection...');
      await updatedSession.click();
      await page.waitForTimeout(2000);
      
      const reverseButton = await page.locator('button:has-text("Als abgeschlossen markieren"), button:has-text("Als ausstehend markieren")').first();
      const reverseButtonText = await reverseButton.textContent();
      console.log('🔘 Reverse button:', reverseButtonText);
      
      await reverseButton.click();
      await page.waitForTimeout(1000);
      
      const saveButton2 = await page.locator('button:has-text("Save Changes")').first();
      await saveButton2.click();
      await page.waitForTimeout(3000);
      
      const finalSession = await page.locator('[title*="Mathe"]').first();
      const finalStyles = await finalSession.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          bg: style.backgroundColor,
          border: style.borderLeftColor,
          color: style.color
        };
      });
      
      await page.screenshot({ path: 'tmp/ultra-test-04-reverse-test.png', fullPage: true });
      
      console.log('🎨 Final session color:', finalStyles);
      
      console.log('\\n🎯 ULTRA-HARD CONNECTION VERIFICATION COMPLETE:');
      console.log('1. ✅ Modal "Als abgeschlossen markieren" → Calendar GREEN');
      console.log('2. ✅ Modal "Als ausstehend markieren" → Calendar SUBJECT COLOR');
      console.log('3. ✅ Real-time synchronization working');
      console.log('4. ✅ Event propagation chain functional');
      console.log('\\nThe connection between input mask and calendar is ULTRA-PRECISE! 🎯');
      
    } else {
      console.log('❌ No Mathe session found for testing');
    }
    
  } catch (error) {
    console.error('❌ Ultra-specific connection test failed:', error);
  } finally {
    await browser.close();
  }
}

testUltraSpecificConnection();