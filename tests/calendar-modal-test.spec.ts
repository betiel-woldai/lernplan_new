import { test, expect } from '@playwright/test';

test('Calendar session modal - right-click to open edit modal', async ({ page }) => {
  console.log('🧪 Testing CalendarSessionEditModal via right-click');

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
    path: 'tmp/calendar-modal-01-initial.png',
    fullPage: true
  });

  console.log('📅 Looking for session to right-click on...');

  // Look for a Deep Work session to right-click on
  const deepWorkText = page.locator(':text("Deep")').first();
  const deepWorkExists = await deepWorkText.isVisible();
  console.log(`🔍 Deep Work session visible: ${deepWorkExists}`);

  if (deepWorkExists) {
    console.log('🎯 Right-clicking on Deep Work session...');

    // Right-click on the session
    await deepWorkText.click({ button: 'right' });
    await page.waitForTimeout(2000);

    // Take screenshot after right-click
    await page.screenshot({
      path: 'tmp/calendar-modal-02-after-rightclick.png',
      fullPage: true
    });

    // Look for "Bearbeiten" option in context menu
    const editOption = page.locator('text="Bearbeiten"');
    const editVisible = await editOption.isVisible();
    console.log(`📝 Edit option visible: ${editVisible}`);

    if (editVisible) {
      console.log('📝 Clicking on Bearbeiten...');
      await editOption.click();
      await page.waitForTimeout(3000);

      // Take screenshot after clicking edit
      await page.screenshot({
        path: 'tmp/calendar-modal-03-edit-modal.png',
        fullPage: true
      });

      // Check if edit modal is visible
      const editModal = page.locator('h2:has-text("Session bearbeiten")');
      const editModalVisible = await editModal.isVisible();
      console.log(`📋 Edit modal visible: ${editModalVisible}`);

      if (editModalVisible) {
        console.log('✅ Edit modal opened successfully!');

        // Check for Timeline Information (should NOT exist)
        const timelineHeader = page.locator('text="Timeline-Informationen"');
        const timelineExists = await timelineHeader.isVisible();
        console.log(`📅 Timeline section exists: ${timelineExists}`);

        // Check for Delete button
        const deleteButton = page.locator('button:has-text("Session löschen")');
        const deleteExists = await deleteButton.isVisible();
        console.log(`🗑️ Delete button exists: ${deleteExists}`);

        // Check for Save button
        const saveButton = page.locator('button:has-text("Änderungen speichern")');
        const saveExists = await saveButton.isVisible();
        console.log(`💾 Save button exists: ${saveExists}`);

        // Test results
        if (!timelineExists) {
          console.log('✅ SUCCESS: Timeline Information section removed from CalendarSessionEditModal');
        } else {
          console.log('❌ FAIL: Timeline Information section still exists in CalendarSessionEditModal');
        }

        if (deleteExists) {
          console.log('✅ SUCCESS: Delete button exists in CalendarSessionEditModal');
        } else {
          console.log('❌ FAIL: Delete button missing in CalendarSessionEditModal');
        }

        // Take final screenshot
        await page.screenshot({
          path: 'tmp/calendar-modal-04-final.png',
          fullPage: true
        });

        // Close modal
        const cancelButton = page.locator('button:has-text("Abbrechen")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }

      } else {
        console.log('❌ Edit modal did not open');
      }

    } else {
      console.log('❌ Edit option not found in context menu');
    }

  } else {
    console.log('❌ No Deep Work sessions found');
  }

  console.log('✅ Calendar modal test completed');
});