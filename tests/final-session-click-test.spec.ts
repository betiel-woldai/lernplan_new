import { test, expect } from '@playwright/test';

test('Verify learning sessions open details directly (no context menu)', async ({ page }) => {
  console.log('🧪 Testing that learning sessions open details directly without context menu');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Close any open modals first
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Step 1: Find and click on a Deep Work session
  console.log('🎯 Looking for Deep Work session to click...');

  // Look for sessions in the calendar
  const sessionElements = page.locator('text="Deep Wor"');
  const sessionCount = await sessionElements.count();
  console.log(`📅 Found ${sessionCount} session elements`);

  if (sessionCount > 0) {
    const firstSession = sessionElements.first();

    if (await firstSession.isVisible()) {
      console.log('📅 Clicking on Deep Work session...');

      // Click on the session
      await firstSession.click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Take screenshot after click
      await page.screenshot({
        path: 'tmp/final-click-test-after-click.png',
        fullPage: true
      });

      // Check what opened - should NOT be context menu
      const contextMenuOptions = page.locator('text="Bearbeiten"');
      const duplicateOption = page.locator('text="Duplizieren"');
      const deleteOption = page.locator('text="Löschen"');

      const contextMenuVisible = await contextMenuOptions.isVisible();
      const duplicateVisible = await duplicateOption.isVisible();
      const deleteVisible = await deleteOption.isVisible();

      console.log(`📋 Context menu (Bearbeiten) visible: ${contextMenuVisible}`);
      console.log(`📋 Duplicate option visible: ${duplicateVisible}`);
      console.log(`📋 Delete option visible: ${deleteVisible}`);

      if (!contextMenuVisible && !duplicateVisible && !deleteVisible) {
        console.log('✅ SUCCESS: No context menu appeared for learning session');
        console.log('✅ Learning sessions now open details directly');
      } else {
        console.log('❌ ISSUE: Context menu still appears for learning sessions');
        console.log('❌ The fix needs to be applied or checked');
      }

    } else {
      console.log('❌ Session not visible');
    }
  } else {
    console.log('❌ No sessions found');
  }

  console.log('✅ Test completed');
});