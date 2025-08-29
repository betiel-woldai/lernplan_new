import { test, expect } from '@playwright/test';

test('Session Tracking Demo', async ({ page }) => {
  // Navigate to subjects page
  await page.goto('http://localhost:3000/subjects');
  await page.waitForTimeout(3000);

  // Take screenshot of updated subjects page with session buttons
  await page.screenshot({ 
    path: 'tmp/01-subjects-with-session-tracking.png',
    fullPage: true 
  });

  console.log('✅ Subjects page loaded with session tracking UI');

  // Test Start Session button in header
  const startSessionBtn = page.locator('button:has-text("Start Session")');
  if (await startSessionBtn.isVisible()) {
    // Click Start Session button
    await startSessionBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot of Start Session modal
    await page.screenshot({ 
      path: 'tmp/02-start-session-modal.png',
      fullPage: true 
    });

    console.log('✅ Start Session modal opened');

    // Close modal
    const cancelBtn = page.locator('button:has-text("Cancel")');
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Test Session History toggle
  const historyBtn = page.locator('button:has-text("Session History")');
  if (await historyBtn.isVisible()) {
    await historyBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot with session history expanded
    await page.screenshot({ 
      path: 'tmp/03-session-history-expanded.png',
      fullPage: true 
    });

    console.log('✅ Session History component displayed');
  }

  // Test responsive design - tablet view
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'tmp/04-tablet-responsive.png',
    fullPage: true 
  });

  // Test responsive design - mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'tmp/05-mobile-responsive.png',
    fullPage: true 
  });

  console.log('✅ Responsive design tested');

  // Reset to desktop view
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(500);

  // Final clean screenshot
  await page.screenshot({ 
    path: 'tmp/06-final-subjects-clean.png',
    fullPage: true 
  });

  // Navigate to dashboard
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);

  await page.screenshot({ 
    path: 'tmp/07-dashboard-current.png',
    fullPage: true 
  });

  // Navigate to calendar
  await page.goto('http://localhost:3000/calendar');
  await page.waitForTimeout(2000);

  await page.screenshot({ 
    path: 'tmp/08-calendar-current.png',
    fullPage: true 
  });

  console.log('🎉 Session tracking demo completed successfully!');
});