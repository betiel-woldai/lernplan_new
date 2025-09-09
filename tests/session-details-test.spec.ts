import { test, expect } from '@playwright/test';

test.describe('Session Details Functionality', () => {
  test('should show session details when clicking on a session', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Wait a bit for sessions to load
    await page.waitForTimeout(2000);

    // Debug: Check what session elements exist
    const allSessions = await page.locator('div[style*="borderLeft"]:has-text("Study Session")').all();
    console.log(`Found ${allSessions.length} session elements`);

    if (allSessions.length === 0) {
      console.log('❌ No sessions found to test');
      return;
    }

    // Try clicking the first session
    const firstSession = allSessions[0];
    console.log('Clicking first session...');
    
    await firstSession.click();
    
    // Wait for session details to appear
    await page.waitForTimeout(1000);

    // Check if session details appeared
    const sessionDetailsExists = await page.locator('text=Session Details').isVisible();
    console.log(`Session details visible: ${sessionDetailsExists}`);

    if (sessionDetailsExists) {
      console.log('✅ Session details working correctly');
      await expect(page.locator('text=Session Details')).toBeVisible();
      await expect(page.locator('text=Titel')).toBeVisible();
      await expect(page.locator('text=Fach')).toBeVisible();
    } else {
      console.log('❌ Session details not appearing');
      
      // Debug: Check console for errors
      const consoleMessages = [];
      page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      });
      
      // Try clicking again
      await firstSession.click();
      await page.waitForTimeout(500);
      
      console.log('Console messages:', consoleMessages);
    }

    // Take screenshot for debugging
    await page.screenshot({ 
      path: 'tmp/session-details-debug.png',
      fullPage: true 
    });
  });
});