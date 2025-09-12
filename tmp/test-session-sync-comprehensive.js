const { chromium } = require('playwright');

async function testSessionSynchronization() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('🎬 Starting comprehensive session synchronization test...');
  
  try {
    // 1. Navigate to the application
    console.log('📍 Step 1: Navigating to application...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-01-initial.png',
      fullPage: true
    });
    
    // 2. Navigate to Subjects page first
    console.log('📍 Step 2: Navigating to Subjects page...');
    await page.click('text=Fächer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-02-subjects-page.png',
      fullPage: true
    });
    
    // 3. Start a session from Subjects page
    console.log('📍 Step 3: Starting session from Subjects page...');
    
    // Look for session start button or heart icon
    const sessionButtons = await page.locator('[data-testid*="session"], .heart-icon, [title*="Session"], button:has-text("Session")').all();
    console.log(`Found ${sessionButtons.length} potential session buttons`);
    
    if (sessionButtons.length > 0) {
      await sessionButtons[0].click();
      await page.waitForTimeout(1000);
      
      // If modal opens, fill and submit
      const modal = page.locator('[role="dialog"], .modal, [data-testid="session-modal"]');
      if (await modal.isVisible()) {
        console.log('   Modal opened, filling session details...');
        
        // Try to select subject if dropdown exists
        const subjectSelect = page.locator('select[name="subject"], [data-testid="subject-select"]');
        if (await subjectSelect.isVisible()) {
          await subjectSelect.selectOption({ index: 1 }); // Select first available option
        }
        
        // Try to fill duration
        const durationInput = page.locator('input[name="duration"], [data-testid="duration-input"]');
        if (await durationInput.isVisible()) {
          await durationInput.fill('25');
        }
        
        // Submit the form
        const submitButton = page.locator('button:has-text("Starten"), button:has-text("Start"), button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-03-session-started-subjects.png',
      fullPage: true
    });
    
    // 4. Immediately check Overview page for sync
    console.log('📍 Step 4: Checking Overview page for real-time sync...');
    await page.click('text=Übersicht');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-04-overview-after-session.png',
      fullPage: true
    });
    
    // 5. Check Calendar page for sync
    console.log('📍 Step 5: Checking Calendar page for session sync...');
    await page.click('text=Kalender');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-05-calendar-after-session.png',
      fullPage: true
    });
    
    // 6. Start another session from Overview page
    console.log('📍 Step 6: Starting session from Overview page...');
    await page.click('text=Übersicht');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for add session button or similar
    const addButtons = await page.locator('button:has-text("Session"), button:has-text("Hinzufügen"), .add-session, [data-testid*="add"]').all();
    console.log(`Found ${addButtons.length} add session buttons`);
    
    if (addButtons.length > 0) {
      await addButtons[0].click();
      await page.waitForTimeout(1000);
      
      // Fill modal if it opens
      const modal = page.locator('[role="dialog"], .modal, [data-testid="session-modal"]');
      if (await modal.isVisible()) {
        console.log('   Modal opened from Overview, filling details...');
        
        const subjectSelect = page.locator('select[name="subject"], [data-testid="subject-select"]');
        if (await subjectSelect.isVisible()) {
          await subjectSelect.selectOption({ index: 2 }); // Select different subject
        }
        
        const durationInput = page.locator('input[name="duration"], [data-testid="duration-input"]');
        if (await durationInput.isVisible()) {
          await durationInput.fill('30');
        }
        
        const submitButton = page.locator('button:has-text("Starten"), button:has-text("Start"), button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-06-overview-second-session.png',
      fullPage: true
    });
    
    // 7. Check Calendar immediately for second session sync
    console.log('📍 Step 7: Verifying second session sync in Calendar...');
    await page.click('text=Kalender');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-07-calendar-second-session.png',
      fullPage: true
    });
    
    // 8. Test session completion and status sync
    console.log('📍 Step 8: Testing session completion sync...');
    
    // Find sessions in calendar and try to complete one
    const sessions = await page.locator('[data-testid*="session"], .session-item, .calendar-session').all();
    console.log(`Found ${sessions.length} sessions in calendar`);
    
    if (sessions.length > 0) {
      // Click on a session to open details or complete it
      await sessions[0].click();
      await page.waitForTimeout(1000);
      
      // Look for completion toggle or status change
      const statusToggle = page.locator('input[type="checkbox"], .toggle, .status-toggle, button:has-text("Abgeschlossen")');
      if (await statusToggle.isVisible()) {
        await statusToggle.click();
        await page.waitForTimeout(1000);
        
        // Save changes if needed
        const saveButton = page.locator('button:has-text("Speichern"), button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
        
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-08-session-completed.png',
      fullPage: true
    });
    
    // 9. Check Overview for completion sync
    console.log('📍 Step 9: Checking Overview for completion sync...');
    await page.click('text=Übersicht');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-09-overview-completion-sync.png',
      fullPage: true
    });
    
    // 10. Check Analytics for statistics update
    console.log('📍 Step 10: Checking Analytics for statistics update...');
    await page.click('text=Analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-10-analytics-updated.png',
      fullPage: true
    });
    
    // 11. Test calendar editing and statistics sync
    console.log('📍 Step 11: Testing calendar editing and statistics sync...');
    await page.click('text=Kalender');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Try to edit a session in calendar
    const calendarSessions = await page.locator('[data-testid*="session"], .session-item, .calendar-session').all();
    if (calendarSessions.length > 0) {
      await calendarSessions[calendarSessions.length - 1].click(); // Click last session
      await page.waitForTimeout(1000);
      
      // Try to change duration or other properties
      const durationInput = page.locator('input[name="duration"], [data-testid="duration-input"]');
      if (await durationInput.isVisible()) {
        await durationInput.fill('45'); // Change duration
        
        const saveButton = page.locator('button:has-text("Speichern"), button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-11-calendar-edited.png',
      fullPage: true
    });
    
    // 12. Final check - Analytics after calendar edit
    console.log('📍 Step 12: Final Analytics check after calendar edit...');
    await page.click('text=Analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-12-final-analytics.png',
      fullPage: true
    });
    
    console.log('✅ Session synchronization test completed successfully!');
    console.log('📸 Screenshots saved to tmp/ folder');
    
    // Measure timing by checking console logs
    const logs = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      return entries.map(entry => ({
        type: entry.type,
        duration: entry.duration,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart
      }));
    });
    
    console.log('⏱️  Performance measurements:', JSON.stringify(logs, null, 2));
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/sync-test-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

// Run the test
testSessionSynchronization().then(() => {
  console.log('🎉 Test completed');
}).catch(error => {
  console.error('💥 Test failed:', error);
});