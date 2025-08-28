import { test, expect } from '@playwright/test';

test.describe('Manual Gamification System Testing', () => {
  
  test('Comprehensive Gamification Test', async ({ page }) => {
    console.log('🎮 Starting comprehensive gamification system test...');
    
    // Navigate and wait for page
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for hydration
    
    console.log('📸 Step 1: Taking initial dashboard screenshot...');
    await page.screenshot({
      path: 'tests/screenshots/manual-01-initial-dashboard.png',
      fullPage: true
    });
    
    // Try to close any error dialogs if present
    const errorDialog = page.locator('.error-dialog, [role="alert"]').first();
    if (await errorDialog.isVisible()) {
      console.log('❌ Found error dialog, attempting to close...');
      const closeButton = page.locator('button').filter({ hasText: /close|dismiss|×/i }).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('🔍 Step 2: Testing basic UI elements visibility...');
    
    // Look for XP buttons by their text content
    const xpButtons = await page.locator('button').filter({ hasText: /\+\d+ XP/ }).count();
    console.log(`Found ${xpButtons} XP buttons on the page`);
    
    if (xpButtons > 0) {
      console.log('✅ XP buttons are present');
      
      // Test clicking the first XP button found
      const firstXPButton = page.locator('button').filter({ hasText: /\+\d+ XP/ }).first();
      const buttonText = await firstXPButton.textContent();
      console.log(`🎯 Clicking button: ${buttonText}`);
      
      await firstXPButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'tests/screenshots/manual-02-after-xp-click.png',
        fullPage: true
      });
      
      // Test a few more XP buttons
      const allXPButtons = await page.locator('button').filter({ hasText: /\+\d+ XP/ }).all();
      for (let i = 1; i < Math.min(3, allXPButtons.length); i++) {
        const buttonText = await allXPButtons[i].textContent();
        console.log(`🎯 Clicking button ${i+1}: ${buttonText}`);
        
        await allXPButtons[i].click();
        await page.waitForTimeout(1500);
        
        // Check for level-up modal
        const levelUpModal = page.locator('[data-testid="level-up-modal"]').first();
        if (await levelUpModal.isVisible()) {
          console.log('🎉 Level-up modal appeared!');
          
          await page.screenshot({
            path: `tests/screenshots/manual-03-level-up-modal-${i}.png`,
            fullPage: true
          });
          
          // Wait for confetti
          await page.waitForTimeout(2000);
          
          await page.screenshot({
            path: `tests/screenshots/manual-04-level-up-confetti-${i}.png`,
            fullPage: true
          });
          
          // Close modal
          const closeButton = page.locator('[data-testid="level-up-close"]').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            // Try clicking anywhere to close
            await page.click('body');
          }
          
          await page.waitForTimeout(1000);
        }
      }
    } else {
      console.log('⚠️ No XP buttons found, checking for any interactive buttons...');
      const allButtons = await page.locator('button').count();
      console.log(`Found ${allButtons} total buttons on the page`);
      
      if (allButtons > 0) {
        // Click the first few buttons to see what happens
        for (let i = 0; i < Math.min(3, allButtons); i++) {
          const button = page.locator('button').nth(i);
          const buttonText = await button.textContent();
          console.log(`🎯 Testing button ${i+1}: ${buttonText}`);
          
          if (buttonText && !buttonText.includes('Close') && !buttonText.includes('×')) {
            await button.click();
            await page.waitForTimeout(1000);
            
            await page.screenshot({
              path: `tests/screenshots/manual-05-button-test-${i}.png`,
              fullPage: true
            });
          }
        }
      }
    }
    
    console.log('🏆 Step 3: Testing achievement functionality...');
    
    // Look for achievement button
    const achievementButton = page.locator('button').filter({ hasText: /achievement/i }).first();
    if (await achievementButton.isVisible()) {
      console.log('🎖️ Found achievement button, clicking...');
      await achievementButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: 'tests/screenshots/manual-06-achievement-test.png',
        fullPage: true
      });
    }
    
    console.log('📊 Step 4: Final dashboard state...');
    await page.waitForTimeout(2000);
    
    // Take comprehensive final screenshots
    await page.screenshot({
      path: 'tests/screenshots/manual-07-final-dashboard.png',
      fullPage: true
    });
    
    // Try different viewport sizes
    console.log('📱 Step 5: Testing responsive design...');
    
    const viewports = [
      { width: 1366, height: 768, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: `tests/screenshots/manual-08-responsive-${viewport.name}.png`,
        fullPage: true
      });
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Manual gamification test completed successfully!');
    
    // Generate a simple report
    const report = {
      testCompleted: true,
      screenshotsTaken: 'Multiple screenshots captured',
      xpButtonsFound: xpButtons,
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 Test Report:', JSON.stringify(report, null, 2));
  });
});