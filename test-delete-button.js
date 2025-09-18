// Test script to verify the delete button now appears in the modal
const { chromium } = require('playwright');

async function testDeleteButton() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing delete button functionality...');

    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    // Wait for sessions to load
    await page.waitForSelector('text=Deep Work', { timeout: 10000 });

    // Click on a Deep Work session
    const deepWorkSession = page.locator('text=Deep Work').first();
    await deepWorkSession.dblclick();

    console.log('🖱️ Double-clicked on session');
    await page.waitForTimeout(3000);

    // Take screenshot of modal
    await page.screenshot({ path: 'tmp/delete-button-test-01-modal.png', fullPage: true });

    // Check for delete button
    const deleteButton = page.locator('button').filter({ hasText: /Delete|Löschen|löschen/i });
    const deleteButtonVisible = await deleteButton.first().isVisible();

    console.log(`🗑️ Delete button visible: ${deleteButtonVisible}`);

    if (deleteButtonVisible) {
      console.log('✅ SUCCESS: Delete button is now visible in the modal!');

      // Get button text to confirm
      const buttonText = await deleteButton.first().textContent();
      console.log(`🔘 Delete button text: "${buttonText}"`);

      // Take screenshot highlighting the delete button
      await deleteButton.first().highlight();
      await page.screenshot({ path: 'tmp/delete-button-test-02-highlighted.png', fullPage: true });

      console.log('🎯 Delete functionality has been successfully implemented!');

    } else {
      console.log('❌ Delete button still not visible');

      // List all buttons for debugging
      const allButtons = await page.locator('button').count();
      console.log(`🔢 Total buttons found: ${allButtons}`);

      for (let i = 0; i < allButtons; i++) {
        const buttonText = await page.locator('button').nth(i).textContent();
        const buttonVisible = await page.locator('button').nth(i).isVisible();
        console.log(`  Button ${i + 1}: "${buttonText}" (visible: ${buttonVisible})`);
      }
    }

    // Keep browser open for inspection
    console.log('🔍 Browser staying open for manual verification...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDeleteButton();