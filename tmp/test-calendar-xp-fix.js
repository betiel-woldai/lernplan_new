const { chromium } = require('playwright');

async function testCalendarXPFix() {
  const browser = await chromium.launch({ headless: false, slowMo: 2000 });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing Calendar XP Add/Subtract Fix');

    // Navigate to dashboard
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Take initial screenshot - should show 0 XP
    await page.screenshot({ path: 'tmp/calendar-test-01-initial.png', fullPage: true });

    // Get initial XP
    const xpElement = page.locator('[data-testid="total-xp"]');
    const initialXP = await xpElement.textContent();
    console.log(`💎 Initial XP: ${initialXP}`);

    // TEST 1: Find a calendar session to mark as completed
    console.log('🎯 TEST 1: Looking for calendar sessions to mark as completed...');

    // Look for session elements that can be clicked (past sessions that are not future)
    // We need to find sessions from previous days that are not marked as completed yet
    const sessionElements = page.locator('[class*="calendar-session"], [data-session-id]');
    const sessionCount = await sessionElements.count();
    console.log(`Found ${sessionCount} potential session elements`);

    if (sessionCount === 0) {
      // Try alternative selectors for calendar sessions
      const alternativeElements = page.locator('div').filter({ hasText: 'Vorlesungsfr' });
      const altCount = await alternativeElements.count();
      console.log(`Found ${altCount} alternative session elements`);

      if (altCount > 0) {
        console.log('🔍 Trying to interact with session element...');
        await alternativeElements.first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'tmp/calendar-test-02-session-clicked.png', fullPage: true });
      }
    }

    // Look for any clickable areas that might be sessions
    const clickableElements = page.locator('div[title*="Vorlesungsfr"], div[title*="Mat"]');
    const clickableCount = await clickableElements.count();
    console.log(`Found ${clickableCount} clickable session elements`);

    let foundInteractiveSession = false;

    if (clickableCount > 0) {
      for (let i = 0; i < Math.min(3, clickableCount); i++) {
        try {
          console.log(`🔍 Trying to click session element ${i + 1}...`);
          const element = clickableElements.nth(i);

          // Try different interaction methods
          await element.click();
          await page.waitForTimeout(1500);

          // Check if any context menu or modal appeared
          const contextMenu = page.locator('[role="menu"], .context-menu, .modal');
          const menuCount = await contextMenu.count();

          if (menuCount > 0) {
            console.log('✅ Found context menu or modal!');
            foundInteractiveSession = true;

            await page.screenshot({ path: `tmp/calendar-test-03-context-${i}.png`, fullPage: true });

            // Look for completion toggle options
            const completeOptions = page.locator('text*="complete", text*="Mark as", button:has-text("✓")');
            const completeCount = await completeOptions.count();

            if (completeCount > 0) {
              console.log('🎯 Found completion option! Clicking...');
              await completeOptions.first().click();
              await page.waitForTimeout(3000);

              // Check XP after marking complete
              const newXP = await xpElement.textContent();
              console.log(`💎 XP after marking complete: ${newXP}`);

              await page.screenshot({ path: 'tmp/calendar-test-04-after-complete.png', fullPage: true });

              if (newXP !== initialXP) {
                console.log('✅ XP ADDING WORKS - XP increased!');

                // Now test unmarking to subtract XP
                console.log('🔄 TEST 2: Testing XP subtraction by unmarking...');

                // Try to unmark the same session
                await element.click();
                await page.waitForTimeout(1500);

                const unmarkOptions = page.locator('text*="unmark", text*="incomplete", button:has-text("✗")');
                const unmarkCount = await unmarkOptions.count();

                if (unmarkCount > 0) {
                  await unmarkOptions.first().click();
                  await page.waitForTimeout(3000);

                  const finalXP = await xpElement.textContent();
                  console.log(`💎 XP after unmarking: ${finalXP}`);

                  await page.screenshot({ path: 'tmp/calendar-test-05-after-unmark.png', fullPage: true });

                  if (finalXP === initialXP) {
                    console.log('✅ XP SUBTRACTION WORKS - XP returned to initial value!');
                  } else {
                    console.log(`❌ XP SUBTRACTION FAILED - Expected: ${initialXP}, Got: ${finalXP}`);
                  }
                } else {
                  console.log('❌ Could not find unmark option');
                }
              } else {
                console.log('❌ XP ADDING FAILED - XP did not increase');
              }
              break;
            }
          }

          // Close any opened elements
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);

        } catch (error) {
          console.log(`⚠️ Error with element ${i + 1}:`, error.message);
        }
      }
    }

    if (!foundInteractiveSession) {
      console.log('❌ Could not find interactive calendar sessions to test');
      console.log('💡 This might be because all visible sessions are in the future or already completed');
    }

    // Final screenshot
    await page.screenshot({ path: 'tmp/calendar-test-06-final.png', fullPage: true });

    console.log('🏁 Calendar XP test completed');
    console.log('⏱️ Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'tmp/calendar-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testCalendarXPFix();