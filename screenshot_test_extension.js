const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the initial state
    await page.screenshot({ path: 'tmp/extension-test-initial.png', fullPage: true });

    console.log('📸 Screenshot saved: tmp/extension-test-initial.png');

    // Look for session timer/start button
    const timerElement = await page.locator('.bg-gradient-to-br.from-blue-50').first();
    if (await timerElement.isVisible()) {
      console.log('✅ SessionTimer component is visible');

      // Look for the start button
      const startButton = await page.locator('text=Start Learning Session');
      if (await startButton.isVisible()) {
        console.log('✅ Start Learning Session button found');

        // Click it
        await startButton.click();
        await page.waitForTimeout(1000);

        // Take screenshot of modal
        await page.screenshot({ path: 'tmp/extension-test-modal.png', fullPage: true });
        console.log('📸 Modal screenshot: tmp/extension-test-modal.png');
      } else {
        console.log('❌ Start Learning Session button not found');
        // Look for any button text
        const buttons = await page.locator('button').all();
        for (const button of buttons) {
          const text = await button.textContent();
          console.log('🔍 Found button:', text);
        }
      }
    } else {
      console.log('❌ SessionTimer component not visible');
    }

    // Wait a bit to see the UI
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Error:', error);
  }

  await browser.close();
})();