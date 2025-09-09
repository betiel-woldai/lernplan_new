import { test, expect, Page } from '@playwright/test';

test.describe('Simple UI and Navigation Test', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Listen to console logs to capture event dispatching and errors
    page.on('console', msg => {
      console.log(`Console ${msg.type()}: ${msg.text()}`);
    });
    
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('Application loads successfully and take screenshots', async () => {
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/app_initial_load.png',
      fullPage: true 
    });
    
    // Get page title and URL to verify it loaded
    const title = await page.title();
    const url = page.url();
    
    console.log(`✅ Page loaded successfully - Title: "${title}", URL: ${url}`);
    
    // Check if there are any navigation elements visible
    const navElements = await page.locator('nav, [role="navigation"], a[href]').count();
    console.log(`🧭 Found ${navElements} navigation elements`);
    
    // Try to find common navigation patterns
    const possibleNavSelectors = [
      'nav a',
      '[data-testid*="nav"]',
      '[href="/dashboard"], [href*="dashboard"]',
      '[href="/subjects"], [href*="subjects"]', 
      '[href="/calendar"], [href*="calendar"]',
      '[href="/analytics"], [href*="analytics"]',
      'a[href="/"]',
      'button:has-text("Dashboard")',
      'button:has-text("Subjects")',
      'button:has-text("Calendar")',
      'button:has-text("Analytics")'
    ];
    
    for (const selector of possibleNavSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`🎯 Found ${elements} elements matching: ${selector}`);
        
        // Get text content of these elements
        const texts = await page.locator(selector).allTextContents();
        console.log(`   Text content: ${texts.join(', ')}`);
      }
    }
    
    // Look for any buttons or interactive elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    console.log(`🎛️  Found ${buttons} buttons and ${links} links`);
    
    if (buttons > 0) {
      const buttonTexts = await page.locator('button').allTextContents();
      console.log(`   Button texts: ${buttonTexts.join(', ')}`);
    }
    
    if (links > 0) {
      const linkTexts = await page.locator('a').allTextContents();
      console.log(`   Link texts: ${linkTexts.join(', ')}`);
    }
    
    // Check if there's any main content area
    const mainContent = await page.locator('main, [role="main"], .main, #main').count();
    console.log(`📄 Found ${mainContent} main content areas`);
    
    // Look for any data or text that might indicate the app state
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    if (headings.length > 0) {
      console.log(`📝 Found headings: ${headings.join(', ')}`);
    }
  });

  test('Test basic interaction if possible', async () => {
    // Try to find and click any navigation element
    const commonNavSelectors = [
      'a[href="/subjects"]',
      'a[href*="subjects"]',
      'button:has-text("Subjects")',
      '[data-testid*="nav"]',
      'nav a'
    ];
    
    for (const selector of commonNavSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`🖱️  Attempting to click: ${selector}`);
        
        try {
          await element.click();
          await page.waitForLoadState('networkidle');
          
          await page.screenshot({ 
            path: `tests/screenshots/after_click_${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
            fullPage: true 
          });
          
          console.log(`✅ Successfully clicked and navigated`);
          break;
        } catch (error) {
          console.log(`❌ Failed to click ${selector}: ${error.message}`);
        }
      }
    }
  });
});