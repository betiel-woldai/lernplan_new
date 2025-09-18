// Comprehensive test to verify delete functionality works across calendar and statistics
const { chromium } = require('playwright');

async function testCompleteDeleteWorkflow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🧪 Testing complete delete workflow...');

    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    // Step 1: Take initial screenshot
    await page.screenshot({ path: 'tmp/delete-workflow-01-initial.png', fullPage: true });

    // Step 2: Count initial sessions
    const initialSessions = await page.locator('text=Deep Work').count();
    console.log(`📊 Initial session count: ${initialSessions}`);

    // Step 3: Open a session for deletion
    const deepWorkSession = page.locator('text=Deep Work').first();
    await deepWorkSession.dblclick();
    await page.waitForTimeout(2000);

    // Step 4: Screenshot of edit modal
    await page.screenshot({ path: 'tmp/delete-workflow-02-edit-modal.png', fullPage: true });

    // Step 5: Click delete button
    const deleteButton = page.locator('button').filter({ hasText: /Delete|Löschen/i }).first();
    const deleteButtonVisible = await deleteButton.isVisible();

    if (!deleteButtonVisible) {
      throw new Error('Delete button not visible');
    }

    console.log('🗑️ Clicking delete button...');

    // Handle confirmation dialog
    page.on('dialog', async dialog => {
      console.log(`💬 Confirmation dialog: "${dialog.message()}"`);
      await dialog.accept();
    });

    await deleteButton.click();

    // Step 6: Wait for deletion to complete
    await page.waitForTimeout(3000);

    // Step 7: Check if modal closed
    const modalStillVisible = await page.locator('.modal').first().isVisible();
    console.log(`📋 Modal still visible: ${modalStillVisible}`);

    // Step 8: Count sessions after deletion
    const finalSessions = await page.locator('text=Deep Work').count();
    console.log(`📊 Final session count: ${finalSessions}`);

    // Step 9: Take final screenshot
    await page.screenshot({ path: 'tmp/delete-workflow-03-after-delete.png', fullPage: true });

    // Step 10: Check statistics update
    console.log('📈 Checking statistics...');

    // Look for session counters/statistics
    const sessionCounters = await page.locator('[data-testid*="session"]').count();
    console.log(`📊 Found ${sessionCounters} session counters`);

    // Step 11: Navigate to analytics to check stats
    try {
      await page.click('a[href="/analytics"], text=Statistiken');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tmp/delete-workflow-04-analytics.png', fullPage: true });
      console.log('📊 Analytics page loaded');
    } catch (e) {
      console.log('ℹ️ Analytics navigation not found or failed');
    }

    // Results
    if (finalSessions < initialSessions) {
      console.log('✅ SUCCESS: Session was deleted from calendar!');
      console.log(`📉 Sessions reduced from ${initialSessions} to ${finalSessions}`);
    } else {
      console.log('❌ ISSUE: Session count did not decrease');
    }

    if (!modalStillVisible) {
      console.log('✅ SUCCESS: Modal closed after deletion');
    } else {
      console.log('⚠️ Modal still visible after deletion');
    }

    console.log('🔍 Browser staying open for verification...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCompleteDeleteWorkflow();