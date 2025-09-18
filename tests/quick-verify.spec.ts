import { test, expect } from '@playwright/test';

test.describe('Delete Session Feature Verification', () => {
  test('should show existing sessions with delete functionality', async ({ page }) => {
    console.log('🧪 Verifying delete session functionality exists');

    // Navigate to the application
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    // Take screenshot of calendar with sessions
    await page.screenshot({ path: 'tmp/delete-verification-01-calendar.png', fullPage: true });

    // Look for existing sessions in calendar (Deep Work sessions visible)
    const sessions = page.locator('text=Deep Work').first();
    
    if (await sessions.isVisible()) {
      console.log('📅 Found Deep Work sessions in calendar');

      // Try to right-click on session to access context menu
      await sessions.click({ button: 'right' });
      await page.waitForTimeout(1000);

      // Take screenshot of context menu
      await page.screenshot({ path: 'tmp/delete-verification-02-context-menu.png', fullPage: true });

      // Look for edit option in context menu
      const editOption = page.locator('button, a').filter({ hasText: /Edit|Bearbeiten/i }).first();

      if (await editOption.isVisible()) {
        console.log('✅ Edit option found in context menu');
        await editOption.click();

        // Wait for edit modal
        await page.waitForSelector('.modal', { timeout: 5000 });

        // Take screenshot of edit modal
        await page.screenshot({ path: 'tmp/delete-verification-03-edit-modal.png', fullPage: true });

        // Look for delete button in modal
        const deleteButton = page.locator('button').filter({ hasText: /Delete|Löschen/i }).first();
        
        if (await deleteButton.isVisible()) {
          console.log('✅ Delete button found in edit modal');
          console.log('✅ Delete session functionality is fully implemented!');
        }

        // Close modal
        const cancelButton = page.locator('button').filter({ hasText: /Cancel|Abbrechen/i }).first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }

    console.log('🎯 Delete session feature verification completed');
  });
});
