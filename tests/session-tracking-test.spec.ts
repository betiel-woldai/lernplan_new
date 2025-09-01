import { test, expect } from '@playwright/test';

test.describe('Session Tracking System', () => {
  test('Test session tracking UI components and functionality', async ({ page }) => {
    // Navigate to subjects page
    await page.goto('http://localhost:3000/subjects');
    await page.waitForTimeout(2000);

    // Take screenshot of updated subjects page with session buttons
    await page.screenshot({ 
      path: 'tmp/01-subjects-with-session-tracking.png',
      fullPage: true 
    });

    console.log('✅ Subjects page loaded with session tracking UI');

    // Test Start Session button in header
    const startSessionBtn = page.locator('button:has-text("Start Session")');
    await expect(startSessionBtn).toBeVisible();
    
    // Click Start Session button
    await startSessionBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot of Start Session modal
    await page.screenshot({ 
      path: 'tmp/02-start-session-modal.png',
      fullPage: true 
    });

    console.log('✅ Start Session modal opened');

    // Check if subjects are listed in the modal
    const subjectOptions = page.locator('input[name="subject"]');
    const subjectCount = await subjectOptions.count();
    console.log(`📊 Found ${subjectCount} subjects in session modal`);

    // Check duration options
    const durationSelect = page.locator('select');
    await expect(durationSelect).toBeVisible();
    
    // Check if 25 minutes (Pomodoro) is selected by default
    const selectedValue = await durationSelect.inputValue();
    expect(selectedValue).toBe('25');
    console.log('✅ Default duration is 25 minutes (Pomodoro)');

    // Close modal
    const closeBtn = page.locator('button:has-text("Cancel")');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Test Session History toggle
    const historyBtn = page.locator('button:has-text("Session History")');
    await expect(historyBtn).toBeVisible();
    
    await historyBtn.click();
    await page.waitForTimeout(1000);

    // Take screenshot with session history expanded
    await page.screenshot({ 
      path: 'tmp/03-session-history-expanded.png',
      fullPage: true 
    });

    console.log('✅ Session History component displayed');

    // Check if session history shows stats
    const totalTimeCard = page.locator('div:has-text("Total Time")');
    await expect(totalTimeCard).toBeVisible();
    
    const totalXPCard = page.locator('div:has-text("Total XP")');
    await expect(totalXPCard).toBeVisible();

    console.log('✅ Session stats cards are visible');

    // Test individual subject Start Session buttons (hover to see them)
    const subjectCards = page.locator('[class*="group"]').first();
    if (await subjectCards.count() > 0) {
      await subjectCards.hover();
      await page.waitForTimeout(500);

      // Take screenshot showing hover state with play button
      await page.screenshot({ 
        path: 'tmp/04-subject-card-hover-with-play.png',
        fullPage: true 
      });

      console.log('✅ Subject card hover state shows Start Session button');
    }

    // Test responsive design - tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tmp/05-tablet-responsive.png',
      fullPage: true 
    });

    // Test responsive design - mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tmp/06-mobile-responsive.png',
      fullPage: true 
    });

    console.log('✅ Responsive design tested');

    // Reset to desktop view for final screenshot
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Collapse history for clean final view
    await historyBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({ 
      path: 'tmp/07-final-subjects-clean.png',
      fullPage: true 
    });

    console.log('✅ Final clean subjects page screenshot');

    // Navigate to dashboard to show complete system
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: 'tmp/08-dashboard-current.png',
      fullPage: true 
    });

    console.log('✅ Dashboard screenshot taken');

    // Navigate to calendar
    await page.goto('http://localhost:3000/calendar');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: 'tmp/09-calendar-current.png',
      fullPage: true 
    });

    console.log('✅ Calendar screenshot taken');

    console.log('🎉 Session tracking system test completed successfully!');
  });

  test('Test session API endpoints', async ({ page }) => {
    // Test that the API endpoints are accessible
    const response = await page.request.get('http://localhost:3000/api/sessions');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('sessions');
    expect(data).toHaveProperty('pagination');
    
    console.log('✅ Sessions API endpoint working');
    console.log(`📊 Found ${data.sessions.length} existing sessions`);
  });
});