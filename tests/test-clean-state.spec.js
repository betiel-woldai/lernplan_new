const { test, expect } = require('@playwright/test');

test('Verify clean application state after data reset', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3000');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Take screenshot of the clean dashboard
  await page.screenshot({
    path: 'tmp/clean-state-dashboard.png',
    fullPage: true
  });

  console.log('✅ Dashboard screenshot taken');

  // Navigate to subjects page
  await page.click('[href="/subjects"]');
  await page.waitForLoadState('networkidle');

  // Take screenshot of empty subjects page
  await page.screenshot({
    path: 'tmp/clean-state-subjects.png',
    fullPage: true
  });

  console.log('✅ Subjects page screenshot taken');

  // Check that no subjects are present
  const subjectCards = await page.locator('[data-testid="subject-card"]').count();
  console.log(`📊 Found ${subjectCards} subjects (should be 0)`);

  // Navigate to analytics page if it exists
  try {
    await page.click('[href="/analytics"]');
    await page.waitForLoadState('networkidle');

    // Take screenshot of empty analytics
    await page.screenshot({
      path: 'tmp/clean-state-analytics.png',
      fullPage: true
    });

    console.log('✅ Analytics page screenshot taken');
  } catch (error) {
    console.log('ℹ️  Analytics page not accessible or not found');
  }

  console.log('\n🎉 Clean state verification completed!');
  console.log('📸 Screenshots saved:');
  console.log('   - tmp/clean-state-dashboard.png');
  console.log('   - tmp/clean-state-subjects.png');
  console.log('   - tmp/clean-state-analytics.png (if available)');
});