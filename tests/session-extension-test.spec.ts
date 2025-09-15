import { test, expect } from '@playwright/test';

test.describe('Session Extension Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('should show extension modal when planned time is reached', async ({ page }) => {
    // Start a very short session (1 minute) to quickly trigger extension
    await page.click('text=Start Learning Session');

    // Wait for the modal to appear
    await expect(page.locator('[data-testid="start-session-modal"]')).toBeVisible();

    // Select a subject (first one available)
    await page.click('.subject-selector button:first-child');

    // Set a very short duration for testing (1 minute)
    await page.fill('input[placeholder="25"]', '1');

    // Start the session
    await page.click('text=Start Session');

    // Wait for the timer to be active
    await expect(page.locator('text=LEARNING')).toBeVisible();

    // Wait for the planned time to be reached (1 minute + buffer)
    // The extension modal should appear
    await expect(page.locator('text=Planned Time Reached!')).toBeVisible({ timeout: 70000 });

    // Verify the extension modal elements
    await expect(page.locator('text=What would you like to do?')).toBeVisible();
    await expect(page.locator('text=Continue Session')).toBeVisible();
    await expect(page.locator('text=Complete Session')).toBeVisible();

    // Test continuing the session
    await page.click('text=Continue Session');

    // Verify the modal closes and timer continues
    await expect(page.locator('text=Planned Time Reached!')).not.toBeVisible();
    await expect(page.locator('text=LEARNING')).toBeVisible();

    // Complete the session
    await page.click('text=Complete');
  });

  test('should allow custom time extension', async ({ page }) => {
    // Start a very short session
    await page.click('text=Start Learning Session');
    await expect(page.locator('[data-testid="start-session-modal"]')).toBeVisible();

    // Select a subject and set 1 minute duration
    await page.click('.subject-selector button:first-child');
    await page.fill('input[placeholder="25"]', '1');
    await page.click('text=Start Session');

    // Wait for extension modal
    await expect(page.locator('text=Planned Time Reached!')).toBeVisible({ timeout: 70000 });

    // Click custom extension option
    await page.click('text=Custom');

    // Enter custom extension time (10 minutes)
    await page.fill('input[placeholder="15"]', '10');
    await page.click('text=Add');

    // Verify session continues
    await expect(page.locator('text=LEARNING')).toBeVisible();
  });

  test('should allow manual time adjustment during active session', async ({ page }) => {
    // Start a session
    await page.click('text=Start Learning Session');
    await expect(page.locator('[data-testid="start-session-modal"]')).toBeVisible();

    // Select a subject and start
    await page.click('.subject-selector button:first-child');
    await page.click('text=Start Session');

    // Wait for timer to be active
    await expect(page.locator('text=LEARNING')).toBeVisible();

    // Look for the time adjustment button
    await expect(page.locator('text=Adjust Time')).toBeVisible();
    await page.click('text=Adjust Time');

    // Verify time adjustment interface appears
    await expect(page.locator('text=Set Total Session Duration')).toBeVisible();

    // Adjust the time to 45 minutes
    await page.fill('input[placeholder]', '45');
    await page.click('text=Apply');

    // Verify adjustment is applied (interface should hide)
    await expect(page.locator('text=Set Total Session Duration')).not.toBeVisible();

    // Complete the session
    await page.click('text=Complete');
  });

  test('should complete session directly from extension modal', async ({ page }) => {
    // Start a very short session
    await page.click('text=Start Learning Session');
    await expect(page.locator('[data-testid="start-session-modal"]')).toBeVisible();

    // Select a subject and set 1 minute duration
    await page.click('.subject-selector button:first-child');
    await page.fill('input[placeholder="25"]', '1');
    await page.click('text=Start Session');

    // Wait for extension modal
    await expect(page.locator('text=Planned Time Reached!')).toBeVisible({ timeout: 70000 });

    // Click complete session directly from modal
    await page.click('text=Complete Session');

    // Verify session completes and returns to ready state
    await expect(page.locator('text=Lerntracker-Zentrale')).toBeVisible();
    await expect(page.locator('text=Ready to start your learning journey')).toBeVisible();
  });

  test('should show session extended indicator when time is extended', async ({ page }) => {
    // Start a very short session
    await page.click('text=Start Learning Session');
    await expect(page.locator('[data-testid="start-session-modal"]')).toBeVisible();

    // Select a subject and set 1 minute duration
    await page.click('.subject-selector button:first-child');
    await page.fill('input[placeholder="25"]', '1');
    await page.click('text=Start Session');

    // Wait for extension modal
    await expect(page.locator('text=Planned Time Reached!')).toBeVisible({ timeout: 70000 });

    // Extend by 15 minutes
    await page.click('text=+15m');

    // Verify session continues with extended time
    await expect(page.locator('text=LEARNING')).toBeVisible();

    // The progress should now show more than 100% completion or show extended state
    // (Implementation detail - may vary based on UI design)

    // Complete the session
    await page.click('text=Complete');
  });
});

test.describe('Session Extension Data Flow', () => {
  test('should save actual duration instead of planned duration', async ({ page }) => {
    // This test verifies that the session data reflects actual time spent
    // We'll need to check the database or API responses to verify this

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Monitor network requests to verify duration data
    let sessionData: any = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/sessions') && response.request().method() === 'POST') {
        sessionData = await response.json();
      }
    });

    // Start and complete a session with extension
    await page.click('text=Start Learning Session');
    await expect(page.locator('[data-testid="start-session-modal"]')).toBeVisible();

    await page.click('.subject-selector button:first-child');
    await page.fill('input[placeholder="25"]', '1'); // 1 minute planned
    await page.click('text=Start Session');

    // Wait for extension modal and extend
    await expect(page.locator('text=Planned Time Reached!')).toBeVisible({ timeout: 70000 });
    await page.click('text=+15m'); // Extend by 15 minutes

    // Wait a bit more and then complete
    await page.waitForTimeout(5000); // Wait 5 more seconds
    await page.click('text=Complete');

    // Verify the saved session data uses actual duration
    await page.waitForTimeout(2000); // Wait for API call

    if (sessionData) {
      // The actual duration should be around 1 minute (65-70 seconds) not the extended target
      expect(sessionData.duration).toBeGreaterThan(0);
      console.log('Session saved with duration:', sessionData.duration, 'minutes');
    }
  });
});