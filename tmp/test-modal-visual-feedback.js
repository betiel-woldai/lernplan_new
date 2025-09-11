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
      const currentStatus = await page.locator('text=/Status:.*Abgeschlossen|Status:.*Ausstehend/').first().textContent();\n      console.log('📊 Current status:', currentStatus);\n      \n      // Find and click the status toggle button\n      const statusToggleButton = await page.locator('button:has-text(\"Als abgeschlossen markieren\"), button:has-text(\"Als ausstehend markieren\")').first();\n      \n      if (await statusToggleButton.isVisible()) {\n        const buttonText = await statusToggleButton.textContent();\n        console.log('🔄 Step 4: Clicking status toggle:', buttonText);\n        \n        await statusToggleButton.click();\n        await page.waitForTimeout(1000); // Wait for UI update\n        \n        console.log('📸 Step 5: Status toggled, taking screenshot');\n        await page.screenshot({ path: 'tmp/modal-test-03-status-toggled.png', fullPage: true });\n        \n        // Save the changes\n        const saveButton = await page.locator('button:has-text(\"Save Changes\"), button:has-text(\"Speichern\")').first();\n        if (await saveButton.isVisible()) {\n          console.log('💾 Step 6: Saving changes...');\n          await saveButton.click();\n          \n          // Wait for modal to close and calendar to update\n          await page.waitForTimeout(3000);\n          \n          console.log('🎨 Step 7: Changes saved, checking visual update in calendar');\n          await page.screenshot({ path: 'tmp/modal-test-04-after-save.png', fullPage: true });\n          \n          // Check if the session visual changed in calendar\n          const updatedSession = await page.locator('[title*=\"Mathe\"]').first();\n          const sessionStyles = await updatedSession.evaluate(el => {\n            const computedStyle = window.getComputedStyle(el);\n            return {\n              backgroundColor: computedStyle.backgroundColor,\n              borderColor: computedStyle.borderLeftColor || computedStyle.borderColor,\n              color: computedStyle.color\n            };\n          });\n          \n          console.log('🎨 Session visual styles after update:', sessionStyles);\n          \n          // Test toggling back\n          console.log('🔄 Step 8: Testing toggle back to original state...');\n          await updatedSession.click();\n          await page.waitForTimeout(2000);\n          \n          const statusToggleButton2 = await page.locator('button:has-text(\"Als abgeschlossen markieren\"), button:has-text(\"Als ausstehend markieren\")').first();\n          if (await statusToggleButton2.isVisible()) {\n            await statusToggleButton2.click();\n            await page.waitForTimeout(1000);\n            \n            const saveButton2 = await page.locator('button:has-text(\"Save Changes\"), button:has-text(\"Speichern\")').first();\n            if (await saveButton2.isVisible()) {\n              await saveButton2.click();\n              await page.waitForTimeout(3000);\n              \n              console.log('🎨 Step 9: Toggled back, final screenshot');\n              await page.screenshot({ path: 'tmp/modal-test-05-toggled-back.png', fullPage: true });\n            }\n          }\n          \n          console.log('✅ Visual feedback test completed!');\n          console.log('📝 Expected behavior:');\n          console.log('  - Completed sessions should be GREEN');\n          console.log('  - Pending sessions should show SUBJECT COLOR');\n          console.log('  - Changes should be visible IMMEDIATELY after save');\n          \n        } else {\n          console.log('❌ Save button not found');\n        }\n      } else {\n        console.log('❌ Status toggle button not found');\n      }\n    } else {\n      console.log('❌ No Mathe session found to test with');\n    }\n    \n  } catch (error) {\n    console.error('❌ Modal visual feedback test error:', error);\n  } finally {\n    await browser.close();\n  }\n}\n\ntestModalVisualFeedback();