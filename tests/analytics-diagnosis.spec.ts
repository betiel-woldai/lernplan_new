import { test, expect } from '@playwright/test';

test('Analytics Page Diagnosis', async ({ page }) => {
  // Capture console messages
  const consoleMessages: string[] = [];
  const errorMessages: string[] = [];
  const warningMessages: string[] = [];

  page.on('console', msg => {
    const text = `${msg.type()}: ${msg.text()}`;
    consoleMessages.push(text);
    
    if (msg.type() === 'error') {
      errorMessages.push(text);
    } else if (msg.type() === 'warning') {
      warningMessages.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errorMessages.push(`Page Error: ${error.message}`);
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    errorMessages.push(`Failed Request: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Navigating to Analytics page...');
  
  try {
    // Navigate to the analytics page
    await page.goto('http://localhost:3000/analytics', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a moment for any delayed content to load
    await page.waitForTimeout(3000);

    // Check if page loaded successfully
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Take a screenshot
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/analytics-diagnosis.png',
      fullPage: true 
    });

    // Check for specific elements that should be present
    console.log('Checking for page elements...');

    // Check if main container exists
    const mainContainer = await page.locator('main, #root, .app').first();
    const containerExists = await mainContainer.count() > 0;
    console.log(`Main container exists: ${containerExists}`);

    // Check for navigation
    const navExists = await page.locator('nav, .nav, .navigation').count() > 0;
    console.log(`Navigation exists: ${navExists}`);

    // Check for analytics specific content
    const analyticsContent = await page.locator('[data-testid*="analytics"], .analytics, #analytics').count();
    console.log(`Analytics content elements found: ${analyticsContent}`);

    // Check for any error messages on page
    const errorElements = await page.locator('.error, .alert-error, [role="alert"]').count();
    console.log(`Error elements on page: ${errorElements}`);

    // Get page content
    const bodyText = await page.locator('body').textContent();
    const hasContent = bodyText && bodyText.trim().length > 0;
    console.log(`Page has content: ${hasContent}`);
    console.log(`Content length: ${bodyText?.length || 0} characters`);

    // Log first 500 characters of body content for debugging
    if (bodyText) {
      console.log(`First 500 chars of content: ${bodyText.substring(0, 500)}...`);
    }

    // Check if React is loaded
    const reactLoaded = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             (window as any).React !== undefined || 
             document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('#root') !== null;
    });
    console.log(`React appears to be loaded: ${reactLoaded}`);

    // Print all console messages
    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));

    console.log('\n=== ERROR MESSAGES ===');
    errorMessages.forEach(msg => console.log(msg));

    console.log('\n=== WARNING MESSAGES ===');
    warningMessages.forEach(msg => console.log(msg));

    // Check network requests
    console.log('\n=== CHECKING NETWORK REQUESTS ===');
    
  } catch (error) {
    console.log(`Navigation failed: ${error}`);
    errorMessages.push(`Navigation Error: ${error}`);
    
    // Still try to take a screenshot to see what's happening
    try {
      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/analytics-error.png',
        fullPage: true 
      });
    } catch (screenshotError) {
      console.log(`Screenshot failed: ${screenshotError}`);
    }
  }

  // Final summary
  console.log('\n=== DIAGNOSIS SUMMARY ===');
  console.log(`Total console messages: ${consoleMessages.length}`);
  console.log(`Total errors: ${errorMessages.length}`);
  console.log(`Total warnings: ${warningMessages.length}`);
  
  if (errorMessages.length > 0) {
    console.log('\nCRITICAL ERRORS FOUND:');
    errorMessages.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg}`);
    });
  }
});