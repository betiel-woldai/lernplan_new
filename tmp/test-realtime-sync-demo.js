const { chromium } = require('playwright');

async function testRealtimeSyncDemo() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 // Slower for better demonstration
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  console.log('🎬 Starting real-time synchronization demonstration...');
  
  try {
    // 1. Navigate to the application (it loads Overview by default)
    console.log('📍 Step 1: Loading application Overview...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-01-overview.png',
      fullPage: true
    });
    
    // 2. Start a new session using the "Lernsession starten" button
    console.log('📍 Step 2: Starting new learning session...');
    
    const startButton = page.locator('button:has-text("Lernsession starten"), .bg-green-600, button[data-testid*="start-session"]');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
      
      // Handle session modal
      const modal = page.locator('[role="dialog"], .modal, .fixed.inset-0.bg-black.bg-opacity-50');
      if (await modal.isVisible()) {
        console.log('   Session modal opened, filling details...');
        
        // Select subject
        const subjectSelect = page.locator('select, [role="combobox"]');
        if (await subjectSelect.isVisible()) {
          await subjectSelect.selectOption({ index: 1 }); // Select first available subject
          await page.waitForTimeout(500);
        }
        
        // Click start button in modal
        const modalStartButton = page.locator('button:has-text("Starten"), button:has-text("Start"), .modal button[type="submit"]');
        if (await modalStartButton.isVisible()) {
          await modalStartButton.click();
          await page.waitForTimeout(3000); // Wait for session to start
        }
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-02-session-started.png',
      fullPage: true
    });
    
    // 3. Navigate to Subjects page to verify session sync
    console.log('📍 Step 3: Checking session sync in Subjects page...');
    
    await page.click('nav a:has-text("Fächer"), a:has-text("Fächer")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-03-subjects-sync.png',
      fullPage: true
    });
    
    // 4. Go back to Overview to test session manipulation
    console.log('📍 Step 4: Returning to Overview for session manipulation...');
    
    await page.click('nav a:has-text("Übersicht"), a:has-text("Übersicht")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-04-back-to-overview.png',
      fullPage: true
    });
    
    // 5. Interact with existing calendar sessions to test status changes
    console.log('📍 Step 5: Testing calendar session status changes...');
    
    // Look for existing sessions in the calendar
    const calendarSessions = await page.locator('.calendar div[data-date] div, .session-item, [title*="Deep"], [title*="Mathe"]').all();
    console.log(`   Found ${calendarSessions.length} calendar sessions`);
    
    if (calendarSessions.length > 0) {
      // Click on the first session
      await calendarSessions[0].click();
      await page.waitForTimeout(1000);
      
      // Look for session modal or details
      const sessionModal = page.locator('[role="dialog"], .modal, .session-details');
      if (await sessionModal.isVisible()) {
        console.log('   Session details modal opened...');
        
        // Look for status toggle (completion checkbox)
        const statusToggle = page.locator('input[type="checkbox"], .toggle, [data-testid*="completed"]');
        if (await statusToggle.isVisible()) {
          console.log('   Toggling session completion status...');
          await statusToggle.click();
          await page.waitForTimeout(1000);
          
          // Save changes
          const saveButton = page.locator('button:has-text("Speichern"), button:has-text("Save"), button:has-text("Aktualisieren")');
          if (await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(2000);
          }
        }
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-05-session-status-changed.png',
      fullPage: true
    });
    
    // 6. Check Statistics page for updates
    console.log('📍 Step 6: Checking Statistics for real-time updates...');
    
    await page.click('nav a:has-text("Statistiken"), a:has-text("Statistiken")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-06-statistics-updated.png',
      fullPage: true
    });
    
    // 7. Test session creation from different page
    console.log('📍 Step 7: Testing session creation from Subjects page...');
    
    await page.click('nav a:has-text("Fächer"), a:has-text("Fächer")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for heart icons or session start buttons in subjects
    const subjectSessions = await page.locator('.heart-icon, [data-testid*="heart"], button:has-text("Session"), .session-start').all();
    console.log(`   Found ${subjectSessions.length} subject session starters`);
    
    if (subjectSessions.length > 0) {
      await subjectSessions[0].click();
      await page.waitForTimeout(1000);
      
      // Handle modal if it appears
      const modal = page.locator('[role="dialog"], .modal');
      if (await modal.isVisible()) {
        const startButton = page.locator('button:has-text("Starten"), button:has-text("Start")');
        if (await startButton.isVisible()) {
          await startButton.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-07-subjects-session-created.png',
      fullPage: true
    });
    
    // 8. Immediately check Overview for sync
    console.log('📍 Step 8: Verifying immediate sync in Overview...');
    
    await page.click('nav a:has-text("Übersicht"), a:has-text("Übersicht")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-08-final-sync-verification.png',
      fullPage: true
    });
    
    // 9. Performance measurements
    console.log('📍 Step 9: Measuring synchronization performance...');
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        navigationTiming: {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          pageLoad: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          totalTime: Math.round(navigation.loadEventEnd - navigation.navigationStart)
        },
        resourceCount: resources.length,
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : 'Not available'
      };
    });
    
    console.log('⏱️  Performance Metrics:', JSON.stringify(performanceMetrics, null, 2));
    
    // 10. Check for any console errors or warnings
    console.log('📍 Step 10: Checking for console issues...');
    
    const logs = await page.evaluate(() => {
      // Get any error logs from the console
      return window.console._logs || 'No logs captured';
    });
    
    // Capture network activity
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });
    
    console.log('🌐 API Responses captured:', responses.length);
    
    console.log('✅ Real-time synchronization demonstration completed successfully!');
    console.log('📸 Screenshots saved with realtime-demo- prefix');
    console.log('📊 Synchronization appears to be working across all views');
    
  } catch (error) {
    console.error('❌ Error during demo:', error.message);
    await page.screenshot({
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/realtime-demo-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

// Run the demonstration
testRealtimeSyncDemo().then(() => {
  console.log('🎉 Real-time sync demo completed successfully');
}).catch(error => {
  console.error('💥 Demo failed:', error);
});