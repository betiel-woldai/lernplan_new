const { chromium } = require('playwright');

async function createAndCompleteSession() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Creating test session and testing XP fix...');

    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Wait for calendar to load
    await page.waitForSelector('.calendar, [data-testid="calendar"]', { timeout: 10000 });
    console.log('📅 Calendar loaded');

    // Take screenshot of initial state
    await page.screenshot({ path: 'tmp/01-initial-state.png', fullPage: true });
    console.log('📸 Initial state saved: tmp/01-initial-state.png');

    // Check current XP level
    try {
      const levelText = await page.locator('text=/Level.*\d+|Level.*0/').first().textContent();
      console.log(`📊 Current level: ${levelText}`);
    } catch (e) {
      console.log('Could not find level text');
    }

    // Look for "Session" or "+" button to create a session
    const sessionButton = page.locator('text="Session", text="+", [data-testid*="add"], button:has-text("Session")').first();
    if (await sessionButton.isVisible({ timeout: 5000 })) {
      console.log('🎯 Found Session button, clicking...');
      await sessionButton.click();
      await page.waitForTimeout(2000);

      // Fill session form if it appears
      const titleInput = page.locator('input[name="title"], input[placeholder*="titel"], input[placeholder*="title"]').first();
      if (await titleInput.isVisible({ timeout: 3000 })) {
        await titleInput.fill('Test XP Session');
        console.log('📝 Filled session title');

        // Look for duration input
        const durationInput = page.locator('input[name="duration"], input[placeholder*="dauer"], input[type="number"]').first();
        if (await durationInput.isVisible({ timeout: 2000 })) {
          await durationInput.fill('30'); // 30 minutes = should give 20 XP base + 4 XP bonus = 24 XP
          console.log('⏱️ Set duration to 30 minutes');
        }

        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Speichern"), button:has-text("Erstellen")').first();
        if (await submitButton.isVisible({ timeout: 2000 })) {
          await submitButton.click();
          console.log('✅ Session created');
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('ℹ️ No obvious session creation button found. Looking for existing sessions...');
    }

    // Take screenshot after potential session creation
    await page.screenshot({ path: 'tmp/02-after-session-creation.png', fullPage: true });
    console.log('📸 After session creation: tmp/02-after-session-creation.png');

    // Look for any sessions to complete
    console.log('🔍 Looking for sessions to complete...');

    // Try multiple selectors for session elements
    const sessionSelectors = [
      '.session',
      '.calendar-event',
      '[data-testid*="session"]',
      '.fc-event',
      'div:has-text("Test XP Session")',
      'div:has-text("Mat")',
      'div:has-text("AUTO")'
    ];

    let sessionFound = false;
    for (const selector of sessionSelectors) {
      const sessions = await page.locator(selector).all();
      if (sessions.length > 0) {
        console.log(`📋 Found ${sessions.length} sessions with selector: ${selector}`);
        sessionFound = true;

        // Try to click on the first session to see if we can complete it
        try {
          await sessions[0].click();
          await page.waitForTimeout(1000);
          console.log('🖱️ Clicked on session');
        } catch (e) {
          console.log('Could not click session');
        }
        break;
      }
    }

    if (!sessionFound) {
      console.log('⚠️ No sessions found with common selectors');

      // Try to click anywhere on calendar to create session
      console.log('🎯 Trying to click on calendar to create session...');
      const today = new Date();
      const todaySelector = `[data-date="${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}"]`;

      const todayCell = page.locator(todaySelector);
      if (await todayCell.isVisible({ timeout: 2000 })) {
        await todayCell.click();
        console.log('📅 Clicked on today\'s date');
        await page.waitForTimeout(2000);
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'tmp/03-final-state.png', fullPage: true });
    console.log('📸 Final state: tmp/03-final-state.png');

    console.log('✅ Test session completed. Check screenshots for results.');

    // Keep browser open for manual testing
    console.log('🔍 Browser will stay open for 30 seconds for manual testing...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error during test:', error);
  }

  await browser.close();
}

createAndCompleteSession();