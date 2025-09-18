// Debug script to open the session edit modal and check for delete button
const { chromium } = require('playwright');

async function debugModal() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Debugging session edit modal...');

    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    console.log('📅 Looking for Deep Work session...');

    // Wait for sessions to load and find a Deep Work session
    await page.waitForSelector('text=Deep Work', { timeout: 10000 });

    // Click on a Deep Work session
    const deepWorkSession = page.locator('text=Deep Work').first();
    await deepWorkSession.click({ button: 'right' });

    console.log('🖱️ Right-clicked on session');
    await page.waitForTimeout(2000);

    // Take screenshot of context menu
    await page.screenshot({ path: 'tmp/debug-01-context-menu.png', fullPage: true });

    // Look for edit option
    const editButton = page.locator('button, a').filter({ hasText: /Edit|Bearbeiten|Details/i });

    if (await editButton.first().isVisible()) {
      console.log('✅ Found edit button, clicking...');
      await editButton.first().click();

      // Wait for modal to appear
      await page.waitForTimeout(3000);

      // Take screenshot of the modal
      await page.screenshot({ path: 'tmp/debug-02-edit-modal.png', fullPage: true });

      // Look for delete button specifically
      const deleteButton = page.locator('button').filter({ hasText: /Delete|Löschen/i });
      const deleteButtonCount = await deleteButton.count();

      console.log(`🗑️ Found ${deleteButtonCount} delete buttons`);

      if (deleteButtonCount > 0) {
        console.log('✅ Delete button exists!');

        // Get all button text for debugging
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`📊 Total buttons in modal: ${buttonCount}`);

        for (let i = 0; i < buttonCount; i++) {
          const buttonText = await allButtons.nth(i).textContent();
          console.log(`  Button ${i + 1}: "${buttonText}"`);
        }

      } else {
        console.log('❌ No delete button found');

        // Debug: show all buttons in the modal
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`📊 Total buttons in modal: ${buttonCount}`);

        for (let i = 0; i < buttonCount; i++) {
          const buttonText = await allButtons.nth(i).textContent();
          console.log(`  Button ${i + 1}: "${buttonText}"`);
        }
      }

    } else {
      console.log('❌ No edit button found in context menu');

      // Try double-click instead
      console.log('🖱️ Trying double-click...');
      await deepWorkSession.dblclick();
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'tmp/debug-03-doubleclick-modal.png', fullPage: true });
    }

    // Keep browser open for manual inspection
    console.log('🔍 Browser staying open for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugModal();