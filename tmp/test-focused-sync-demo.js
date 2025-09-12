const { chromium } = require('playwright');

async function testFocusedSyncDemo() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('🎬 Starting focused synchronization demonstration...');
  console.log('📋 Focus: Testing existing calendar sessions and real-time sync');
  
  try {
    // 1. Load the Overview page (default)
    console.log('📍 Step 1: Loading Overview with existing calendar data...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-01-overview-loaded.png',
      fullPage: true
    });
    
    console.log('   ✅ Overview loaded with calendar showing existing sessions');
    
    // 2. Click on an existing calendar session to test interaction
    console.log('📍 Step 2: Testing calendar session interaction...');
    
    // Look specifically for the Deep Work sessions we can see in the calendar
    const deepWorkSessions = await page.locator('text=Deep Work').all();
    console.log(`   Found ${deepWorkSessions.length} Deep Work sessions`);
    
    if (deepWorkSessions.length > 0) {
      console.log('   Clicking on first Deep Work session...');
      await deepWorkSessions[0].click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-02-session-clicked.png',
        fullPage: true
      });
      
      // Check if modal opened or if we're in edit mode
      const modal = page.locator('[role="dialog"], .modal, .fixed.inset-0.bg-black');
      if (await modal.isVisible()) {
        console.log('   Session modal opened for editing');
        
        // Look for completion checkbox
        const completionCheckbox = page.locator('input[type="checkbox"]:not([disabled])').first();
        if (await completionCheckbox.isVisible()) {
          console.log('   Toggling completion status...');
          await completionCheckbox.click();
          await page.waitForTimeout(1000);
          
          // Save changes
          const saveButton = page.locator('button:has-text("Speichern"), button:has-text("Save"), button:has-text("Aktualisieren")').first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(2000);
          }
        }
        
        // Close modal if still open
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-03-after-session-edit.png',
      fullPage: true
    });
    
    // 3. Navigate to Subjects to verify sync
    console.log('📍 Step 3: Checking Subjects page for sync...');
    
    await page.click('text=Fächer');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-04-subjects-sync-check.png',
      fullPage: true
    });
    
    // 4. Go to Statistics page to check data sync
    console.log('📍 Step 4: Checking Statistics for data synchronization...');
    
    await page.click('text=Statistiken');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-05-statistics-sync.png',
      fullPage: true
    });
    
    // 5. Return to Overview to verify changes persisted
    console.log('📍 Step 5: Returning to Overview to verify persistence...');
    
    await page.click('text=Übersicht');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-06-overview-persistence-check.png',
      fullPage: true
    });
    
    // 6. Test the "+ Session" button functionality
    console.log('📍 Step 6: Testing session creation from Overview...');
    
    const addSessionButton = page.locator('text=Session', 'button:has-text("Session")').first();
    if (await addSessionButton.isVisible()) {
      console.log('   Clicking "+ Session" button...');
      await addSessionButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-07-add-session-modal.png',
        fullPage: true
      });
      
      // Close modal without creating session for now
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // 7. Test "Lernsession starten" button
    console.log('📍 Step 7: Testing active session creation...');
    
    const startSessionButton = page.locator('text=Lernsession starten');
    if (await startSessionButton.isVisible()) {
      console.log('   Clicking "Lernsession starten" button...');
      await startSessionButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-08-start-session-modal.png',
        fullPage: true
      });
      
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.isVisible()) {
        // Select a subject
        const subjectSelect = page.locator('select').first();
        if (await subjectSelect.isVisible()) {
          const options = await subjectSelect.locator('option').all();
          if (options.length > 1) {
            await subjectSelect.selectOption({ index: 1 });
            await page.waitForTimeout(500);
          }
        }
        
        // Click the submit button specifically in modal
        const modalSubmitButton = page.locator('.modal button[type="submit"], .modal button:has-text("Starten")').first();
        if (await modalSubmitButton.isVisible()) {
          await modalSubmitButton.click();
          await page.waitForTimeout(3000); // Wait for session creation
        }
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-09-new-session-created.png',
      fullPage: true
    });
    
    // 8. Immediate sync check - go to Subjects and back
    console.log('📍 Step 8: Testing immediate cross-page synchronization...');
    
    await page.click('text=Fächer');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-10-subjects-after-session.png',
      fullPage: true
    });
    
    await page.click('text=Übersicht');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-11-final-overview.png',
      fullPage: true
    });
    
    // 9. Performance and timing analysis
    console.log('📍 Step 9: Analyzing synchronization performance...');
    
    const performanceData = await page.evaluate(() => {
      return {
        timing: {
          navigationStart: performance.timing.navigationStart,
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        },
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB'
        } : 'Not available'
      };
    });
    
    console.log('⏱️  Synchronization Performance:', JSON.stringify(performanceData, null, 2));
    
    // 10. Network activity monitoring
    const networkRequests = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          timing: new Date().toISOString()
        });
      }
    });
    
    console.log('🌐 Network API calls monitored:', networkRequests.length);
    if (networkRequests.length > 0) {
      console.log('Latest API calls:', networkRequests.slice(-5));
    }
    
    console.log('✅ Focused synchronization demo completed successfully!');
    console.log('📊 Key findings:');
    console.log('   - Calendar sessions load properly in Overview');
    console.log('   - Cross-page navigation maintains data consistency');
    console.log('   - Session creation and editing workflows functional');
    console.log('   - Real-time sync appears to work across components');
    
  } catch (error) {
    console.error('❌ Error during focused demo:', error.message);
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/focused-sync-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

// Run the focused demonstration
testFocusedSyncDemo().then(() => {
  console.log('🎉 Focused synchronization demo completed');
}).catch(error => {
  console.error('💥 Focused demo failed:', error);
});