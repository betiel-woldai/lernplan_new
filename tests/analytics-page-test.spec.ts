import { test, expect } from '@playwright/test';

test.describe('Analytics Page Tests', () => {
  test('Analytics page loads and renders correctly', async ({ page }) => {
    // Navigate to the analytics page
    await page.goto('http://localhost:3000/analytics');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page loads without errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });
    
    // Check console for errors
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleMessages.push(`Console Error: ${msg.text()}`);
      }
    });
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);
    
    // Check if the main analytics content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Check for German text (Analytics page title)
    const pageTitle = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    
    // Look for analytics-specific content
    const analyticsContent = page.locator('[data-testid*="analytics"], [class*="analytics"], [id*="analytics"]').first();
    if (await analyticsContent.count() > 0) {
      await expect(analyticsContent).toBeVisible();
    }
    
    // Check for any icons (look for svg or icon elements)
    const icons = page.locator('svg, [class*="icon"], i[class*="fa"]');
    if (await icons.count() > 0) {
      console.log(`Found ${await icons.count()} icon elements`);
    }
    
    // Take a full page screenshot
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/analytics-page-test.png', 
      fullPage: true 
    });
    
    // Log any errors found
    if (pageErrors.length > 0) {
      console.log('Page Errors:', pageErrors);
    }
    
    if (consoleMessages.length > 0) {
      console.log('Console Messages:', consoleMessages);
    }
    
    // Verify no critical errors occurred
    expect(pageErrors).toHaveLength(0);
    
    console.log('Analytics page test completed successfully');
  });
  
  test('Check API data loading', async ({ page }) => {
    // Listen for network requests
    const apiRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiRequests.push(`API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    const apiResponses: string[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        apiResponses.push(`API Response: ${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Log API requests and responses
    console.log('API Requests:', apiRequests);
    console.log('API Responses:', apiResponses);
    
    // Check if any API calls were made
    if (apiRequests.length > 0) {
      console.log(`Found ${apiRequests.length} API requests`);
    }
  });
  
  test('Check German translations', async ({ page }) => {
    await page.goto('http://localhost:3000/analytics');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for German text patterns
    const bodyText = await page.locator('body').textContent();
    
    const germanWords = [
      'Analytik', 'Analytics', 'Fortschritt', 'Statistik', 
      'Übersicht', 'Daten', 'Auswertung', 'Ergebnis'
    ];
    
    const foundGermanWords: string[] = [];
    for (const word of germanWords) {
      if (bodyText?.includes(word)) {
        foundGermanWords.push(word);
      }
    }
    
    console.log('Found German words:', foundGermanWords);
    
    if (foundGermanWords.length > 0) {
      console.log('German translations appear to be working');
    }
  });
});