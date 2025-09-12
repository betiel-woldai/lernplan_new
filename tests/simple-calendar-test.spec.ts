import { test, expect } from '@playwright/test';

test.describe('Simple Calendar Test - Issue #15', () => {
  test('Take screenshots of current calendar functionality', async ({ page }) => {
    // Set longer timeout
    test.setTimeout(60000);
    
    console.log('📱 Step 1: Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-simple-01-homepage.png', 
      fullPage: true 
    });
    
    // Log page content
    const pageContent = await page.textContent('body');
    console.log('Homepage preview:', pageContent?.substring(0, 200));

    console.log('📖 Step 2: Navigate to Subjects...');
    const subjectsLink = page.locator('a[href="/subjects"]');
    await subjectsLink.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-simple-02-subjects.png', 
      fullPage: true 
    });

    console.log('📊 Step 3: Navigate to Analytics/Calendar...');
    const analyticsLink = page.locator('a[href="/analytics"]');
    await analyticsLink.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-simple-03-analytics.png', 
      fullPage: true 
    });

    // Check for German text
    const bodyText = await page.textContent('body');
    const germanTerms = ['ausstehend', 'abgeschlossen', 'Ausstehend', 'Abgeschlossen'];
    let germanFound = false;
    
    for (const term of germanTerms) {
      if (bodyText?.includes(term)) {
        console.log(`✅ German term found: "${term}"`);
        germanFound = true;
      }
    }
    
    if (!germanFound) {
      console.log('⚠️ No German terms found in current view');
    }

    // Look for clickable sessions
    const clickableElements = await page.$$eval('[data-session], .session, .calendar-event, button[data-testid*="session"]', 
      elements => elements.length
    ).catch(() => 0);
    
    console.log(`🖱️ Found ${clickableElements} potentially clickable session elements`);

    console.log('✅ Simple calendar test screenshots completed');
  });
});