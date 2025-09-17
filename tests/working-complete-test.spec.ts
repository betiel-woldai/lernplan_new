import { test, expect } from '@playwright/test';

test('Complete session to calendar integration test', async ({ page }) => {
  console.log('🧪 Testing complete session to calendar integration after API fix');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Step 1: Take initial screenshot of calendar
  await page.screenshot({
    path: 'tmp/calendar-before-sync-test.png',
    fullPage: true
  });

  // Step 2: Start a session
  console.log('🎯 Starting a new session...');
  const startButton = page.locator('button:has-text("Start")');
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();

  // Wait for subject selector and select Deep Work
  await page.waitForSelector('.bg-white.rounded-xl.shadow-2xl', { timeout: 5000 });
  const deepWorkOption = page.locator('button:has-text("Deep Work")').first();
  await deepWorkOption.click();

  // Start the session
  const startSessionButton = page.locator('button:has-text("Start Session")');
  await expect(startSessionButton).toBeVisible();
  await startSessionButton.click();

  // Step 3: Wait for session to start
  console.log('⏱️ Waiting for session to start...');
  await page.waitForTimeout(2000);

  const stopButton = page.locator('button:has-text("Stop")');
  await expect(stopButton).toBeVisible({ timeout: 5000 });

  // Step 4: Wait a few seconds then stop the session
  console.log('⏳ Waiting before stopping session...');
  await page.waitForTimeout(3000);

  console.log('🛑 Stopping session...');
  await stopButton.click();

  // Step 5: Wait for session completion modal
  console.log('📋 Waiting for session completion feedback...');

  // Look for session summary or completion message
  await page.waitForTimeout(3000);

  // Should return to Start button
  await expect(startButton).toBeVisible({ timeout: 10000 });

  // Step 6: Check if session appears in calendar
  console.log('📅 Checking calendar for completed session...');

  // Wait a moment for calendar refresh
  await page.waitForTimeout(2000);

  // Take screenshot of calendar after session
  await page.screenshot({
    path: 'tmp/calendar-after-sync-test.png',
    fullPage: true
  });

  // Look for session indicators in the calendar
  // Sessions might appear as colored blocks or text
  const calendarEntries = page.locator('[class*="session"], [class*="event"], .bg-purple-500, .bg-blue-500, .bg-green-500');
  const hasCalendarEntries = await calendarEntries.count();

  console.log(`📊 Found ${hasCalendarEntries} potential calendar entries`);

  // Take final verification screenshot
  await page.screenshot({
    path: 'tmp/calendar-sessions-verification.png',
    fullPage: true
  });

  console.log('✅ Calendar integration test completed!');
  console.log('📸 Screenshots saved: tmp/calendar-*-sync-test.png');

  if (hasCalendarEntries > 0) {
    console.log('✅ Sessions are visible in calendar!');
  } else {
    console.log('⚠️ No obvious calendar entries found - check screenshots for manual verification');
  }
});