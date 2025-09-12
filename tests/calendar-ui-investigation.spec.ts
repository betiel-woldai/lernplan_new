import { test, expect } from '@playwright/test';

test.describe('Calendar UI Investigation - Issue #15', () => {
  test('Investigate current UI structure and available sessions', async ({ page }) => {
    // Step 1: Load homepage and take screenshot
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-investigate-01-homepage.png', 
      fullPage: true 
    });

    // Log all button texts on homepage
    console.log('🔍 Homepage buttons found:');
    const allButtons = await page.locator('button').all();
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      console.log(`Button ${i}: "${text}"`);
    }

    // Check for any start session elements
    const startElements = await page.locator('*').filter({ hasText: /start|Start|sitzung|Sitzung/ }).all();
    console.log(`🎯 Found ${startElements.length} elements with start/session text`);
    for (let i = 0; i < startElements.length; i++) {
      const text = await startElements[i].textContent();
      const tagName = await startElements[i].evaluate(el => el.tagName);
      console.log(`Start element ${i} (${tagName}): "${text}"`);
    }

    // Step 2: Navigate to subjects page
    console.log('📖 Navigating to Subjects page...');
    await page.click('a[href="/subjects"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-investigate-02-subjects.png', 
      fullPage: true 
    });

    // Log subjects page buttons
    console.log('🔍 Subjects page buttons found:');
    const subjectButtons = await page.locator('button').all();
    for (let i = 0; i < subjectButtons.length; i++) {
      const text = await subjectButtons[i].textContent();
      console.log(`Subjects Button ${i}: "${text}"`);
    }

    // Step 3: Navigate to analytics/calendar page
    console.log('📊 Navigating to Analytics/Calendar page...');
    await page.click('a[href="/analytics"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-investigate-03-analytics.png', 
      fullPage: true 
    });

    // Look for existing sessions in calendar
    const calendarElements = await page.locator('[class*="calendar"], [class*="session"], [data-testid*="calendar"], [data-testid*="session"]').all();
    console.log(`📅 Found ${calendarElements.length} calendar/session elements`);

    // Look for clickable session elements
    const clickableSessions = await page.locator('button, [role="button"], [data-clickable="true"], .cursor-pointer').all();
    console.log(`🖱️ Found ${clickableSessions.length} potentially clickable elements`);

    // Try to find any existing sessions with different selectors
    const sessionSelectors = [
      '.session-item',
      '.calendar-event',
      '.calendar-session',
      '[data-testid="session"]',
      '[data-testid="calendar-session"]',
      '.session',
      '.event',
      'div[role="button"]'
    ];

    for (const selector of sessionSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
        for (let i = 0; i < Math.min(3, elements.length); i++) {
          const text = await elements[i].textContent();
          console.log(`  Session ${i}: "${text?.substring(0, 100)}"`);
        }
      }
    }

    // Check for any text containing German status terms
    const germanTerms = ['ausstehend', 'abgeschlossen', 'Ausstehend', 'Abgeschlossen'];
    for (const term of germanTerms) {
      const elements = await page.locator(`text="${term}"`).all();
      if (elements.length > 0) {
        console.log(`🇩🇪 Found German term "${term}" in ${elements.length} elements`);
      }
    }

    // Log page content for debugging
    const pageContent = await page.textContent('body');
    console.log('📄 Page content preview:', pageContent?.substring(0, 500));

    // Check if we have any data
    if (pageContent?.includes('Keine Daten') || pageContent?.includes('No data') || pageContent?.includes('keine Sitzungen')) {
      console.log('❌ No session data found - need to create test sessions first');
    }

    // Final debug screenshot
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-investigate-04-final.png', 
      fullPage: true 
    });

    console.log('🔍 Investigation completed');
  });
});