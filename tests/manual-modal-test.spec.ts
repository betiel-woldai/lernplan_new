import { test, expect } from '@playwright/test';

test('Manual session modal test - click on specific date session', async ({ page }) => {
  console.log('🧪 Testing SessionEditModal by clicking on specific session');

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
    path: 'tmp/manual-modal-01-initial.png',
    fullPage: true
  });

  console.log('📅 Looking for sessions on September 17th or 18th...');

  // Try to click on the day 17 or 18 where sessions are visible
  const day17 = page.locator('text="17"').first();
  const day18 = page.locator('text="18"').first();

  // Look for any text containing "Deep" or "Wor" in the calendar area
  const deepWorkText = page.locator(':text("Deep")');
  const deepWorkCount = await deepWorkText.count();
  console.log(`🔍 Found ${deepWorkCount} elements containing "Deep"`);

  if (deepWorkCount > 0) {
    const firstDeepWork = deepWorkText.first();
    console.log('🎯 Clicking on first Deep Work session...');

    await firstDeepWork.click();
    await page.waitForTimeout(3000);

    // Take screenshot after click
    await page.screenshot({
      path: 'tmp/manual-modal-02-after-click.png',
      fullPage: true
    });

    // Check if modal is visible
    const modal = page.locator('.rounded-xl.shadow-2xl');
    const modalVisible = await modal.isVisible();
    console.log(`📋 Modal visible: ${modalVisible}`);

    if (modalVisible) {
      console.log('✅ Modal opened successfully!');

      // Check for Timeline Information (should NOT exist)
      const timelineHeader = page.locator('text="Timeline Information"');
      const timelineExists = await timelineHeader.isVisible();
      console.log(`📅 Timeline section exists: ${timelineExists}`);

      // Check for Delete button
      const deleteButton = page.locator('button:has-text("Delete")');
      const deleteExists = await deleteButton.isVisible();
      console.log(`🗑️ Delete button exists: ${deleteExists}`);

      // Check for Save button
      const saveButton = page.locator('button:has-text("Save Changes")');
      const saveExists = await saveButton.isVisible();
      console.log(`💾 Save button exists: ${saveExists}`);

      // Check for Cancel button
      const cancelButton = page.locator('button:has-text("Cancel")');
      const cancelExists = await cancelButton.isVisible();
      console.log(`❌ Cancel button exists: ${cancelExists}`);

      // Test results
      if (!timelineExists) {
        console.log('✅ SUCCESS: Timeline Information section removed');
      } else {
        console.log('❌ FAIL: Timeline Information section still exists');
      }

      if (deleteExists) {
        console.log('✅ SUCCESS: Delete button added');
      } else {
        console.log('❌ FAIL: Delete button missing');
      }

      // Take final screenshot
      await page.screenshot({
        path: 'tmp/manual-modal-03-modal-details.png',
        fullPage: true
      });

      // Close modal
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
      }

    } else {
      console.log('❌ Modal did not open');
    }

  } else {
    console.log('❌ No Deep Work sessions found');
  }

  console.log('✅ Manual modal test completed');
});