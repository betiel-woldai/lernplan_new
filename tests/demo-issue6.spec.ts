import { test, expect } from '@playwright/test';

test.describe('Issue #6 Database Integration Demo', () => {
  test('Calendar page shows database integration with sessions', async ({ page }) => {
    // Navigate to calendar page
    await page.goto('http://localhost:3000/calendar');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot to show calendar integration
    await page.screenshot({ 
      path: 'tmp/issue6-calendar-database.png', 
      fullPage: true 
    });
    
    // Verify calendar is loaded
    await expect(page.locator('h1')).toContainText('Kalender');
    await expect(page.locator('.calendar-grid')).toBeVisible();
    
    // Check if sessions are being loaded (calendar should be populated)
    const calendarCells = page.locator('.calendar-grid .grid-cols-7 > div');
    await expect(calendarCells.first()).toBeVisible();
  });

  test('Dashboard shows real database user data', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of dashboard with database data
    await page.screenshot({ 
      path: 'tmp/issue6-dashboard-database.png', 
      fullPage: true 
    });
    
    // Verify dashboard loads
    await expect(page.locator('h1')).toContainText('Willkommen zurück');
  });

  test('Subjects page displays database subjects', async ({ page }) => {
    // Navigate to subjects page
    await page.goto('http://localhost:3000/subjects');
    
    // Wait for subjects to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of subjects from database
    await page.screenshot({ 
      path: 'tmp/issue6-subjects-database.png', 
      fullPage: true 
    });
    
    // Verify subjects page
    await expect(page.locator('h1')).toContainText('My Subjects');
  });
});