import { test, expect } from '@playwright/test';

test.describe('Session Click Debug', () => {
  test('should debug session clicking mechanism', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Wait for calendar to load
    await page.waitForTimeout(3000);

    console.log('Looking for calendar sessions...');

    // Try different selectors to find sessions
    const selectors = [
      'div[style*="borderLeft"]',  // Original selector
      'div[title*="Study Session"]',  // Title-based
      'div.cursor-pointer:has-text("Study")',  // Text-based
      '[title*="Study Session"]'  // Any element with study session title
    ];

    for (const selector of selectors) {
      const elements = await page.locator(selector).count();
      console.log(`Selector "${selector}": found ${elements} elements`);
    }

    // Try to find any clickable calendar elements
    const allClickable = await page.locator('.cursor-pointer').count();
    console.log(`Total clickable elements: ${allClickable}`);

    // Look specifically for sessions using the title attribute
    const sessionElements = page.locator('[title*="Study Session"]');
    const sessionCount = await sessionElements.count();
    console.log(`Sessions with title: ${sessionCount}`);

    if (sessionCount > 0) {
      console.log('Found sessions! Testing click functionality...');
      
      // Get the first session
      const firstSession = sessionElements.first();
      const title = await firstSession.getAttribute('title');
      console.log(`First session title: ${title}`);
      
      // Click the session
      await firstSession.click();
      console.log('Session clicked!');
      
      // Wait for any changes
      await page.waitForTimeout(1000);
      
      // Check if session details appeared
      const detailsVisible = await page.locator('text=Session Details').isVisible();
      console.log(`Session Details visible: ${detailsVisible}`);
      
      if (!detailsVisible) {
        // Check if the selectedSession state is being set (via console)
        await page.evaluate(() => {
          console.log('Checking for selectedSession in window...');
        });
      }
      
      // Take screenshot regardless
      await page.screenshot({ 
        path: 'tmp/session-click-debug.png',
        fullPage: true 
      });
      
      if (detailsVisible) {
        console.log('✅ Session details are working!');
      } else {
        console.log('❌ Session details not appearing after click');
      }
      
    } else {
      console.log('❌ No sessions found in calendar');
      
      // Take screenshot to see what's on screen
      await page.screenshot({ 
        path: 'tmp/no-sessions-debug.png',
        fullPage: true 
      });
    }
  });
});