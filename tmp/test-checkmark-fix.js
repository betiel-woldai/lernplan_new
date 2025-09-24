const { chromium } = require('playwright');

async function testCheckmarkFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing checkmark fix for old sessions...');

    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Take screenshot of current state
    await page.screenshot({ path: 'tmp/01-before-checkmark-test.png', fullPage: true });
    console.log('📸 Current state: tmp/01-before-checkmark-test.png');

    // Look for any completed sessions (green checkmarks)
    const completedSessions = page.locator('[class*="text-green"], .text-green-600, .text-green-500');
    const sessionCount = await completedSessions.count();
    console.log(`Found ${sessionCount} completed sessions`);

    // Look for any sessions in sidebar that might have checkmarks
    const sessionsBox = page.locator('text="Sessions"').locator('..').locator('..');
    if (await sessionsBox.isVisible()) {
      console.log('📊 Found Sessions box in sidebar');
      await sessionsBox.screenshot({ path: 'tmp/02-sessions-sidebar.png' });
      console.log('📸 Sessions sidebar: tmp/02-sessions-sidebar.png');
    }

    // Look for calendar sessions
    const calendarSessions = page.locator('.calendar-event, [data-testid*="session"], .fc-event');
    const calendarSessionCount = await calendarSessions.count();
    console.log(`Found ${calendarSessionCount} calendar sessions`);

    if (calendarSessionCount > 0) {
      // Try clicking on the first session
      try {
        const firstSession = calendarSessions.first();
        await firstSession.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'tmp/03-after-session-click.png', fullPage: true });
        console.log('📸 After session click: tmp/03-after-session-click.png');

        // Check if any completion toggles are available
        const toggleButtons = page.locator('button:has-text("Als abgeschlossen markieren"), button:has-text("abgeschlossen"), [role="button"]:has([class*="check"])');
        const toggleCount = await toggleButtons.count();
        console.log(`Found ${toggleCount} potential toggle buttons`);

      } catch (clickError) {
        console.log('Could not interact with sessions - this is expected for read-only sessions');
      }
    }

    // Check browser console for any errors
    const consoleMessages = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    if (consoleMessages.length > 0) {
      console.log('❌ Console errors found:');
      consoleMessages.forEach(msg => console.log('  -', msg));
    } else {
      console.log('✅ No console errors detected');
    }

    // Final screenshot
    await page.screenshot({ path: 'tmp/04-final-state.png', fullPage: true });
    console.log('📸 Final state: tmp/04-final-state.png');

    console.log('✅ Checkmark test completed');

    // Keep browser open briefly
    console.log('🔍 Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error during test:', error);
  }

  await browser.close();
}

testCheckmarkFix();