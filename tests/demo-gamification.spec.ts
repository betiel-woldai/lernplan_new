import { test, expect } from '@playwright/test';

test('Gamification System Demo', async ({ page }) => {
  await page.goto('http://localhost:3002');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take initial screenshot of the gamification dashboard
  await page.screenshot({
    path: 'demo-screenshots/01-initial-gamification-dashboard.png',
    fullPage: true
  });
  
  // Test XP gain button
  const xpButton = page.locator('button:has-text("Lernsession starten")');
  if (await xpButton.count() > 0) {
    await xpButton.click();
    await page.waitForTimeout(2000); // Wait for XP toast animation
    
    await page.screenshot({
      path: 'demo-screenshots/02-after-xp-gain.png',
      fullPage: true
    });
  }
  
  // Test achievement unlock
  const achievementButton = page.locator('button:has-text("Achievement freischalten")');
  if (await achievementButton.count() > 0) {
    await achievementButton.click();
    await page.waitForTimeout(2000); // Wait for achievement animation
    
    await page.screenshot({
      path: 'demo-screenshots/03-after-achievement-unlock.png',
      fullPage: true
    });
  }
  
  // Test multiple XP boosts to trigger level up
  const bigXPButton = page.locator('button:has-text("Großer XP Boost")');
  if (await bigXPButton.count() > 0) {
    await bigXPButton.click();
    await page.waitForTimeout(1000);
    await bigXPButton.click();
    await page.waitForTimeout(1000);
    await bigXPButton.click();
    await page.waitForTimeout(3000); // Wait for potential level-up modal and confetti
    
    await page.screenshot({
      path: 'demo-screenshots/04-after-level-up-attempt.png',
      fullPage: true
    });
    
    // Check if level-up modal is present
    const modal = page.locator('[class*="fixed"][class*="inset-0"]').first();
    if (await modal.isVisible()) {
      await page.screenshot({
        path: 'demo-screenshots/05-level-up-modal.png',
        fullPage: true
      });
      
      // Close modal by clicking the button
      const continueButton = page.locator('button:has-text("Continue Learning")');
      if (await continueButton.count() > 0) {
        await continueButton.click();
        await page.waitForTimeout(1000);
      }
    }
  }
  
  // Test streak increase
  const streakButton = page.locator('button:has-text("Streak erhöhen")');
  if (await streakButton.count() > 0) {
    await streakButton.click();
    await streakButton.click(); // Click twice for better effect
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: 'demo-screenshots/06-after-streak-increase.png',
      fullPage: true
    });
  }
  
  // Take final overview screenshot
  await page.screenshot({
    path: 'demo-screenshots/07-final-gamification-state.png',
    fullPage: true
  });
  
  // Test mobile responsive view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);
  
  await page.screenshot({
    path: 'demo-screenshots/08-mobile-responsive.png',
    fullPage: true
  });
});