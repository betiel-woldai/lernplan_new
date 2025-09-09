import { test, expect } from '@playwright/test';

test.describe('Dashboard → Übersicht Transformation', () => {
  test('should display calendar-primary layout with compact widgets', async ({ page }) => {
    // Navigate to the homepage (Übersicht)
    await page.goto('http://localhost:3000/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check page title contains "Übersicht"
    await expect(page).toHaveTitle(/Übersicht/);

    // Check header shows "Übersicht" instead of "Dashboard"
    const headerText = await page.locator('h1').textContent();
    expect(headerText).toContain('Übersicht');

    // Verify main layout: Calendar should be primary (3/4 width)
    const calendarSection = page.locator('.lg\\:col-span-3');
    await expect(calendarSection).toBeVisible();

    // Verify sidebar exists (1/4 width) with QuickStatsPanel
    const sidebarSection = page.locator('.lg\\:col-span-1');
    await expect(sidebarSection).toBeVisible();

    // Check calendar is embedded in the main view
    const calendarComponent = page.locator('.lg\\:col-span-3').locator('text=Lernkalender');
    await expect(calendarComponent).toBeVisible();

    // Verify compact widgets are in sidebar
    const quickStatsHeader = page.locator('text=Schnellübersicht');
    await expect(quickStatsHeader).toBeVisible();

    // Check specific compact widgets exist
    await expect(page.locator('text=Heutige Lernzeit')).toBeVisible();
    await expect(page.locator('text=Lernstreak')).toBeVisible();
    await expect(page.locator('text=Level & XP')).toBeVisible();

    // Take screenshot of the transformed dashboard
    await page.screenshot({ 
      path: 'tmp/dashboard-uebersicht-transformation.png',
      fullPage: true 
    });

    console.log('✅ Dashboard successfully transformed to Übersicht with calendar-primary layout');
  });

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // On mobile, layout should stack vertically
    const calendarSection = page.locator('.lg\\:col-span-3');
    const sidebarSection = page.locator('.lg\\:col-span-1');
    
    await expect(calendarSection).toBeVisible();
    await expect(sidebarSection).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ 
      path: 'tmp/dashboard-uebersicht-mobile.png',
      fullPage: true 
    });

    console.log('✅ Mobile responsive design maintained');
  });

  test('should have working navigation with "Übersicht" label', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Check navigation shows "Übersicht" (German) instead of "Dashboard"
    const navLink = page.locator('nav a[href="/"]');
    const navText = await navLink.textContent();
    
    // Should be "Übersicht" for German locale
    expect(navText?.trim()).toBe('Übersicht');

    console.log('✅ Navigation correctly shows "Übersicht"');
  });
});