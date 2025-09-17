import { test, expect } from '@playwright/test';

test('Session modal modifications - delete button and no timeline', async ({ page }) => {
  console.log('🧪 Testing SessionEditModal modifications');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Close any open modals first
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Take initial screenshot
  await page.screenshot({
    path: 'tmp/modal-test-01-initial.png',
    fullPage: true
  });

  // Look for a Deep Work session to click on
  console.log('🎯 Looking for learning session to open modal...');

  // Try different selectors for Deep Work sessions
  const learningSessionElements = page.locator('text="Deep Wor"');
  const sessionCount = await learningSessionElements.count();
  console.log(`📅 Found ${sessionCount} learning sessions`);

  if (sessionCount > 0) {
    const firstSession = learningSessionElements.first();

    if (await firstSession.isVisible()) {
      console.log('📅 Clicking on learning session to open modal...');

      // Click on the session to open the modal
      await firstSession.click();

      // Wait for modal to appear
      await page.waitForTimeout(2000);

      // Take screenshot after modal opens
      await page.screenshot({
        path: 'tmp/modal-test-02-modal-opened.png',
        fullPage: true
      });

      // Check if the modal is visible
      const modal = page.locator('.bg-white.rounded-xl.shadow-2xl');
      const modalVisible = await modal.isVisible();
      console.log(`📋 Modal visible: ${modalVisible}`);

      if (modalVisible) {
        // Check for Timeline Information section (should NOT exist)
        const timelineSection = page.locator('h4:has-text("Timeline Information")');
        const timelineExists = await timelineSection.isVisible();
        console.log(`📅 Timeline Information section exists: ${timelineExists}`);

        if (!timelineExists) {
          console.log('✅ SUCCESS: Timeline Information section has been removed');
        } else {
          console.log('❌ ISSUE: Timeline Information section still exists');
        }

        // Check for delete button (should exist in bottom left)
        const deleteButton = page.locator('button:has-text("Delete")');
        const deleteButtonVisible = await deleteButton.isVisible();
        console.log(`🗑️ Delete button visible: ${deleteButtonVisible}`);

        if (deleteButtonVisible) {
          console.log('✅ SUCCESS: Delete button is present');

          // Check if delete button contains trash icon
          const trashIcon = page.locator('button:has-text("Delete") svg');
          const trashIconVisible = await trashIcon.isVisible();
          console.log(`🗑️ Trash icon visible: ${trashIconVisible}`);

        } else {
          console.log('❌ ISSUE: Delete button is not visible');
        }

        // Check button layout (delete on left, cancel and save on right)
        const actionButtonsContainer = page.locator('.flex.items-center.justify-between');
        const actionButtonsExists = await actionButtonsContainer.isVisible();
        console.log(`🔲 Action buttons container with proper layout: ${actionButtonsExists}`);

        // Take final screenshot of the modal
        await page.screenshot({
          path: 'tmp/modal-test-03-final-modal.png',
          fullPage: true
        });

        // Close the modal
        const modalCloseButton = page.locator('button:has-text("Cancel")').first();
        if (await modalCloseButton.isVisible()) {
          await modalCloseButton.click();
        }

      } else {
        console.log('❌ Modal did not open');
      }

    } else {
      console.log('❌ Learning session not visible');
    }
  } else {
    console.log('❌ No learning sessions found');
  }

  console.log('✅ Session modal modifications test completed');
  console.log('📸 Screenshots saved: tmp/modal-test-*.png');
});