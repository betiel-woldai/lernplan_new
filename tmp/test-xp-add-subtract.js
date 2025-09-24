const { chromium } = require('playwright');

async function testXPAddSubtract() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing XP Add/Subtract Logic');

    // Navigate to dashboard
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Take initial screenshot - should show 0 XP
    await page.screenshot({ path: 'tmp/test-01-initial-0xp.png', fullPage: true });

    // Get initial XP
    const xpElement = page.locator('[data-testid="total-xp"]');
    const initialXP = await xpElement.textContent();
    console.log(`💎 Initial XP: ${initialXP}`);

    // TEST 1: Start and complete a session to ADD XP
    console.log('🟢 TEST 1: Starting session to add XP...');
    const startButton = page.locator('button:has-text("Start")');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);

      // Select subject (Mathe)
      const matheOption = page.locator('text="Mathe"');
      if (await matheOption.isVisible()) {
        await matheOption.click();
        await page.waitForTimeout(1000);

        // Click Start Session
        const startSessionButton = page.locator('button:has-text("Start Session")');
        await startSessionButton.click();
        await page.waitForTimeout(3000);

        await page.screenshot({ path: 'tmp/test-02-session-running.png', fullPage: true });
        console.log('📸 Session running');

        // Stop session
        const stopButton = page.locator('button:has-text("Stop"), button:has-text("Beenden")');
        if (await stopButton.first().isVisible()) {
          await stopButton.first().click();
          await page.waitForTimeout(2000);

          // Save session in completion modal
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Speichern")');
          if (await saveButton.first().isVisible()) {
            await saveButton.first().click();
            await page.waitForTimeout(3000);

            // Check XP after completion
            const newXP = await xpElement.textContent();
            console.log(`💎 XP after completion: ${newXP}`);

            await page.screenshot({ path: 'tmp/test-03-after-completion.png', fullPage: true });

            if (newXP !== initialXP) {
              console.log('✅ XP ADDING WORKS - XP increased!');
            } else {
              console.log('❌ XP ADDING FAILED - XP did not increase');
            }

            // TEST 2: Try to unmark the session to SUBTRACT XP
            console.log('🔴 TEST 2: Trying to unmark session to subtract XP...');

            // Look for the completed session in the calendar or sidebar
            await page.waitForTimeout(2000);

            // Check if there are any completed session indicators
            const completedIndicators = page.locator('[class*="green"], .text-green-500, .text-green-600');
            const completedCount = await completedIndicators.count();
            console.log(`Found ${completedCount} completed session indicators`);

            if (completedCount > 0) {
              // Try right-clicking on a completed session
              await completedIndicators.first().click({ button: 'right' });
              await page.waitForTimeout(2000);

              await page.screenshot({ path: 'tmp/test-04-right-click-context.png', fullPage: true });

              // Look for unmark/incomplete option
              const unmarkOption = page.locator('text*="unmark", text*="incomplete", text*="Mark as incomplete"');
              const unmarkCount = await unmarkOption.count();
              console.log(`Found ${unmarkCount} unmark options`);

              if (unmarkCount > 0) {
                await unmarkOption.first().click();
                await page.waitForTimeout(3000);

                const finalXP = await xpElement.textContent();
                console.log(`💎 XP after unmarking: ${finalXP}`);

                await page.screenshot({ path: 'tmp/test-05-after-unmarking.png', fullPage: true });

                if (finalXP === initialXP) {
                  console.log('✅ XP SUBTRACTING WORKS - XP returned to initial value!');
                } else {
                  console.log('❌ XP SUBTRACTING FAILED - XP did not decrease properly');
                  console.log(`Expected: ${initialXP}, Got: ${finalXP}`);
                }
              } else {
                console.log('❌ Could not find unmark option in context menu');
              }
            } else {
              console.log('❌ Could not find completed session indicators to test unmarking');
            }
          }
        }
      }
    }

    await page.screenshot({ path: 'tmp/test-06-final-state.png', fullPage: true });

    console.log('🏁 XP Add/Subtract test completed');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'tmp/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testXPAddSubtract();