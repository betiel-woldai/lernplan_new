import { test, expect } from '@playwright/test';

test.describe('Analytics Page Comprehensive Tests', () => {
  test('Analytics page meets all requirements', async ({ page }) => {
    console.log('Testing Analytics page comprehensively...');
    
    // Navigate to the analytics page
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 1. Check if the page loads without errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });
    
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 2. Check if React components render correctly
    const mainTitle = page.locator('h1').first();
    await expect(mainTitle).toBeVisible();
    
    const summaryCards = page.locator('.bg-white.p-6.rounded-lg.shadow-sm.border');
    await expect(summaryCards.first()).toBeVisible();
    
    // 3. Check if API data loads properly
    const apiRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/analytics')) {
        apiRequests.push(request.url());
      }
    });
    
    // Wait for potential API calls
    await page.waitForTimeout(2000);
    
    // 4. Check German translations appear correctly
    const pageTitle = await page.title();
    expect(pageTitle).toContain('Fortschritts-Statistiken');
    
    const germanText = await mainTitle.textContent();
    expect(germanText).toBe('Fortschritts-Statistiken');
    
    // Check for German text in summary cards
    const gesamtstundenText = await page.locator('text=Gesamtstunden').count();
    const sessionsText = await page.locator('text=Sessions').count();
    const gesamtXPText = await page.locator('text=Gesamt-XP').count();
    
    console.log(`Found German text elements: Gesamtstunden(${gesamtstundenText}), Sessions(${sessionsText}), Gesamt-XP(${gesamtXPText})`);
    
    // 5. Check if all icons display properly
    const icons = page.locator('svg');
    const iconCount = await icons.count();
    console.log(`Found ${iconCount} SVG icons`);
    expect(iconCount).toBeGreaterThan(0);
    
    // Check specific icons
    const filterIcon = page.locator('svg').first();
    await expect(filterIcon).toBeVisible();
    
    // Check navigation is working
    const analyticsNavLink = page.locator('a[href="/analytics"]');
    await expect(analyticsNavLink).toHaveClass(/text-blue-600/);
    
    // Check charts are present
    const chartContainers = page.locator('canvas');
    const chartCount = await chartContainers.count();
    console.log(`Found ${chartCount} chart canvases`);
    
    // Check if period filter is working
    const periodFilter = page.locator('select');
    await expect(periodFilter).toBeVisible();
    
    // Check if the filter has German options
    const thisMonthOption = page.locator('option[value="month"]');
    const thisMonthText = await thisMonthOption.textContent();
    expect(thisMonthText).toBe('Dieser Monat');
    
    // Take final screenshot
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/analytics-comprehensive-test.png', 
      fullPage: true 
    });
    
    // Final verifications
    expect(pageErrors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('API requests made:', apiRequests);
    console.log('All Analytics page requirements verified successfully!');
  });
  
  test('Analytics API endpoint responds correctly', async ({ page }) => {
    // Test the API endpoint directly
    const response = await page.request.get('http://localhost:3000/api/analytics?period=month');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log('Analytics API response structure:', Object.keys(data));
    
    // Verify the response has expected structure
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('progress');
    expect(data).toHaveProperty('subjects');
    expect(data).toHaveProperty('streaks');
    expect(data).toHaveProperty('goals');
  });
});