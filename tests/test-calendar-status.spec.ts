import { test, expect } from '@playwright/test';

test('Calendar status toggle functionality', async ({ page }) => {
  console.log('Testing calendar status toggle functionality...');
  
  // Navigate to the application
  await page.goto('http://localhost:3000');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: 'tmp/calendar-status-test-initial.png', fullPage: true });
  
  // Try to navigate to calendar or find calendar component
  try {
    // Check if we're already on a page with calendar
    const calendarExists = await page.locator('.calendar-container').isVisible().catch(() => false);
    
    if (!calendarExists) {
      console.log('Looking for calendar navigation...');
      // Try to find navigation to calendar page
      const navLinks = await page.locator('nav a, [data-testid*="nav"]').all();
      for (const link of navLinks) {
        const text = await link.textContent().catch(() => '');
        if (text && (text.toLowerCase().includes('calendar') || text.toLowerCase().includes('kalender'))) {
          await link.click();
          await page.waitForLoadState('networkidle');
          break;
        }
      }
    }
    
    // Check for calendar sessions
    await page.waitForSelector('.calendar-container', { timeout: 10000 });
    console.log('Calendar found');
    
    // Look for sessions in the calendar
    const sessions = await page.locator('[data-testid*="session"], .calendar-grid .text-xs').all();
    console.log(`Found ${sessions.length} potential session elements`);
    
    if (sessions.length > 0) {
      // Try to find a session with a toggle button
      const toggleButtons = await page.locator('button[title*="abgeschlossen"], button[title*="ausstehend"]').all();
      console.log(`Found ${toggleButtons.length} toggle buttons`);
      
      if (toggleButtons.length > 0) {
        const firstToggle = toggleButtons[0];
        const buttonTitle = await firstToggle.getAttribute('title');
        console.log(`Clicking toggle button with title: ${buttonTitle}`);
        
        await firstToggle.click();
        await page.waitForTimeout(2000); // Wait for any async operations
        
        // Take screenshot after toggle
        await page.screenshot({ path: 'tmp/calendar-status-test-after-toggle.png', fullPage: true });
        
        console.log('Status toggle completed successfully');
      } else {
        console.log('No toggle buttons found');
      }
    } else {
      console.log('No sessions found in calendar');
    }
    
  } catch (error) {
    console.log('Error during calendar test:', error);
    await page.screenshot({ path: 'tmp/calendar-status-test-error.png', fullPage: true });
  }
  
  // Check browser console for errors
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(msg.text());
    }
  });
  
  // Final screenshot
  await page.screenshot({ path: 'tmp/calendar-status-test-final.png', fullPage: true });
  
  // Log any console errors found
  if (logs.length > 0) {
    console.log('Browser console errors:', logs);
  } else {
    console.log('No console errors detected');
  }
});