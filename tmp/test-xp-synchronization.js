const { chromium } = require('playwright');

async function testXPSynchronization() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing XP Synchronization Fix');

    // Navigate to dashboard
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Take initial screenshot to see current state
    await page.screenshot({ path: 'tmp/test-01-initial-state.png', fullPage: true });
    console.log('📸 Initial state captured');

    // Get initial XP value
    const xpElement = page.locator('[data-testid="total-xp"]');
    const initialXP = await xpElement.textContent();
    console.log(`💎 Initial XP: ${initialXP}`);

    // Check if we can find any sessions to interact with
    // Look for session completion buttons or checkmark functionality
    const sessionElements = page.locator('button:has-text("Start"), .session-item, .calendar-event');
    const sessionCount = await sessionElements.count();

    console.log(`📅 Found ${sessionCount} interactive session elements`);

    if (sessionCount > 0) {
      // Try to start a new session to test completion
      const startButton = page.locator('button:has-text("Start")').first();
      if (await startButton.isVisible()) {
        console.log('🟢 Found Start button, attempting to start session');
        await startButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'tmp/test-02-session-started.png', fullPage: true });
        console.log('📸 Session started');

        // Look for stop/complete button
        const stopButton = page.locator('button:has-text("Stop"), button:has-text("Beenden"), button:has-text("Complete")');
        if (await stopButton.first().isVisible()) {
          console.log('🛑 Found stop button, completing session');
          await stopButton.first().click();
          await page.waitForTimeout(2000);

          // Look for completion modal
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Speichern")');
          if (await saveButton.first().isVisible()) {
            console.log('💾 Found save button in completion modal');
            await saveButton.first().click();
            await page.waitForTimeout(3000);

            // Check XP after completion
            const newXP = await xpElement.textContent();
            console.log(`💎 XP after completion: ${newXP}`);

            await page.screenshot({ path: 'tmp/test-03-after-completion.png', fullPage: true });
            console.log('📸 After completion');

            // Test if XP actually increased
            if (newXP !== initialXP) {
              console.log('✅ XP changed after session completion - FIX WORKING!');
            } else {
              console.log('❌ XP did not change after completion');
            }
          }
        }
      }
    }

    // Test by trying to interact with existing sessions in calendar
    console.log('🔍 Looking for existing calendar sessions to test unmarking...');

    // Try different approaches to find sessions
    const calendarDays = page.locator('.calendar-day, [data-date]');
    const dayCount = await calendarDays.count();
    console.log(`📅 Found ${dayCount} calendar days`);

    // Look for any completed sessions (should have checkmarks or green indicators)
    const completedIndicators = page.locator('.text-green-500, .text-green-600, [class*="green"]');
    const completedCount = await completedIndicators.count();
    console.log(`✅ Found ${completedCount} completed session indicators`);

    // Final screenshot
    await page.screenshot({ path: 'tmp/test-04-final-state.png', fullPage: true });
    console.log('📸 Final state captured');

    console.log('🎯 Test Summary:');
    console.log(`   Initial XP: ${initialXP}`);
    console.log(`   Sessions found: ${sessionCount}`);
    console.log(`   Completed indicators: ${completedCount}`);

    // Wait to inspect manually
    console.log('⏱️  Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'tmp/test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

testXPSynchronization();