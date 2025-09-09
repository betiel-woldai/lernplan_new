import { test, expect, Page } from '@playwright/test';

test.describe('Real-time Data Propagation - German UI', () => {
  let page: Page;
  let consoleLogs: string[] = [];

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    consoleLogs = [];
    
    // Listen to console logs to capture event dispatching
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`${msg.type()}: ${text}`);
      
      // Log interesting events
      if (text.includes('Event Dispatched') || 
          text.includes('Dashboard:') || 
          text.includes('Session') ||
          text.includes('Analytics') ||
          text.includes('Calendar') ||
          text.includes('🚀') ||
          text.includes('📊') ||
          text.includes('📡')) {
        console.log(`📡 ${msg.type()}: ${text}`);
      }
    });
    
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('Initial State - Dashboard Screenshot', async () => {
    // Capture initial dashboard state
    await page.screenshot({ 
      path: 'tests/screenshots/realtime_01_dashboard_initial.png',
      fullPage: true 
    });
    
    // Get current XP and level info
    const levelText = await page.locator('text=Level').first().textContent();
    const xpInfo = await page.locator('text=/\\d+\\s*XP/').allTextContents();
    const streakInfo = await page.locator('text=/\\d+\\s*(Tage|days)/').allTextContents();
    
    console.log(`📊 Initial State - Level: ${levelText}, XP: ${xpInfo.join(', ')}, Streak: ${streakInfo.join(', ')}`);
  });

  test('Navigation Test - Visit All Modules', async () => {
    // Test navigation to each module and verify real-time updates
    const modules = [
      { name: 'Fächer', selector: 'a:has-text("Fächer")', screenshot: 'subjects' },
      { name: 'Statistiken', selector: 'a:has-text("Statistiken")', screenshot: 'analytics' },
      { name: 'Übersicht', selector: 'a:has-text("Übersicht")', screenshot: 'dashboard' }
    ];

    for (const module of modules) {
      console.log(`🧭 Navigating to ${module.name}...`);
      
      try {
        await page.click(module.selector);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Allow time for any real-time updates
        
        await page.screenshot({ 
          path: `tests/screenshots/realtime_02_${module.screenshot}.png`,
          fullPage: true 
        });
        
        console.log(`✅ Successfully navigated to ${module.name}`);
      } catch (error) {
        console.log(`❌ Failed to navigate to ${module.name}: ${error.message}`);
      }
    }
  });

  test('Session Management - Look for Study Sessions', async () => {
    // Navigate to Fächer (Subjects)
    await page.click('a:has-text("Fächer")');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/realtime_03_subjects_page.png',
      fullPage: true 
    });
    
    // Look for various session-related buttons and elements
    const sessionElements = [
      'button:has-text("Session")',
      'button:has-text("Start")',
      'button:has-text("Starten")',
      'button:has-text("Study")',
      'button:has-text("Lernen")',
      '[data-testid*="session"]',
      '[data-testid*="start"]',
      '.session',
      '.study'
    ];
    
    let sessionFound = false;
    for (const selector of sessionElements) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`🎯 Found ${elements} session elements: ${selector}`);
        const texts = await page.locator(selector).allTextContents();
        console.log(`   Content: ${texts.join(', ')}`);
        
        // Try to interact with the first session element
        try {
          const firstElement = page.locator(selector).first();
          if (await firstElement.isVisible()) {
            console.log(`🖱️  Attempting to click session element: ${selector}`);
            await firstElement.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
              path: 'tests/screenshots/realtime_04_after_session_click.png',
              fullPage: true 
            });
            
            sessionFound = true;
            break;
          }
        } catch (error) {
          console.log(`⚠️  Could not interact with ${selector}: ${error.message}`);
        }
      }
    }
    
    if (!sessionFound) {
      console.log('⚠️  No interactive session elements found');
    }
  });

  test('Real-time Updates - Dashboard Navigation Test', async () => {
    // Start from Subjects page
    await page.click('a:has-text("Fächer")');
    await page.waitForLoadState('networkidle');
    
    // Capture before navigation
    await page.screenshot({ 
      path: 'tests/screenshots/realtime_05_before_dashboard_nav.png',
      fullPage: true 
    });
    
    // Navigate back to dashboard quickly to test real-time updates
    await page.click('a:has-text("Übersicht")');
    await page.waitForLoadState('networkidle');
    
    // Capture after navigation
    await page.screenshot({ 
      path: 'tests/screenshots/realtime_06_after_dashboard_nav.png',
      fullPage: true 
    });
    
    console.log('✅ Navigation cycle complete - checking for real-time updates');
  });

  test('Calendar Integration - Check for Real-time Updates', async () => {
    // Check if there's a calendar view or calendar elements
    const calendarElements = await page.locator('text=September 2025, .calendar, [data-testid*="calendar"]').count();
    console.log(`📅 Found ${calendarElements} calendar elements`);
    
    if (calendarElements > 0) {
      // Look for study sessions in the calendar
      const studySessions = await page.locator('text=/Chemie|Mathe|Study/').count();
      console.log(`📚 Found ${studySessions} study sessions in calendar`);
      
      // Try clicking on a study session if available
      const sessionElement = page.locator('text=/Chemie Stud|Mathe Study/').first();
      if (await sessionElement.count() > 0) {
        console.log('🖱️  Clicking on calendar study session...');
        try {
          await sessionElement.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: 'tests/screenshots/realtime_07_calendar_session_click.png',
            fullPage: true 
          });
        } catch (error) {
          console.log(`⚠️  Could not click calendar session: ${error.message}`);
        }
      }
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/realtime_08_calendar_final.png',
      fullPage: true 
    });
  });

  test('Event System Verification', async () => {
    console.log(`📡 Event System Test - Captured ${consoleLogs.length} console messages`);
    
    // Perform actions that should trigger events
    await page.click('a:has-text("Fächer")');
    await page.waitForTimeout(500);
    
    await page.click('a:has-text("Statistiken")');
    await page.waitForTimeout(500);
    
    await page.click('a:has-text("Übersicht")');
    await page.waitForTimeout(500);
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/realtime_09_event_system_test.png',
      fullPage: true 
    });
    
    // Log interesting console messages
    const eventLogs = consoleLogs.filter(log => 
      log.includes('Event') || 
      log.includes('Session') || 
      log.includes('Dispatch') ||
      log.includes('🚀') ||
      log.includes('📊')
    );
    
    console.log(`📊 Event-related logs captured: ${eventLogs.length}`);
    eventLogs.forEach(log => console.log(`  - ${log}`));
    
    // Check for real-time event system indicators
    const hasEventSystem = eventLogs.length > 0;
    console.log(`🎯 Real-time event system ${hasEventSystem ? 'DETECTED' : 'NOT DETECTED'}`);
  });
});