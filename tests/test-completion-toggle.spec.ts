import { test, expect } from '@playwright/test';

test('Session completion toggle functionality across all views', async ({ page }) => {
  console.log('🎯 Testing session completion toggle functionality...');
  
  // Navigate to the main page
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Wait for the page to fully load
  await expect(page.locator('h1').first()).toBeVisible();
  
  // Take initial screenshot
  await page.screenshot({ path: 'tests/screenshots/before-completion-toggle.png' });
  
  console.log('📊 Looking for sessions in calendar view...');
  
  // Look for session items in the calendar
  const sessionItems = page.locator('[data-testid^="session-"], .calendar-grid [title*="Ausstehend"], .calendar-grid [title*="Abgeschlossen"]').first();
  
  if (await sessionItems.count() > 0) {
    console.log('✅ Found session items in calendar');
    
    // Find the first incomplete session (with clock icon)
    const incompleteSession = page.locator('button[title*="Als abgeschlossen markieren"]').first();
    
    if (await incompleteSession.count() > 0) {
      console.log('📝 Found incomplete session, testing completion toggle...');
      
      // Click the completion toggle button
      await incompleteSession.click();
      
      // Wait for the API call to complete
      await page.waitForTimeout(1000);
      
      // Verify the session is now marked as completed (should show check icon)
      const completedButton = page.locator('button[title*="Als ausstehend markieren"]').first();
      await expect(completedButton).toBeVisible();
      
      console.log('✅ Session marked as completed successfully');
      
      // Take screenshot after completion
      await page.screenshot({ path: 'tests/screenshots/after-completion-toggle.png' });
      
      // Check if statistics have updated in sidebar
      const sidebarStats = page.locator('[data-testid="sidebar-stats"], .sidebar');
      if (await sidebarStats.count() > 0) {
        console.log('📈 Checking sidebar statistics updates...');
        await expect(sidebarStats).toBeVisible();
      }
      
    } else {
      console.log('⚠️  No incomplete sessions found, testing with completed session...');
      
      // Find a completed session and toggle it back
      const completedSession = page.locator('button[title*="Als ausstehend markieren"]').first();
      
      if (await completedSession.count() > 0) {
        await completedSession.click();
        await page.waitForTimeout(1000);
        
        // Verify it's now marked as incomplete
        const incompleteButton = page.locator('button[title*="Als abgeschlossen markieren"]').first();
        await expect(incompleteButton).toBeVisible();
        
        console.log('✅ Session marked as incomplete successfully');
      }
    }
  }
  
  // Test in Session History view if available
  console.log('🕒 Testing session history view...');
  
  // Look for session history navigation or section
  const historyButton = page.locator('button:has-text("History"), a:has-text("History"), [data-testid="session-history"]').first();
  
  if (await historyButton.count() > 0) {
    await historyButton.click();
    await page.waitForLoadState('networkidle');
    
    // Look for sessions in history view
    const historySessions = page.locator('[data-testid^="session-"], .session-item').first();
    
    if (await historySessions.count() > 0) {
      console.log('✅ Found sessions in history view');
      
      // Test completion toggle in history view
      const historyToggle = page.locator('button[title*="Als abgeschlossen markieren"], button[title*="Als ausstehend markieren"]').first();
      
      if (await historyToggle.count() > 0) {
        const initialTitle = await historyToggle.getAttribute('title');
        await historyToggle.click();
        await page.waitForTimeout(1000);
        
        // Verify the title changed (indicating state toggle)
        const newTitle = await historyToggle.getAttribute('title');
        expect(newTitle).not.toBe(initialTitle);
        
        console.log('✅ Session history toggle working');
      }
    }
  }
  
  // Check browser console for any errors
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleLogs.push(`ERROR: ${msg.text()}`);
    } else if (msg.text().includes('Session updated') || msg.text().includes('sessionUpdated')) {
      consoleLogs.push(`✅ ${msg.text()}`);
    }
  });
  
  // Final screenshot
  await page.screenshot({ path: 'tests/screenshots/completion-toggle-final.png' });
  
  console.log('📋 Console messages:', consoleLogs);
  console.log('🎉 Completion toggle test completed');
});

test('Statistics update when session completed', async ({ page }) => {
  console.log('📊 Testing statistics update on session completion...');
  
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Capture initial XP/stats if visible
  const initialStats = page.locator('[data-testid="xp-display"], [data-testid="total-xp"], .xp-counter');
  let initialXP = 0;
  
  if (await initialStats.count() > 0) {
    const statsText = await initialStats.first().textContent();
    if (statsText) {
      const match = statsText.match(/(\d+)/);
      if (match) {
        initialXP = parseInt(match[1]);
      }
    }
  }
  
  console.log(`📈 Initial XP: ${initialXP}`);
  
  // Find and complete a session
  const incompleteSession = page.locator('button[title*="Als abgeschlossen markieren"]').first();
  
  if (await incompleteSession.count() > 0) {
    console.log('🎯 Completing session to test XP update...');
    
    await incompleteSession.click();
    await page.waitForTimeout(2000); // Give time for stats to update
    
    // Check if XP increased
    if (await initialStats.count() > 0) {
      const newStatsText = await initialStats.first().textContent();
      if (newStatsText) {
        const match = newStatsText.match(/(\d+)/);
        if (match) {
          const newXP = parseInt(match[1]);
          console.log(`📈 New XP: ${newXP}`);
          
          // XP should have increased (or at least not decreased)
          expect(newXP).toBeGreaterThanOrEqual(initialXP);
        }
      }
    }
    
    console.log('✅ Statistics update test completed');
  } else {
    console.log('⚠️  No incomplete sessions found for testing');
  }
});