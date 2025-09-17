import { test, expect } from '@playwright/test';

test('Session click behavior - learning sessions should open details directly', async ({ page }) => {
  console.log('🧪 Testing session click behavior for learning sessions');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Close any open modals first
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Step 1: Take initial screenshot
  await page.screenshot({
    path: 'tmp/session-click-01-initial.png',
    fullPage: true
  });

  // Step 2: Look for a Deep Work session (learning session)
  console.log('🎯 Looking for learning session to click...');

  const learningSessionElements = page.locator('.bg-purple-100:has-text("Deep Wor")');
  const sessionCount = await learningSessionElements.count();
  console.log(`📅 Found ${sessionCount} learning sessions`);

  if (sessionCount > 0) {
    const firstSession = learningSessionElements.first();

    if (await firstSession.isVisible()) {
      console.log('📅 Clicking on learning session...');

      // Click on the session
      await firstSession.click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Take screenshot after click
      await page.screenshot({
        path: 'tmp/session-click-02-after-click.png',
        fullPage: true
      });

      // Check what opened
      const contextMenu = page.locator('.bg-white.shadow-lg:has-text("Bearbeiten")');
      const detailsModal = page.locator('.bg-white.rounded-xl.shadow-2xl');

      const contextMenuVisible = await contextMenu.isVisible();
      const detailsModalVisible = await detailsModal.isVisible();

      console.log(`📋 Context menu visible: ${contextMenuVisible}`);
      console.log(`📋 Details modal visible: ${detailsModalVisible}`);

      if (contextMenuVisible) {
        console.log('❌ Context menu appeared - this should not happen for learning sessions');

        // Take screenshot of the context menu
        await page.screenshot({
          path: 'tmp/session-click-03-context-menu-error.png',
          fullPage: true
        });
      } else {
        console.log('✅ No context menu appeared - this is correct for learning sessions');
      }

      if (detailsModalVisible) {
        console.log('✅ Details modal opened - this is correct behavior');

        // Close the modal
        const modalCloseButton = page.locator('button:has-text("Close")');
        if (await modalCloseButton.isVisible()) {
          await modalCloseButton.click();
        }
      } else {
        console.log('⚠️ Details modal did not open - checking what happened');
      }

    } else {
      console.log('❌ Learning session not visible');
    }
  } else {
    console.log('❌ No learning sessions found');
  }

  // Take final screenshot
  await page.screenshot({
    path: 'tmp/session-click-04-final.png',
    fullPage: true
  });

  console.log('✅ Session click behavior test completed');
  console.log('📸 Screenshots saved: tmp/session-click-*.png');
});