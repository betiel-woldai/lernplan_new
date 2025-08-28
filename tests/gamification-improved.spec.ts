import { test, expect } from '@playwright/test';

test.describe('Gamification System Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the development server
    await page.goto('http://localhost:3002');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for React hydration to complete
    await page.waitForTimeout(2000);
  });

  test('Initial Dashboard Screenshot and Basic Components', async ({ page }) => {
    console.log('📸 Taking initial dashboard screenshot...');
    
    // Take initial screenshot
    await page.screenshot({
      path: 'tests/screenshots/01-initial-dashboard.png',
      fullPage: true
    });

    // Check if main gamification components are visible
    const gamificationSection = page.locator('[data-testid="gamification-section"]');
    await expect(gamificationSection).toBeVisible({ timeout: 10000 });

    const xpBar = page.locator('[data-testid="xp-bar"]');
    await expect(xpBar).toBeVisible({ timeout: 5000 });

    const levelBadge = page.locator('[data-testid="level-badge"]');
    await expect(levelBadge).toBeVisible({ timeout: 5000 });

    const streakDisplay = page.locator('[data-testid="streak-display"]');
    await expect(streakDisplay).toBeVisible({ timeout: 5000 });

    console.log('✅ Initial dashboard components verified');
  });

  test('XP Buttons Functionality', async ({ page }) => {
    console.log('🎮 Testing XP buttons...');
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Test +10 XP button
    const xp10Button = page.locator('[data-testid="xp-button-10"]');
    await expect(xp10Button).toBeVisible({ timeout: 5000 });
    
    await xp10Button.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot after XP action
    await page.screenshot({
      path: 'tests/screenshots/02-after-10xp.png',
      fullPage: true
    });

    // Test +25 XP button
    const xp25Button = page.locator('[data-testid="xp-button-25"]');
    await expect(xp25Button).toBeVisible({ timeout: 5000 });
    
    await xp25Button.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: 'tests/screenshots/03-after-25xp.png',
      fullPage: true
    });

    // Test +50 XP button
    const xp50Button = page.locator('[data-testid="xp-button-50"]');
    await expect(xp50Button).toBeVisible({ timeout: 5000 });
    
    await xp50Button.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: 'tests/screenshots/04-after-50xp.png',
      fullPage: true
    });

    console.log('✅ XP buttons tested successfully');
  });

  test('Level Up Functionality with +200 XP', async ({ page }) => {
    console.log('🚀 Testing level-up functionality...');
    
    await page.waitForLoadState('networkidle');
    
    // Click +200 XP button multiple times to trigger level up
    const xp200Button = page.locator('[data-testid="xp-button-200"]');
    await expect(xp200Button).toBeVisible({ timeout: 5000 });

    for (let i = 0; i < 5; i++) {
      console.log(`Clicking +200 XP button (${i + 1}/5)...`);
      await xp200Button.click();
      await page.waitForTimeout(800);
      
      // Check if level-up modal appears
      const levelUpModal = page.locator('[data-testid="level-up-modal"]');
      const isModalVisible = await levelUpModal.isVisible();
      
      if (isModalVisible) {
        console.log(`🎉 Level-up modal appeared after ${i + 1} clicks!`);
        
        // Take screenshot of level-up modal
        await page.screenshot({
          path: `tests/screenshots/05-level-up-modal-${i + 1}.png`,
          fullPage: true
        });
        
        // Wait for confetti animation
        await page.waitForTimeout(2000);
        
        // Take another screenshot with confetti
        await page.screenshot({
          path: `tests/screenshots/06-level-up-confetti-${i + 1}.png`,
          fullPage: true
        });
        
        // Close modal by clicking the close button
        const closeButton = page.locator('[data-testid="level-up-close"]');
        await closeButton.click();
        
        // Wait for modal to close
        await expect(levelUpModal).toBeHidden({ timeout: 5000 });
        
        break;
      }
      
      // Take screenshot after each XP gain
      await page.screenshot({
        path: `tests/screenshots/07-after-200xp-${i + 1}.png`,
        fullPage: true
      });
    }

    console.log('✅ Level-up functionality tested');
  });

  test('Achievement System Testing', async ({ page }) => {
    console.log('🏆 Testing achievement system...');
    
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot of achievements
    await page.screenshot({
      path: 'tests/screenshots/08-initial-achievements.png',
      fullPage: true
    });

    // Test achievement unlock button in demo section
    const achievementButton = page.locator('button:has-text("Achievement freischalten")');
    
    if (await achievementButton.isVisible()) {
      await achievementButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'tests/screenshots/09-achievement-unlocked.png',
        fullPage: true
      });
    }

    // Test various XP buttons to potentially trigger achievements
    const xpButtons = ['[data-testid="xp-button-10"]', '[data-testid="xp-button-25"]', '[data-testid="xp-button-50"]'];
    
    for (let i = 0; i < xpButtons.length; i++) {
      const button = page.locator(xpButtons[i]);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(1000);
      }
    }

    // Take final achievement screenshot
    await page.screenshot({
      path: 'tests/screenshots/10-final-achievements.png',
      fullPage: true
    });

    console.log('✅ Achievement system tested');
  });

  test('Complete Gamified Dashboard Final State', async ({ page }) => {
    console.log('🎨 Creating complete dashboard showcase...');
    
    await page.waitForLoadState('networkidle');
    
    // Perform multiple interactions to show the full system in action
    const interactions = [
      { selector: '[data-testid="xp-button-10"]', name: '+10 XP', wait: 800 },
      { selector: '[data-testid="xp-button-25"]', name: '+25 XP', wait: 800 },
      { selector: '[data-testid="xp-button-50"]', name: '+50 XP', wait: 1000 },
      { selector: 'button:has-text("Achievement freischalten")', name: 'Achievement', wait: 1500 },
      { selector: '[data-testid="xp-button-200"]', name: '+200 XP', wait: 1000 },
      { selector: '[data-testid="xp-button-200"]', name: '+200 XP (2)', wait: 1000 }
    ];

    for (const interaction of interactions) {
      console.log(`Performing interaction: ${interaction.name}`);
      const button = page.locator(interaction.selector);
      
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(interaction.wait);
        
        // Check for level-up modal and close it if it appears
        const levelUpModal = page.locator('[data-testid="level-up-modal"]');
        if (await levelUpModal.isVisible()) {
          const closeButton = page.locator('[data-testid="level-up-close"]');
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Wait for all animations to complete
    await page.waitForTimeout(2000);

    // Take comprehensive final screenshot
    await page.screenshot({
      path: 'tests/screenshots/11-complete-gamified-dashboard.png',
      fullPage: true
    });

    // Take focused screenshot of gamification section
    const gamificationSection = page.locator('[data-testid="gamification-section"]');
    if (await gamificationSection.isVisible()) {
      await gamificationSection.screenshot({
        path: 'tests/screenshots/12-gamification-section-focused.png'
      });
    }

    console.log('✅ Complete dashboard showcase captured');
  });

  test('Responsive Design Testing', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      // Take screenshot
      await page.screenshot({
        path: `tests/screenshots/13-responsive-${viewport.name}.png`,
        fullPage: true
      });
      
      // Test that key elements are still visible
      const gamificationSection = page.locator('[data-testid="gamification-section"]');
      await expect(gamificationSection).toBeVisible({ timeout: 5000 });
    }

    // Reset to desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('✅ Responsive design testing completed');
  });
});