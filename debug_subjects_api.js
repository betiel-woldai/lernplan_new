const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log('CONSOLE:', msg.text());
  });

  // Listen for network responses
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/subjects')) {
      console.log('API RESPONSE:', url, response.status());
      response.json().then(data => {
        console.log('API DATA:', JSON.stringify(data, null, 2));
      }).catch(err => {
        console.log('API ERROR:', err.message);
      });
    }
  });

  try {
    console.log('=== DEBUGGING SUBJECTS API ===');
    await page.goto('http://localhost:3003');
    await page.waitForTimeout(5000);

    // Check console errors
    const errors = await page.evaluate(() => {
      return window.__errors || [];
    });
    console.log('PAGE ERRORS:', errors);

    // Test the API directly
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/subjects?userId=62d1b19b-3874-43b1-9424-ca7c2de10557');
        const data = await response.json();
        return {
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    console.log('DIRECT API TEST:', JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();