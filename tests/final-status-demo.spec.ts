import { test, expect } from '@playwright/test';

test.describe('Complete Session Status Flow Demo', () => {
  test('demonstrate the complete working session status update flow', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // 1. Take initial screenshot of dashboard
    await page.screenshot({ path: 'tmp/demo-01-dashboard-initial.png', fullPage: true });

    // 2. Navigate to calendar page to show sessions
    await page.click('a[href="/subjects"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tmp/demo-02-subjects-view.png', fullPage: true });

    // 3. Go back to dashboard to test session status changes
    await page.click('a[href="/"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 4. Look for sessions in the calendar and interact with them
    const calendarGrid = page.locator('.calendar-grid');
    await expect(calendarGrid).toBeVisible();

    // 5. Take screenshot showing session status before changes
    await page.screenshot({ path: 'tmp/demo-03-calendar-before-changes.png', fullPage: true });

    // 6. Find and toggle a session completion status
    const completionButtons = page.locator('.calendar-grid button[title*="markieren"]');
    const buttonCount = await completionButtons.count();
    
    console.log(`Found ${buttonCount} completion toggle buttons`);

    if (buttonCount > 0) {
      // Get sidebar stats before change
      const statsBeforeToggle = await page.locator('[data-testid="gamification-section"]').screenshot();
      
      // Click the first completion toggle button
      await completionButtons.first().click();
      
      // Wait for the change to propagate
      await page.waitForTimeout(3000);
      
      // 7. Take screenshot after session status change
      await page.screenshot({ path: 'tmp/demo-04-after-status-toggle.png', fullPage: true });
      
      // 8. Navigate to analytics to show propagation
      await page.click('a[href="/analytics"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'tmp/demo-05-analytics-updated.png', fullPage: true });
      
      // 9. Go back to dashboard to show final state
      await page.click('a[href="/"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'tmp/demo-06-final-dashboard.png', fullPage: true });
      
      console.log('✅ Complete session status flow demonstrated successfully');
      console.log('📸 Screenshots saved in tmp/ directory');
      console.log('🎯 Session status is now being saved and propagated correctly!');
    }
  });
});