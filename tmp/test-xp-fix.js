const { chromium } = require('playwright');

async function testXPFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Testing XP awarding fix...');

    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'tmp/before-completion.png', fullPage: true });
    console.log('📸 Screenshot saved: tmp/before-completion.png');

    // Look for session to complete (check for any incomplete sessions)
    const sessions = await page.locator('[data-testid*="session"], .session, .calendar-event').all();
    console.log(`Found ${sessions.length} sessions on page`);

    // Take a screenshot and wait
    await page.screenshot({ path: 'tmp/current-dashboard.png', fullPage: true });
    console.log('📸 Current dashboard screenshot saved: tmp/current-dashboard.png');

    // Wait for user to manually test or look for specific session completion elements
    console.log('✅ Test setup complete. Check tmp/current-dashboard.png to see current state.');
    console.log('🔍 Looking for level info...');

    // Try to find level information
    const levelInfo = await page.locator('text=/Level|XP|level/i').all();
    console.log(`Found ${levelInfo.length} level-related elements`);

    // Extract current XP if visible
    try {
      const xpText = await page.locator('text=/\d+.*XP|Level.*\d+/i').first().textContent();
      console.log(`Current XP/Level text: ${xpText}`);
    } catch (e) {
      console.log('Could not find XP text on page');
    }

  } catch (error) {
    console.error('Error during test:', error);
  }

  await browser.close();
}

testXPFix();