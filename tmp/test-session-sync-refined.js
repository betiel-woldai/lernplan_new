const { chromium } = require('playwright');

async function closeAnyModal(page) {
  try {
    // Try to close modal with Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Try clicking outside modal
    const modal = page.locator('[role="dialog"], .modal, .fixed.inset-0');
    if (await modal.isVisible()) {
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);
    }
    
    // Try close button
    const closeButton = page.locator('button[aria-label="Close"], button:has-text("×"), button:has-text("Schließen"), .close-button');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
  } catch (error) {
    console.log('   Could not close modal, continuing...');
  }
}

async function navigateWithRetry(page, text, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await closeAnyModal(page);
      await page.click(`nav a:has-text("${text}"), a:has-text("${text}")`, { timeout: 5000 });
      await page.waitForLoadState('networkidle');
      return true;
    } catch (error) {
      console.log(`   Navigation attempt ${i + 1} failed, retrying...`);
      await page.waitForTimeout(1000);
    }
  }
  return false;
}

async function testSessionSynchronization() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('🎬 Starting refined session synchronization test...');
  
  try {
    // 1. Navigate to the application
    console.log('📍 Step 1: Navigating to application...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await closeAnyModal(page);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-01-initial.png',
      fullPage: true
    });
    
    // 2. Navigate to Subjects page
    console.log('📍 Step 2: Navigating to Subjects page...');
    const subjectsNavSuccess = await navigateWithRetry(page, 'Fächer');
    if (!subjectsNavSuccess) {
      console.log('   Could not navigate to Subjects, trying direct URL...');
      await page.goto('http://localhost:3000/subjects');
      await page.waitForLoadState('networkidle');
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-02-subjects.png',
      fullPage: true
    });
    
    // 3. Look for active sessions or heart icons
    console.log('📍 Step 3: Checking for existing sessions in Subjects...');
    
    // Check for heart icons indicating session can be started
    const hearts = await page.locator('.heart-icon, [data-testid*="heart"], .fa-heart').all();
    console.log(`   Found ${hearts.length} heart icons`);
    
    if (hearts.length > 0) {
      console.log('   Clicking heart icon to start session...');
      await hearts[0].click();
      await page.waitForTimeout(1000);
      
      // Handle modal if it appears
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.isVisible()) {
        console.log('   Session modal opened, filling details...');
        
        // Fill subject dropdown if exists
        const subjectSelect = page.locator('select:has-option, [role="combobox"]');
        if (await subjectSelect.isVisible()) {
          await subjectSelect.click();
          await page.waitForTimeout(500);
          const options = await subjectSelect.locator('option').all();
          if (options.length > 1) {
            await options[1].click(); // Select second option
          }
        }
        
        // Start the session
        const startButton = page.locator('button:has-text("Starten"), button:has-text("Start"), button[type="submit"]');
        if (await startButton.isVisible()) {
          await startButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-03-session-started.png',
      fullPage: true
    });
    
    // 4. Immediately check Overview for sync
    console.log('📍 Step 4: Checking Overview for real-time sync...');
    await closeAnyModal(page);
    
    const overviewSuccess = await navigateWithRetry(page, 'Übersicht');
    if (!overviewSuccess) {
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-04-overview-check.png',
      fullPage: true
    });
    
    // 5. Check Calendar for session sync
    console.log('📍 Step 5: Checking Calendar for session sync...');
    await closeAnyModal(page);
    
    const calendarSuccess = await navigateWithRetry(page, 'Kalender');
    if (!calendarSuccess) {
      await page.goto('http://localhost:3000/calendar');
      await page.waitForLoadState('networkidle');
    }
    
    await page.waitForTimeout(3000); // Allow calendar to load
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-05-calendar-check.png',
      fullPage: true
    });
    
    // 6. Test session status change in calendar
    console.log('📍 Step 6: Testing session status change in calendar...');
    
    // Look for calendar sessions
    const calendarSessions = await page.locator('.calendar-session, [data-date], .fc-event, .session-item').all();
    console.log(`   Found ${calendarSessions.length} potential calendar sessions`);
    
    if (calendarSessions.length > 0) {
      console.log('   Clicking on calendar session...');
      await calendarSessions[0].click();
      await page.waitForTimeout(1000);
      
      // Look for status toggle
      const statusToggle = page.locator('input[type="checkbox"]:not([disabled]), .toggle, [data-testid*="status"]');
      if (await statusToggle.isVisible()) {
        console.log('   Toggling session status...');
        await statusToggle.click();
        await page.waitForTimeout(1000);
        
        // Save if needed
        const saveButton = page.locator('button:has-text("Speichern"), button:has-text("Save"), button:has-text("Aktualisieren")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-06-status-changed.png',
      fullPage: true
    });
    
    // 7. Check Analytics for statistics update
    console.log('📍 Step 7: Checking Analytics for statistics update...');
    await closeAnyModal(page);
    
    const analyticsSuccess = await navigateWithRetry(page, 'Analytics');
    if (!analyticsSuccess) {
      await page.goto('http://localhost:3000/analytics');
      await page.waitForLoadState('networkidle');
    }
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-07-analytics-updated.png',
      fullPage: true
    });
    
    // 8. Return to Overview for final sync check
    console.log('📍 Step 8: Final Overview sync verification...');
    await closeAnyModal(page);
    
    await navigateWithRetry(page, 'Übersicht');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-08-final-overview.png',
      fullPage: true
    });
    
    // 9. Performance and timing analysis
    console.log('📍 Step 9: Analyzing performance and timing...');
    
    const timing = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.navigationStart
      };
    });
    
    console.log('⏱️  Navigation timing:', JSON.stringify(timing, null, 2));
    
    // Check for any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    if (errors.length > 0) {
      console.log('⚠️  Console errors detected:', errors);
    }
    
    console.log('✅ Refined session synchronization test completed!');
    console.log('📸 All screenshots saved to tmp/ folder with refined-sync- prefix');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/refined-sync-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

// Run the test
testSessionSynchronization().then(() => {
  console.log('🎉 Refined test completed');
}).catch(error => {
  console.error('💥 Refined test failed:', error);
});