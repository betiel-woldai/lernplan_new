import { test, expect } from '@playwright/test';

test.describe('Improved Session Completion Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show immediate saving feedback when Complete is clicked', async ({ page }) => {
    // Start a session
    await page.click('text=Start');
    await page.waitForSelector('[data-testid="start-session-modal"]', { state: 'visible' });

    // Select a subject and start session
    await page.click('.subject-selector button:first-child');
    await page.click('text=Start Session');

    // Wait for session to be active
    await expect(page.locator('text=LEARNING')).toBeVisible();

    // Click Complete button
    await page.click('text=Complete');

    // Should immediately show saving state
    await expect(page.locator('text=SAVING TO CALENDAR...')).toBeVisible();
    await expect(page.locator('text=Saving...')).toBeVisible();

    // Complete button should be disabled with spinner
    const completeButton = page.locator('button:has-text("Saving...")');
    await expect(completeButton).toBeDisabled();
    await expect(completeButton.locator('svg')).toHaveClass(/animate-spin/);

    // Should transition to completed state
    await expect(page.locator('text=SESSION SAVED ✓')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Session successfully saved to calendar!')).toBeVisible();

    // Button should show saved state
    await expect(page.locator('text=Saved')).toBeVisible();

    // Should automatically clear to idle state after delay
    await expect(page.locator('text=Ready to start your learning journey')).toBeVisible({ timeout: 5000 });
  });

  test('should disable all buttons during saving state', async ({ page }) => {
    // Start a session
    await page.click('text=Start');
    await page.waitForSelector('[data-testid="start-session-modal"]', { state: 'visible' });

    await page.click('.subject-selector button:first-child');
    await page.click('text=Start Session');

    await expect(page.locator('text=LEARNING')).toBeVisible();

    // Click Complete to trigger saving state
    await page.click('text=Complete');

    // During saving, all control buttons should be disabled
    await expect(page.locator('button:has-text("Saving..."):disabled')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel"):disabled')).toBeVisible();

    // Manual time adjustment should not be visible during saving
    await expect(page.locator('text=Adjust Time')).not.toBeVisible();
  });

  test('should handle save errors gracefully', async ({ page }) => {
    // Mock a network failure by intercepting the API call
    await page.route('/api/sessions', route => {
      route.abort('failed');
    });

    // Start a session
    await page.click('text=Start');
    await page.waitForSelector('[data-testid="start-session-modal"]', { state: 'visible' });

    await page.click('.subject-selector button:first-child');
    await page.click('text=Start Session');

    await expect(page.locator('text=LEARNING')).toBeVisible();

    // Click Complete which should fail
    await page.click('text=Complete');

    // Should show saving state first
    await expect(page.locator('text=SAVING TO CALENDAR...')).toBeVisible();

    // Should revert to active state and show error
    await expect(page.locator('text=LEARNING')).toBeVisible({ timeout: 10000 });

    // Error should be displayed
    const errorAlert = page.locator('.bg-red-50');
    await expect(errorAlert).toBeVisible();

    // Complete button should be red to indicate error
    const completeButton = page.locator('button:has-text("Complete")');
    await expect(completeButton).toHaveClass(/bg-red-500/);

    // User should be able to retry
    await expect(completeButton).toBeEnabled();
  });

  test('should show proper visual states for different session states', async ({ page }) => {
    // Start session
    await page.click('text=Start');
    await page.waitForSelector('[data-testid="start-session-modal"]', { state: 'visible' });

    await page.click('.subject-selector button:first-child');
    await page.click('text=Start Session');

    // Active state - green theme
    await expect(page.locator('.text-green-600')).toBeVisible();
    await expect(page.locator('text=LEARNING')).toBeVisible();

    // Pause to test paused state
    await page.click('text=Pause');
    await expect(page.locator('.text-yellow-600')).toBeVisible();
    await expect(page.locator('text=PAUSED')).toBeVisible();

    // Resume and complete
    await page.click('text=Resume');
    await page.click('text=Complete');

    // Saving state - purple theme
    await expect(page.locator('.text-purple-600')).toBeVisible();
    await expect(page.locator('text=SAVING TO CALENDAR...')).toBeVisible();

    // Completed state - blue theme
    await expect(page.locator('.text-blue-600')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=SESSION SAVED ✓')).toBeVisible();
  });

  test('should complete faster than old 3-second delay', async ({ page }) => {
    const startTime = Date.now();

    // Start and complete a session
    await page.click('text=Start');
    await page.waitForSelector('[data-testid="start-session-modal"]', { state: 'visible' });

    await page.click('.subject-selector button:first-child');
    await page.click('text=Start Session');

    await expect(page.locator('text=LEARNING')).toBeVisible();
    await page.click('text=Complete');

    // Wait for the flow to complete and return to idle
    await expect(page.locator('text=Ready to start your learning journey')).toBeVisible({ timeout: 5000 });

    const completionTime = Date.now() - startTime;

    // Should complete in less than 2.5 seconds (was 3+ seconds before)
    expect(completionTime).toBeLessThan(2500);
    console.log(`Session completion took ${completionTime}ms (should be < 2500ms)`);
  });
});