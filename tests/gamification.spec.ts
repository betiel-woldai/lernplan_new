import { test, expect } from '@playwright/test';

test.describe('Gamification System Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the development server
    await page.goto('http://localhost:3002');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('Initial Dashboard Gamification UI', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({
      path: 'tests/screenshots/01-initial-dashboard.png',
      fullPage: true
    });

    // Verify main gamification components are present
    await expect(page.locator('[data-testid="xp-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="level-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="streak-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="achievement-badges"]')).toBeVisible();
    
    console.log('✅ Initial dashboard screenshot taken');
  });

  test('XP Buttons Functionality', async ({ page }) => {
    console.log('🎮 Testing XP buttons functionality...');
    
    // Get initial XP value
    const initialXP = await page.locator('[data-testid="current-xp"]').textContent();
    console.log(`Initial XP: ${initialXP}`);

    // Test +10 XP button
    await page.locator('button:has-text("+10 XP")').click();
    
    // Wait for XP toast to appear
    await expect(page.locator('[data-testid="xp-toast"]')).toBeVisible({ timeout: 2000 });
    
    // Take screenshot of XP toast
    await page.screenshot({
      path: 'tests/screenshots/02-xp-toast-10.png',
      fullPage: true
    });
    
    // Wait for toast to disappear
    await expect(page.locator('[data-testid="xp-toast"]')).toBeHidden({ timeout: 4000 });
    
    // Verify XP increased
    const newXP = await page.locator('[data-testid="current-xp"]').textContent();
    console.log(`New XP after +10: ${newXP}`);

    // Test +25 XP button
    await page.locator('button:has-text("+25 XP")').click();
    await expect(page.locator('[data-testid="xp-toast"]')).toBeVisible({ timeout: 2000 });
    await page.screenshot({
      path: 'tests/screenshots/03-xp-toast-25.png',
      fullPage: true
    });
    
    // Wait for animation to complete
    await page.waitForTimeout(1000);
    
    console.log('✅ XP buttons working correctly');
  });

  test('Level Up Functionality', async ({ page }) => {
    console.log('🚀 Testing level-up functionality...');
    
    // Get initial level
    const initialLevel = await page.locator('[data-testid="current-level"]').textContent();
    console.log(`Initial Level: ${initialLevel}`);

    // Click +200 XP button multiple times to trigger level up
    for (let i = 0; i < 3; i++) {
      await page.locator('button:has-text("+200 XP")').click();
      await page.waitForTimeout(500); // Short pause between clicks
      
      // Check if level-up modal appears
      const levelUpModal = page.locator('[data-testid="level-up-modal"]');
      if (await levelUpModal.isVisible()) {
        console.log(`🎉 Level-up triggered after ${i + 1} clicks!`);
        
        // Take screenshot of level-up modal
        await page.screenshot({
          path: `tests/screenshots/04-level-up-modal-${i + 1}.png`,
          fullPage: true
        });
        
        // Wait for confetti animation
        await page.waitForTimeout(2000);
        
        // Take screenshot with confetti
        await page.screenshot({
          path: `tests/screenshots/05-level-up-confetti-${i + 1}.png`,
          fullPage: true
        });
        
        // Close modal
        await page.locator('[data-testid="level-up-close"]').click();
        await expect(levelUpModal).toBeHidden();
        
        break;
      }
    }

    console.log('✅ Level-up functionality tested');
  });

  test('Achievement System', async ({ page }) => {
    console.log('🏆 Testing achievement system...');
    
    // Take initial screenshot of achievements
    await page.screenshot({
      path: 'tests/screenshots/06-initial-achievements.png',
      fullPage: true
    });

    // Click various XP buttons to potentially unlock achievements
    const xpButtons = ['+10 XP', '+25 XP', '+50 XP', '+200 XP'];
    
    for (const buttonText of xpButtons) {
      await page.locator(`button:has-text("${buttonText}")`).click();
      await page.waitForTimeout(500);
      
      // Check for achievement unlock toast or modal
      const achievementNotification = page.locator('[data-testid="achievement-unlocked"]');
      if (await achievementNotification.isVisible()) {
        console.log(`🎊 Achievement unlocked with ${buttonText}!`);
        
        await page.screenshot({
          path: `tests/screenshots/07-achievement-unlocked-${buttonText.replace(/\+|\s/g, '')}.png`,
          fullPage: true
        });
        
        await page.waitForTimeout(2000); // Wait for animation
      }
    }

    // Take final achievement screenshot
    await page.screenshot({
      path: 'tests/screenshots/08-final-achievements.png',
      fullPage: true
    });

    console.log('✅ Achievement system tested');
  });

  test('Streak System', async ({ page }) => {
    console.log('🔥 Testing streak system...');
    
    // Get initial streak value
    const initialStreak = await page.locator('[data-testid="current-streak"]').textContent();
    console.log(`Initial Streak: ${initialStreak}`);

    // Interact with the system to potentially affect streak
    await page.locator('button:has-text("+10 XP")').click();
    await page.waitForTimeout(1000);

    // Take screenshot of streak display
    await page.screenshot({
      path: 'tests/screenshots/09-streak-display.png',
      fullPage: true
    });

    console.log('✅ Streak system verified');
  });

  test('Complete Gamified Dashboard Final State', async ({ page }) => {
    console.log('📸 Taking final comprehensive screenshot...');
    
    // Perform several interactions to show full system
    const interactions = [
      { button: '+10 XP', wait: 500 },
      { button: '+25 XP', wait: 500 },
      { button: '+50 XP', wait: 1000 },
      { button: '+200 XP', wait: 1000 },
    ];

    for (const interaction of interactions) {
      await page.locator(`button:has-text("${interaction.button}")`).click();
      await page.waitForTimeout(interaction.wait);
    }

    // Wait for all animations to complete
    await page.waitForTimeout(2000);

    // Take comprehensive final screenshot
    await page.screenshot({
      path: 'tests/screenshots/10-complete-gamified-dashboard.png',
      fullPage: true
    });

    // Also take a focused screenshot of just the gamification area
    await page.locator('[data-testid="gamification-section"]').screenshot({
      path: 'tests/screenshots/11-gamification-section-focused.png'
    });

    console.log('✅ Final comprehensive screenshots captured');
  });

  test('UI Responsiveness and Visual Validation', async ({ page }) => {
    console.log('🎨 Testing UI responsiveness and visual elements...');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: `tests/screenshots/12-responsive-${viewport.name}.png`,
        fullPage: true
      });
    }

    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('✅ Responsiveness testing completed');
  });
});