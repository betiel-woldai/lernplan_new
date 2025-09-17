import { test, expect } from '@playwright/test';

test('Real-time calendar display test', async ({ page }) => {
  console.log('🧪 Testing real-time calendar display after timestamp fix');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Record current time for comparison
  const testStartTime = new Date();
  console.log('⏰ Test started at:', testStartTime.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }));

  // Step 1: Start a session
  console.log('🎯 Starting a new session...');
  const startButton = page.locator('button:has-text("Start")');
  await expect(startButton).toBeVisible({ timeout: 10000 });
  await startButton.click();

  // Select Deep Work
  await page.waitForSelector('.bg-white.rounded-xl.shadow-2xl', { timeout: 5000 });
  const deepWorkOption = page.locator('button:has-text("Deep Work")').first();
  await deepWorkOption.click();

  const startSessionButton = page.locator('button:has-text("Start Session")');
  await startSessionButton.click();

  // Step 2: Wait for session to start
  await page.waitForTimeout(2000);
  const sessionStartTime = new Date();
  console.log('⏱️ Session started at:', sessionStartTime.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }));

  const stopButton = page.locator('button:has-text("Stop")');
  await expect(stopButton).toBeVisible({ timeout: 5000 });

  // Step 3: Wait a bit then stop the session
  await page.waitForTimeout(4000); // Wait 4 seconds

  console.log('🛑 Stopping session...');
  const sessionEndTime = new Date();
  await stopButton.click();

  console.log('⏰ Session ended at:', sessionEndTime.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }));

  // Step 4: Wait for completion and check calendar
  await page.waitForTimeout(3000);
  await expect(startButton).toBeVisible({ timeout: 10000 });

  // Take screenshot with real timestamps
  await page.screenshot({
    path: 'tmp/real-time-calendar-display.png',
    fullPage: true
  });

  console.log('✅ Real-time test completed!');
  console.log('📸 Check tmp/real-time-calendar-display.png to verify timestamps');
  console.log('⏰ Expected session time range:', 
    sessionStartTime.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
    'to',
    sessionEndTime.toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })
  );
});
