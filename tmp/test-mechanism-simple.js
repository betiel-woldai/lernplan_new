const { chromium } = require('playwright');

async function testMechanismSimple() {
  const browser = await chromium.launch({ headless: false, slowMo: 3000 });
  const page = await browser.newPage();

  try {
    console.log('🔍 TESTING: Mark/Unmark XP Mechanism');

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ path: 'tmp/mechanism-01-start.png', fullPage: true });

    // Get initial XP value
    const xpElement = page.locator('text=/.*XP Total/');
    const initialXP = await xpElement.textContent();
    console.log(`📊 INITIAL XP: ${initialXP}`);

    // Create a new session to test with
    console.log('📝 STEP 1: Creating a test session...');

    const startButton = page.locator('button:has-text("Start")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Select Mathe subject
      const matheOption = page.locator('text="Mathe"');
      if (await matheOption.isVisible()) {
        await matheOption.click();
        await page.waitForTimeout(1000);

        // Click Start Session
        const startSessionButton = page.locator('button:has-text("Start Session")');
        await startSessionButton.click();
        await page.waitForTimeout(5000); // Let it run for 5 seconds

        console.log('⏱️ Session running for 5 seconds...');
        await page.screenshot({ path: 'tmp/mechanism-02-running.png', fullPage: true });

        // Stop the session
        const stopButton = page.locator('button:has-text("Stop"), button:has-text("Beenden")');
        if (await stopButton.first().isVisible()) {
          await stopButton.first().click();
          await page.waitForTimeout(2000);

          // Complete the session in modal
          const saveButton = page.locator('button:has-text("Session speichern"), button:has-text("Save")');
          if (await saveButton.first().isVisible()) {
            console.log('💾 STEP 2: Completing session...');
            await saveButton.first().click();
            await page.waitForTimeout(3000);

            await page.screenshot({ path: 'tmp/mechanism-03-completed.png', fullPage: true });

            // Check XP after completion
            const afterCompleteXP = await xpElement.textContent();
            console.log(`📊 XP AFTER COMPLETING: ${afterCompleteXP}`);

            if (afterCompleteXP !== initialXP) {
              console.log('✅ XP INCREASED - Session completion is working!');

              console.log('🔄 STEP 3: Now testing unmarking...');

              // Now we need to find the completed session and unmark it
              // This is the tricky part - we need to find how to unmark sessions

              // Take a screenshot to see current state
              await page.screenshot({ path: 'tmp/mechanism-04-looking-for-unmark.png', fullPage: true });

              console.log('⏳ Pausing for 15 seconds to manually inspect and test unmarking...');
              await page.waitForTimeout(15000);

              // Check final XP
              const finalXP = await xpElement.textContent();
              console.log(`📊 FINAL XP: ${finalXP}`);

            } else {
              console.log('❌ XP NOT INCREASED - Session completion is NOT working!');
            }
          } else {
            console.log('❌ Could not find save button');
          }
        } else {
          console.log('❌ Could not find stop button');
        }
      } else {
        console.log('❌ Could not find Mathe subject option');
      }
    } else {
      console.log('❌ Could not find Start button');
    }

    await page.screenshot({ path: 'tmp/mechanism-05-final.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'tmp/mechanism-error.png', fullPage: true });
  } finally {
    console.log('🏁 Test completed - check the screenshots to see what happened');
    await browser.close();
  }
}

testMechanismSimple();