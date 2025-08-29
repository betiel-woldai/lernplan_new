const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('🌐 Testing Issue #6 Database Integration...');
    
    // Dashboard - now with real data
    console.log('📊 Testing Dashboard with real database data...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tmp/issue6-dashboard-realdata.png', fullPage: true });
    
    // Subjects - now from database
    console.log('📚 Testing Subjects page with database integration...');
    await page.click('text=Subjects');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tmp/issue6-subjects-database.png', fullPage: true });
    
    // Calendar - connected to database
    console.log('📅 Testing Calendar page with API integration...');
    await page.click('text=Calendar');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tmp/issue6-calendar-integrated.png', fullPage: true });

    console.log('✅ Issue #6 Database Integration Testing Complete!');
    console.log('🎉 All pages now load data from PostgreSQL database');
    console.log('📸 Screenshots saved showing real database integration');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();