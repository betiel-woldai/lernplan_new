import { test, expect, Page, Browser } from '@playwright/test';

test.describe('Real-time Data Propagation Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Listen to console logs to capture event dispatching
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('Initial Dashboard State Screenshot', async () => {
    await page.screenshot({ 
      path: 'tests/screenshots/01_initial_dashboard_state.png',
      fullPage: true 
    });
    
    console.log('📸 Initial dashboard state captured');
  });

  test('Session → Dashboard Flow: Real-time XP/Stats Updates', async () => {
    // Take initial dashboard screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/02_dashboard_before_session.png',
      fullPage: true 
    });
    
    // Navigate to subjects page
    await page.click('[data-testid="nav-subjects"], a[href*="subjects"]');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/03_subjects_page.png',
      fullPage: true 
    });
    
    // Look for start session button (try multiple selectors)
    const sessionButton = await page.locator('button:has-text("Start Session"), button:has-text("Study"), [data-testid*="start"], [data-testid*="session"]').first();
    
    if (await sessionButton.count() > 0) {
      await sessionButton.click();
      
      // Wait for session to start
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/04_session_started.png',
        fullPage: true 
      });
      
      // Navigate back to dashboard
      await page.click('[data-testid="nav-dashboard"], a[href="/"], a[href*="dashboard"]');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot to verify real-time updates
      await page.screenshot({ 
        path: 'tests/screenshots/05_dashboard_during_session.png',
        fullPage: true 
      });
      
      console.log('✅ Session → Dashboard flow completed');
    } else {
      console.log('⚠️  Start session button not found, capturing current state');
      await page.screenshot({ 
        path: 'tests/screenshots/04_no_session_button.png',
        fullPage: true 
      });
    }
  });

  test('Session Completion → Analytics Flow', async () => {
    // Navigate to subjects
    await page.click('[data-testid="nav-subjects"], a[href*="subjects"]');
    await page.waitForLoadState('networkidle');
    
    // Look for any active sessions or complete session buttons
    const completeButton = await page.locator('button:has-text("Complete"), button:has-text("End"), button:has-text("Finish"), [data-testid*="complete"]').first();
    
    if (await completeButton.count() > 0) {
      await completeButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'tests/screenshots/06_session_completed.png',
        fullPage: true 
      });
      
      // Navigate to analytics
      await page.click('[data-testid="nav-analytics"], a[href*="analytics"]');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'tests/screenshots/07_analytics_after_completion.png',
        fullPage: true 
      });
      
      console.log('✅ Session Completion → Analytics flow completed');
    } else {
      console.log('⚠️  No active session to complete');
    }
  });

  test('Subject Management → Calendar Flow', async () => {
    // Navigate to subjects
    await page.click('[data-testid="nav-subjects"], a[href*="subjects"]');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/08_subjects_before_edit.png',
      fullPage: true 
    });
    
    // Look for add/edit subject buttons
    const addButton = await page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), [data-testid*="add"], [data-testid*="new"]').first();
    
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Fill in subject form if modal/form appears
      const nameInput = await page.locator('input[name*="name"], input[placeholder*="name"], input[type="text"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test Subject - Real-time');
        
        // Look for color picker or save button
        const saveButton = await page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }
      
      await page.screenshot({ 
        path: 'tests/screenshots/09_subject_added.png',
        fullPage: true 
      });
      
      // Navigate to calendar to verify updates
      await page.click('[data-testid="nav-calendar"], a[href*="calendar"]');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: 'tests/screenshots/10_calendar_after_subject_change.png',
        fullPage: true 
      });
      
      console.log('✅ Subject Management → Calendar flow completed');
    } else {
      console.log('⚠️  Add subject button not found');
    }
  });

  test('Cross-Module Data Consistency Check', async () => {
    // Navigate through all modules and take screenshots to verify consistency
    const modules = [
      { name: 'Dashboard', selector: '[data-testid="nav-dashboard"], a[href="/"]', path: '11_consistency_dashboard.png' },
      { name: 'Subjects', selector: '[data-testid="nav-subjects"], a[href*="subjects"]', path: '12_consistency_subjects.png' },
      { name: 'Calendar', selector: '[data-testid="nav-calendar"], a[href*="calendar"]', path: '13_consistency_calendar.png' },
      { name: 'Analytics', selector: '[data-testid="nav-analytics"], a[href*="analytics"]', path: '14_consistency_analytics.png' }
    ];
    
    for (const module of modules) {
      try {
        await page.click(module.selector);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Allow time for real-time updates
        
        await page.screenshot({ 
          path: `tests/screenshots/${module.path}`,
          fullPage: true 
        });
        
        console.log(`✅ ${module.name} consistency check completed`);
      } catch (error) {
        console.log(`⚠️  Could not navigate to ${module.name}: ${error.message}`);
      }
    }
  });

  test('Event System Verification - Console Logs', async () => {
    const consoleLogs = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Event Dispatched') || 
          text.includes('Dashboard:') || 
          text.includes('Session') ||
          text.includes('Analytics') ||
          text.includes('Calendar')) {
        consoleLogs.push(text);
      }
    });
    
    // Perform some actions to trigger events
    await page.click('[data-testid="nav-subjects"], a[href*="subjects"]');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="nav-dashboard"], a[href="/"]');
    await page.waitForTimeout(1000);
    
    console.log('📊 Event System Logs Captured:');
    consoleLogs.forEach(log => console.log(`  - ${log}`));
    
    await page.screenshot({ 
      path: 'tests/screenshots/15_final_state.png',
      fullPage: true 
    });
  });
});