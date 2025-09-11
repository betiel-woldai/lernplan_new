const { chromium } = require('playwright');

(async () => {
  console.log('Starting browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the subjects page
    console.log('Navigating to subjects page...');
    await page.goto('http://localhost:3000/subjects', { waitUntil: 'networkidle' });
    
    // Wait for the page to load completely
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Take screenshot of the simplified subjects page
    console.log('Taking screenshot of simplified subjects page...');
    await page.screenshot({ 
      path: 'tmp/subjects-simplified.png', 
      fullPage: true 
    });
    
    console.log('Screenshot saved as tmp/subjects-simplified.png');
    
    // Check if any subject cards are present and take additional screenshot
    const subjectCards = await page.locator('[data-testid="subject-card"], .group.relative.bg-white').count();
    if (subjectCards > 0) {
      console.log(`Found ${subjectCards} subject cards`);
      
      // Hover over first card to show start button
      await page.locator('.group.relative.bg-white').first().hover();
      await page.screenshot({ 
        path: 'tmp/subjects-simplified-with-hover.png', 
        fullPage: true 
      });
      console.log('Screenshot with hover state saved');
    }
    
  } catch (error) {
    console.error('Error during screenshot:', error);
    
    // Take a screenshot of the error state
    await page.screenshot({ 
      path: 'tmp/subjects-error-state.png', 
      fullPage: true 
    });
    
    // Log page content for debugging
    const content = await page.content();
    console.log('Page content preview:', content.substring(0, 500));
  }
  
  await browser.close();
})();