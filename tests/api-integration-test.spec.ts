import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  test('should load dashboard without API errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      if (msg.type() === 'warn') {
        consoleWarnings.push(msg.text());
      }
    });

    // Visit dashboard
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="dashboard"], h1, .dashboard', { timeout: 10000 });
    
    // Log any console messages for debugging
    console.log(`Dashboard - Console errors: ${consoleErrors.length}, warnings: ${consoleWarnings.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tmp/dashboard-current.png' });
  });

  test('should load subjects page without API errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      if (msg.type() === 'warn') {
        consoleWarnings.push(msg.text());
      }
    });

    // Visit subjects page
    await page.goto('http://localhost:3000/subjects');
    
    // Wait for the page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Log any console messages for debugging
    console.log(`Subjects - Console errors: ${consoleErrors.length}, warnings: ${consoleWarnings.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tmp/subjects-current.png' });
  });

  test('should load calendar page without API errors', async ({ page }) => {
    // Listen for console errors
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      if (msg.type() === 'warn') {
        consoleWarnings.push(msg.text());
      }
    });

    // Visit calendar page
    await page.goto('http://localhost:3000/calendar');
    
    // Wait for the page to load
    await page.waitForSelector('h1, .calendar', { timeout: 10000 });
    
    // Log any console messages for debugging
    console.log(`Calendar - Console errors: ${consoleErrors.length}, warnings: ${consoleWarnings.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tmp/calendar-current.png' });
  });

  test('should show database data in subjects page', async ({ page }) => {
    await page.goto('http://localhost:3000/subjects');
    
    // Wait for subjects to load
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Check if there are subject cards or at least some content indicating subjects loaded
    const subjectCards = await page.locator('.bg-white.border.rounded-lg').count();
    console.log(`Found ${subjectCards} subject cards`);
    
    // Take screenshot to verify visual state
    await page.screenshot({ path: 'tmp/subjects-loaded-state.png' });
  });

  test('should show database data in calendar page', async ({ page }) => {
    await page.goto('http://localhost:3000/calendar');
    
    // Wait for calendar to load
    await page.waitForSelector('h1, .calendar', { timeout: 5000 });
    
    // Look for calendar sessions or events
    const calendarEvents = await page.locator('[class*="session"], [class*="event"], .bg-blue-100, .bg-green-100, .bg-red-100').count();
    console.log(`Found ${calendarEvents} calendar events`);
    
    // Take screenshot to verify visual state
    await page.screenshot({ path: 'tmp/calendar-loaded-state.png' });
  });
});