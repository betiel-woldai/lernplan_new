import { test, expect } from '@playwright/test';

test('Test session completion toggle functionality', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3001');

  // Wait for calendar to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: 'tmp/session-toggle-test-01-initial.png', fullPage: true });

  // Look for a math session to test
  const mathSession = page.locator('text=Mathe Stu').first();

  if (await mathSession.isVisible()) {
    console.log('Found Math session, testing right-click functionality...');

    // Right-click on the session
    await mathSession.click({ button: 'right' });
    await page.waitForTimeout(1000);

    // Take screenshot after right-click
    await page.screenshot({ path: 'tmp/session-toggle-test-02-context-menu.png', fullPage: true });

    // Look for edit option in context menu
    const editOption = page.locator('text=Bearbeiten').or(page.locator('text=Edit'));
    if (await editOption.isVisible()) {
      await editOption.click();
      await page.waitForTimeout(1000);

      // Take screenshot of edit modal
      await page.screenshot({ path: 'tmp/session-toggle-test-03-edit-modal.png', fullPage: true });

      // Look for completion toggle or checkbox
      const completionToggle = page.locator('input[type="checkbox"]').or(page.locator('[role="switch"]'));
      if (await completionToggle.isVisible()) {
        console.log('Found completion toggle, testing...');
        await completionToggle.click();
        await page.waitForTimeout(1000);

        // Take screenshot after toggle
        await page.screenshot({ path: 'tmp/session-toggle-test-04-after-toggle.png', fullPage: true });
      }
    }
  } else {
    console.log('No Math sessions found, trying double-click test...');

    // Try double-clicking on an empty calendar day
    const calendarDay = page.locator('[data-date]').first();
    if (await calendarDay.isVisible()) {
      await calendarDay.dblclick();
      await page.waitForTimeout(1000);

      // Take screenshot of any modal that appears
      await page.screenshot({ path: 'tmp/session-toggle-test-05-double-click-modal.png', fullPage: true });
    }
  }

  // Take final screenshot
  await page.screenshot({ path: 'tmp/session-toggle-test-06-final.png', fullPage: true });
});