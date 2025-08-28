import { test, expect } from '@playwright/test';

test('Show Issue #3 Results - Subject Management Interface', async ({ page }) => {
  await page.goto('http://localhost:3002');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 1. Show updated dashboard with navigation
  await page.screenshot({
    path: 'demo-results/01-dashboard-with-navigation.png',
    fullPage: true
  });

  // 2. Navigate to Subjects page
  await page.click('a[href="/subjects"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Show subjects page with mock data
  await page.screenshot({
    path: 'demo-results/02-subjects-page-initial.png',
    fullPage: true
  });

  // 4. Show Add Subject button and functionality
  await page.click('button:has-text("Add Subject")');
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'demo-results/03-add-subject-modal.png',
    fullPage: true
  });

  // 5. Show color picker functionality
  const colorPicker = page.locator('[style*="background-color"]').first();
  if (await colorPicker.count() > 0) {
    await colorPicker.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({
    path: 'demo-results/04-color-picker-expanded.png',
    fullPage: true
  });

  // 6. Fill out form to show validation
  await page.fill('input[id="name"]', 'Computer Science');
  await page.fill('input[id="startDate"]', '2024-03-01');
  await page.fill('input[id="examDate"]', '2024-07-15');
  await page.fill('input[id="hoursPerWeek"]', '12');
  await page.fill('input[id="daysPerWeek"]', '5');
  await page.fill('input[id="intensityWeeks"]', '8');

  await page.screenshot({
    path: 'demo-results/05-form-filled-validation.png',
    fullPage: true
  });

  // 7. Close modal and show search functionality
  await page.click('button:has-text("Cancel")');
  await page.waitForTimeout(1000);

  await page.fill('input[placeholder*="Search"]', 'Math');
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'demo-results/06-search-functionality.png',
    fullPage: true
  });

  // 8. Clear search to show all subjects
  await page.fill('input[placeholder*="Search"]', '');
  await page.waitForTimeout(1000);

  // 9. Show responsive design - tablet view
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'demo-results/07-tablet-responsive.png',
    fullPage: true
  });

  // 10. Show mobile responsive design
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'demo-results/08-mobile-responsive.png',
    fullPage: true
  });

  // 11. Return to desktop and show version number
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'demo-results/09-final-desktop-view.png',
    fullPage: true
  });

  console.log('✅ All screenshots captured successfully!');
});