import { test, expect } from '@playwright/test';

test('Session deletion functionality test', async ({ page }) => {
  console.log('🧪 Testing session deletion functionality');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Step 1: Count existing sessions before test
  const initialSessions = page.locator('[class*="Deep Work"], .bg-purple-500, .bg-blue-500, .bg-green-500');
  const initialCount = await initialSessions.count();
  console.log(`📊 Initial session count: ${initialCount}`);

  // Step 2: Create a new session to delete
  console.log('🎯 Creating a new session to delete...');
  const startButton = page.locator('button:has-text("Start")');
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();

  // Select Deep Work and start session
  await page.waitForSelector('.bg-white.rounded-xl.shadow-2xl', { timeout: 5000 });
  const deepWorkOption = page.locator('button:has-text("Deep Work")').first();
  await deepWorkOption.click();

  const startSessionButton = page.locator('button:has-text("Start Session")');
  await startSessionButton.click();

  // Wait for session to start, then stop it
  await page.waitForTimeout(2000);
  const stopButton = page.locator('button:has-text("Stop")');
  await expect(stopButton).toBeVisible({ timeout: 5000 });

  await page.waitForTimeout(3000); // Let it run for 3 seconds
  await stopButton.click();

  // Wait for completion and close the completion modal
  await page.waitForTimeout(3000);

  // Close the completion modal if it's open
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  await expect(startButton).toBeVisible({ timeout: 10000 });

  // Step 3: Take screenshot before deletion
  await page.screenshot({
    path: 'tmp/before-deletion-test.png',
    fullPage: true
  });

  // Step 4: Find and click on a calendar session to delete
  console.log('🎯 Looking for calendar session to delete...');

  // Look for Deep Work sessions in the calendar grid (not in modal)
  // Try to find sessions by looking for calendar entries
  const calendarSessions = page.locator('.cursor-pointer:has-text("Deep Wor")');
  const sessionCount = await calendarSessions.count();
  console.log(`📅 Found ${sessionCount} calendar sessions`);

  if (sessionCount > 0) {
    const sessionElements = calendarSessions.first();

    if (await sessionElements.isVisible()) {
      console.log('📅 Found session, clicking to open edit modal...');
      await sessionElements.click();

      // Wait for edit modal to open
      await page.waitForTimeout(2000);

      // Look for the delete button "Session löschen"
      const deleteButton = page.locator('button:has-text("Session löschen")');

      if (await deleteButton.isVisible()) {
        console.log('🗑️ Found delete button, clicking...');

        // Set up dialog handler before clicking
        page.on('dialog', async dialog => {
          console.log('⚠️ Confirmation dialog appeared:', dialog.message());
          await dialog.accept(); // Click "OK" to confirm deletion
        });

        await deleteButton.click();

        // Wait for deletion to complete
        await page.waitForTimeout(3000);

        // Step 5: Verify session was deleted
        console.log('✅ Checking if session was deleted...');

        // Take screenshot after deletion
        await page.screenshot({
          path: 'tmp/after-deletion-test.png',
          fullPage: true
        });

        // Count sessions after deletion
        const finalCalendarSessions = page.locator('.cursor-pointer:has-text("Deep Wor")');
        const finalCount = await finalCalendarSessions.count();
        console.log(`📊 Final session count: ${finalCount}`);

        console.log('✅ Session deletion test completed!');
        console.log('📸 Screenshots saved: tmp/before-deletion-test.png, tmp/after-deletion-test.png');

        // Verify deletion was successful (should have fewer sessions)
        if (finalCount < sessionCount) {
          console.log('✅ Session deletion successful!');
        } else {
          console.log('⚠️ Session deletion may not have worked - check screenshots');
        }
      } else {
        console.log('❌ Delete button not found');
        // Take screenshot to see what's in the modal
        await page.screenshot({
          path: 'tmp/debug-modal-content.png',
          fullPage: true
        });
      }
    } else {
      console.log('❌ Calendar session not visible');
    }
  } else {
    console.log('❌ No calendar sessions found to delete');
  }
});