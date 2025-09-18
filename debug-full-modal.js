// Debug script to capture the full modal including action buttons
const { chromium } = require('playwright');

async function debugFullModal() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Debugging full modal content...');

    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    // Wait for sessions to load
    await page.waitForSelector('text=Deep Work', { timeout: 10000 });

    // Click on a Deep Work session
    const deepWorkSession = page.locator('text=Deep Work').first();
    await deepWorkSession.dblclick();

    console.log('🖱️ Double-clicked on session');
    await page.waitForTimeout(3000);

    // Check if modal appeared
    const modal = page.locator('.modal, div:has(h2:text("Session Details"))').first();
    const modalVisible = await modal.isVisible();
    console.log(`📋 Modal visible: ${modalVisible}`);

    if (modalVisible) {
      // Take screenshot of modal initial state
      await page.screenshot({ path: 'tmp/debug-full-01-modal-initial.png', fullPage: true });

      // Try to scroll within the modal to see action buttons
      const modalContent = page.locator('.modal, div[class*="max-w"]').first();

      // Scroll to bottom of modal
      await modalContent.evaluate(el => {
        el.scrollTop = el.scrollHeight;
      });

      await page.waitForTimeout(1000);

      // Take screenshot after scrolling
      await page.screenshot({ path: 'tmp/debug-full-02-modal-scrolled.png', fullPage: true });

      // Look for action buttons
      const saveButton = page.locator('button').filter({ hasText: /Save|Speichern|speichern/i });
      const deleteButton = page.locator('button').filter({ hasText: /Delete|Löschen|löschen/i });
      const cancelButton = page.locator('button').filter({ hasText: /Cancel|Abbrechen/i });

      const saveVisible = await saveButton.first().isVisible();
      const deleteVisible = await deleteButton.first().isVisible();
      const cancelVisible = await cancelButton.first().isVisible();

      console.log(`💾 Save button visible: ${saveVisible}`);
      console.log(`🗑️ Delete button visible: ${deleteVisible}`);
      console.log(`❌ Cancel button visible: ${cancelVisible}`);

      // Count all buttons in modal
      const allButtons = await page.locator('button').count();
      console.log(`🔢 Total buttons found: ${allButtons}`);

      // List all button texts
      for (let i = 0; i < allButtons; i++) {
        const buttonText = await page.locator('button').nth(i).textContent();
        const buttonVisible = await page.locator('button').nth(i).isVisible();
        console.log(`  Button ${i + 1}: "${buttonText}" (visible: ${buttonVisible})`);
      }

      // Check modal dimensions
      const modalBox = await modalContent.boundingBox();
      console.log(`📐 Modal dimensions:`, modalBox);

      // Check if modal is scrollable
      const scrollable = await modalContent.evaluate(el => {
        return el.scrollHeight > el.clientHeight;
      });
      console.log(`📜 Modal is scrollable: ${scrollable}`);

    } else {
      console.log('❌ Modal not found');
    }

    // Keep browser open for inspection
    console.log('🔍 Browser staying open for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugFullModal();