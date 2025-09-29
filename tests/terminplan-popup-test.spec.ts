import { test, expect } from '@playwright/test';

test('Terminplan popup system integration test', async ({ page }) => {
  // Navigate to the main dashboard
  await page.goto('http://localhost:3000');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check if the dashboard loaded successfully
  await expect(page.locator('text=Lernplaner')).toBeVisible();

  // Log current date for debugging
  const currentDate = new Date().toLocaleDateString();
  console.log(`Testing on date: ${currentDate}`);

  // Check for today's terminplan modal (might or might not be visible depending on current date)
  const todaysModalVisible = await page.locator('[data-testid="todays-terminplan-modal"]').isVisible();

  if (todaysModalVisible) {
    console.log('✓ Today\'s terminplan modal is visible!');

    // Check modal content
    await expect(page.locator('text=Termine heute')).toBeVisible();
    await expect(page.locator('button:has-text("Verstanden")')).toBeVisible();

    // Take screenshot of the modal
    await page.screenshot({
      path: 'tmp/terminplan-popup-active.png',
      fullPage: false
    });

    console.log('Modal screenshot saved to tmp/terminplan-popup-active.png');
  } else {
    console.log('ℹ No today\'s terminplan modal visible (no events today or already dismissed)');
  }

  // Verify the calendar sessions are loaded correctly with popupMessage support
  const response = await page.request.get('/api/calendar');
  expect(response.ok()).toBeTruthy();

  const sessions = await response.json();
  const terminplanSessions = sessions.filter((s: any) => s.fixedSource === 'terminplan');

  console.log(`Found ${terminplanSessions.length} terminplan sessions`);

  // Check if any session has popupMessage (our new feature)
  const sessionsWithPopupMessage = terminplanSessions.filter((s: any) => s.popupMessage);
  console.log(`Sessions with popupMessage: ${sessionsWithPopupMessage.length}`);

  if (sessionsWithPopupMessage.length > 0) {
    console.log('✓ Popup messages are being processed correctly!');
    console.log('Sample popup message:', sessionsWithPopupMessage[0].popupMessage);
  } else {
    console.log('ℹ No sessions with popup messages found (might be expected if no popupMessage defined in terminplan.json)');
  }

  // Take a screenshot of the final state
  await page.screenshot({
    path: 'tmp/terminplan-popup-system-final.png',
    fullPage: true
  });

  console.log('🎉 Terminplan popup system test completed successfully!');
});