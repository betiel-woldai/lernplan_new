import { test, expect } from '@playwright/test';

test('Analytics page loads successfully', async ({ page }) => {
  console.log('Navigating to analytics page...');
  
  // Navigate to the analytics page
  await page.goto('http://localhost:3000/analytics');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check for any JavaScript errors
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.log('Page error:', error.message);
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  // Wait a moment for the page to render
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ 
    path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/analytics-simple-test.png', 
    fullPage: true 
  });
  
  // Check if the page title contains "Analytics"
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check if the page content loaded (look for any h1 or h2 elements)
  const headings = await page.locator('h1, h2').count();
  console.log('Found headings:', headings);
  
  // Log any errors
  console.log('Errors found:', errors.length);
  if (errors.length > 0) {
    console.log('Error details:', errors);
  }
  
  // Check if there are no JavaScript errors
  expect(errors.length).toBe(0);
  
  console.log('Analytics page test completed');
});