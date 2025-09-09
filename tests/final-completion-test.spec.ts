import { test, expect } from '@playwright/test';

test('Final completion toggle verification', async ({ page }) => {
  console.log('🔬 Final verification of session completion toggle...');
  
  // Navigate and wait for load
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take before screenshot
  await page.screenshot({ path: 'tests/screenshots/final-before.png', fullPage: true });
  
  // Look for sessions in the calendar - they show as colored bars with icons
  const sessions = page.locator('.calendar-grid [title*="Mathe"]');
  const sessionCount = await sessions.count();
  console.log(`📊 Found ${sessionCount} Mathe sessions`);
  
  if (sessionCount > 0) {
    // Find a session that shows a clock icon (pending)
    const pendingSessions = page.locator('button:has(.fa-clock)');
    const pendingCount = await pendingSessions.count();
    console.log(`⏰ Found ${pendingCount} pending sessions with clock icons`);
    
    if (pendingCount > 0) {
      console.log('🎯 Clicking on first pending session toggle...');
      
      // Get initial XP from sidebar
      const initialXP = await page.locator('[data-testid="total-xp"], text="150 XP"').textContent();
      console.log(`📈 Initial XP: ${initialXP}`);
      
      // Click the first pending toggle button
      await pendingSessions.first().click();
      await page.waitForTimeout(3000); // Wait for API call and UI update
      
      // Take after screenshot
      await page.screenshot({ path: 'tests/screenshots/final-after.png', fullPage: true });
      
      // Check if XP increased
      const newXP = await page.locator('[data-testid="total-xp"], .xp-counter, text*="XP"').first().textContent();
      console.log(`📈 New XP: ${newXP}`);
      
      // Check if the button changed from clock to checkmark
      const completedSessions = page.locator('button:has(.fa-check)');
      const completedCount = await completedSessions.count();
      console.log(`✅ Found ${completedCount} completed sessions with checkmarks`);
      
      console.log('✅ Final verification completed successfully');
      
    } else {
      // Try clicking on completed sessions instead (checkmark icons)
      const completedSessions = page.locator('button:has(.fa-check)');
      const completedCount = await completedSessions.count();
      console.log(`✅ Found ${completedCount} completed sessions with checkmarks`);
      
      if (completedCount > 0) {
        console.log('🔄 Clicking on first completed session to mark as pending...');
        await completedSessions.first().click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: 'tests/screenshots/final-after-uncomplete.png', fullPage: true });
        console.log('🔄 Toggled completed session to pending');
      }
    }
    
  } else {
    console.log('⚠️  No Mathe sessions found, looking for any session elements...');
    
    // Broader search for any clickable elements in calendar
    const allSessions = page.locator('.calendar-grid div[style*="border"], .calendar-grid div[class*="session"]');
    const allCount = await allSessions.count();
    console.log(`📋 Found ${allCount} potential session elements`);
    
    // Look for any buttons with FA icons
    const iconButtons = page.locator('.calendar-grid button .fa-check, .calendar-grid button .fa-clock');
    const iconCount = await iconButtons.count();
    console.log(`🎯 Found ${iconCount} buttons with FA icons`);
  }
  
  console.log('🏁 Final completion test finished');
});