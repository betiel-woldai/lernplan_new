import { test, expect } from '@playwright/test';

test('Session deletion via Bearbeiten button', async ({ page }) => {
  console.log('🧪 Testing session deletion via Bearbeiten (Edit) button');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Close any open modals first
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Step 1: Create a session first if needed
  console.log('🎯 Creating a test session...');
  const startButton = page.locator('button:has-text("Start")');
  if (await startButton.isVisible()) {
    await startButton.click();

    // Select Deep Work and start session
    await page.waitForSelector('.bg-white.rounded-xl.shadow-2xl', { timeout: 5000 });
    const deepWorkOption = page.locator('button:has-text("Deep Work")').first();
    await deepWorkOption.click();

    const startSessionButton = page.locator('button:has-text("Start Session")');
    await startSessionButton.click();

    // Wait and stop the session
    await page.waitForTimeout(3000);
    const stopButton = page.locator('button:has-text("Stop")');
    if (await stopButton.isVisible()) {
      await stopButton.click();
      await page.waitForTimeout(2000);
    }

    // Close completion modal
    const completionCloseButton = page.locator('button:has-text("Close")');
    if (await completionCloseButton.isVisible()) {
      await completionCloseButton.click();
      await page.waitForTimeout(1000);
    }
  }

  // Step 2: Take initial screenshot
  await page.screenshot({
    path: 'tmp/edit-delete-01-initial.png',
    fullPage: true
  });

  // Step 3: Look for "Bearbeiten" buttons
  console.log('🔍 Looking for Bearbeiten buttons...');

  const bearbeitenButtons = page.locator('button:has-text("Bearbeiten")');
  const bearbeitenCount = await bearbeitenButtons.count();
  console.log(`📝 Found ${bearbeitenCount} Bearbeiten buttons`);

  if (bearbeitenCount > 0) {
    console.log('📝 Clicking on first Bearbeiten button...');

    // Click the first Bearbeiten button
    await bearbeitenButtons.first().click();

    // Wait for edit modal to open
    await page.waitForTimeout(2000);

    // Take screenshot of edit modal
    await page.screenshot({
      path: 'tmp/edit-delete-02-edit-modal.png',
      fullPage: true
    });

    // Step 4: Look for "Session löschen" button in the edit modal
    console.log('🗑️ Looking for Session löschen button...');

    const deleteButton = page.locator('button:has-text("Session löschen")');

    if (await deleteButton.isVisible()) {
      console.log('✅ Found Session löschen button, clicking...');

      // Set up dialog handler for confirmation
      page.on('dialog', async dialog => {
        console.log('⚠️ Confirmation dialog:', dialog.message());
        await dialog.accept(); // Accept the deletion
      });

      // Click delete button
      await deleteButton.click();

      // Wait for deletion to complete
      await page.waitForTimeout(3000);

      // Take final screenshot
      await page.screenshot({
        path: 'tmp/edit-delete-03-after-deletion.png',
        fullPage: true
      });

      // Verify deletion by checking if the Bearbeiten button is gone or count decreased
      const finalBearbeitenButtons = page.locator('button:has-text("Bearbeiten")');
      const finalCount = await finalBearbeitenButtons.count();
      console.log(`📊 Bearbeiten buttons after deletion: ${finalCount} (was ${bearbeitenCount})`);

      if (finalCount < bearbeitenCount) {
        console.log('✅ Session successfully deleted via Bearbeiten!');
      } else {
        console.log('⚠️ Session deletion may not have worked');
      }

    } else {
      console.log('❌ Session löschen button not found in edit modal');

      // Debug: List all buttons in the modal
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} total buttons:`);

      for (let i = 0; i < Math.min(buttonCount, 15); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  Button ${i}: "${buttonText}"`);
      }
    }

  } else {
    console.log('❌ No Bearbeiten buttons found');

    // Look for other possible edit buttons or session elements
    const sessionElements = page.locator('[class*="session"], [class*="Deep Work"], .cursor-pointer');
    const elementCount = await sessionElements.count();
    console.log(`Found ${elementCount} potential session elements`);
  }

  console.log('✅ Test completed');
  console.log('📸 Screenshots saved: tmp/edit-delete-*.png');
});