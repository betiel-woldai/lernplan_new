import { test, expect } from '@playwright/test';

test('Manual session deletion guide', async ({ page }) => {
  console.log('🧪 Creating sessions and demonstrating deletion workflow');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Step 1: Create a new session to demonstrate deletion
  console.log('🎯 Creating a session to delete...');

  // Start session
  const startButton = page.locator('button:has-text("Start")');
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();

  // Select Deep Work
  await page.waitForSelector('.bg-white.rounded-xl.shadow-2xl', { timeout: 5000 });
  const deepWorkOption = page.locator('button:has-text("Deep Work")').first();
  await deepWorkOption.click();

  const startSessionButton = page.locator('button:has-text("Start Session")');
  await startSessionButton.click();

  // Wait a few seconds then stop
  await page.waitForTimeout(4000);

  const stopButton = page.locator('button:has-text("Stop")');
  await expect(stopButton).toBeVisible();
  await stopButton.click();

  // Close completion modal
  await page.waitForTimeout(2000);
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Step 2: Take screenshot showing the sessions
  await page.screenshot({
    path: 'tmp/manual-deletion-sessions-visible.png',
    fullPage: true
  });

  console.log('✅ Session created and visible in calendar');
  console.log('📋 MANUAL DELETION INSTRUCTIONS:');
  console.log('1. Look at the calendar - you should see "Deep Work" sessions');
  console.log('2. Click directly on one of the green "Deep Work" session blocks');
  console.log('3. This should open an edit modal with session details');
  console.log('4. In the modal, look for the red "Session löschen" button');
  console.log('5. Click the delete button and confirm in the dialog');
  console.log('6. The session should disappear from the calendar');
  console.log('');
  console.log('📸 Screenshot saved: tmp/manual-deletion-sessions-visible.png');

  // Step 3: Test the API endpoint directly to confirm deletion works
  console.log('🧪 Testing deletion API directly...');

  // Get current sessions via API
  const sessionsResponse = await page.request.get('/api/calendar?userId=62d1b19b-3874-43b1-9424-ca7c2de10557&month=9&year=2025');
  const sessions = await sessionsResponse.json();

  const learningSessions = sessions.filter((s: any) => s.source === 'learning');
  console.log(`📊 Found ${learningSessions.length} learning sessions via API`);

  if (learningSessions.length > 0) {
    const sessionToDelete = learningSessions[0];
    console.log(`🎯 Testing deletion of session: ${sessionToDelete.id}`);

    // Test delete API endpoint
    const deleteResponse = await page.request.delete(`/api/sessions/${sessionToDelete.id}`);

    if (deleteResponse.ok()) {
      console.log('✅ API deletion successful!');

      // Verify session was deleted
      const updatedResponse = await page.request.get('/api/calendar?userId=62d1b19b-3874-43b1-9424-ca7c2de10557&month=9&year=2025');
      const updatedSessions = await updatedResponse.json();
      const updatedLearningSessions = updatedSessions.filter((s: any) => s.source === 'learning');

      console.log(`📊 Sessions after API deletion: ${updatedLearningSessions.length} (was ${learningSessions.length})`);

      if (updatedLearningSessions.length < learningSessions.length) {
        console.log('✅ Session deletion via API confirmed working!');
      }
    } else {
      console.log('❌ API deletion failed:', deleteResponse.status());
    }
  }

  await page.screenshot({
    path: 'tmp/manual-deletion-final-state.png',
    fullPage: true
  });

  console.log('✅ Manual deletion guide completed');
});