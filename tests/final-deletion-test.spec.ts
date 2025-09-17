import { test, expect } from '@playwright/test';

test('Session deletion with double-click', async ({ page }) => {
  console.log('🧪 Testing session deletion with double-click');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Close any open modals first
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Step 1: Find and double-click on a calendar session
  console.log('🎯 Looking for calendar session to delete...');

  // Take initial screenshot
  await page.screenshot({
    path: 'tmp/deletion-test-initial.png',
    fullPage: true
  });

  // Look for Deep Work sessions (the green colored ones)
  const sessionElements = page.locator('.bg-purple-100:has-text("Deep Wor")');
  const sessionCount = await sessionElements.count();
  console.log(`📅 Found ${sessionCount} sessions`);

  if (sessionCount > 0) {
    const firstSession = sessionElements.first();

    if (await firstSession.isVisible()) {
      console.log('📅 Found session, double-clicking to open edit modal...');

      // Double-click to open edit modal
      await firstSession.dblclick();

      // Wait for edit modal to open
      await page.waitForTimeout(2000);

      // Take screenshot of opened modal
      await page.screenshot({
        path: 'tmp/deletion-test-modal-opened.png',
        fullPage: true
      });

      // Look for the delete button "Session löschen"
      const deleteButton = page.locator('button:has-text("Session löschen")');

      if (await deleteButton.isVisible()) {
        console.log('🗑️ Found delete button, clicking...');

        // Set up dialog handler
        page.on('dialog', async dialog => {
          console.log('⚠️ Confirmation dialog appeared:', dialog.message());
          await dialog.accept();
        });

        await deleteButton.click();

        // Wait for deletion
        await page.waitForTimeout(3000);

        // Verify deletion
        const finalSessionElements = page.locator('.bg-purple-100:has-text("Deep Wor")');
        const finalCount = await finalSessionElements.count();
        console.log(`📊 Sessions after deletion: ${finalCount} (was ${sessionCount})`);

        await page.screenshot({
          path: 'tmp/deletion-test-final.png',
          fullPage: true
        });

        if (finalCount < sessionCount) {
          console.log('✅ Session deletion successful!');
        } else {
          console.log('⚠️ Session may not have been deleted');
        }
      } else {
        console.log('❌ Delete button not found in modal');

        // Check if there are any buttons in the modal
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`Found ${buttonCount} buttons in modal`);

        for (let i = 0; i < Math.min(buttonCount, 10); i++) {
          const buttonText = await allButtons.nth(i).textContent();
          console.log(`Button ${i}: "${buttonText}"`);
        }
      }
    } else {
      console.log('❌ Session not visible');
    }
  } else {
    console.log('❌ No sessions found');
  }
});

test('Session deletion with context menu', async ({ page }) => {
  console.log('🧪 Testing session deletion with right-click context menu');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Close any open modals first
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Step 1: Find and right-click on a calendar session
  console.log('🎯 Looking for calendar session to right-click...');

  const sessionElements = page.locator('.bg-purple-100:has-text("Deep Wor")');
  const sessionCount = await sessionElements.count();
  console.log(`📅 Found ${sessionCount} sessions`);

  if (sessionCount > 0) {
    const firstSession = sessionElements.first();

    if (await firstSession.isVisible()) {
      console.log('📅 Found session, right-clicking for context menu...');

      // Right-click to open context menu
      await firstSession.click({ button: 'right' });

      // Wait for context menu
      await page.waitForTimeout(1000);

      // Take screenshot with context menu
      await page.screenshot({
        path: 'tmp/deletion-test-context-menu.png',
        fullPage: true
      });

      // Look for delete option in context menu
      const deleteOption = page.locator('text="Löschen"');

      if (await deleteOption.isVisible()) {
        console.log('🗑️ Found delete option in context menu, clicking...');

        // Set up dialog handler
        page.on('dialog', async dialog => {
          console.log('⚠️ Confirmation dialog appeared:', dialog.message());
          await dialog.accept();
        });

        await deleteOption.click();

        // Wait for deletion
        await page.waitForTimeout(3000);

        const finalSessionElements = page.locator('.bg-purple-100:has-text("Deep Wor")');
        const finalCount = await finalSessionElements.count();
        console.log(`📊 Sessions after deletion: ${finalCount} (was ${sessionCount})`);

        if (finalCount < sessionCount) {
          console.log('✅ Session deletion via context menu successful!');
        } else {
          console.log('⚠️ Session may not have been deleted');
        }
      } else {
        console.log('❌ Delete option not found in context menu');
      }
    }
  }
});