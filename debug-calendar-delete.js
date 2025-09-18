// Debug script to check calendar session deletion specifically
const { chromium } = require('playwright');

async function debugCalendarDelete() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Debugging calendar session deletion...');

    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    // Check which sessions exist
    const sessions = await page.locator('text=Deep Work').count();
    console.log(`📊 Found ${sessions} Deep Work sessions`);

    // Try right-click context menu approach first
    console.log('🖱️ Trying right-click approach...');
    const deepWorkSession = page.locator('text=Deep Work').first();
    await deepWorkSession.click({ button: 'right' });
    await page.waitForTimeout(2000);

    // Check for context menu
    const contextMenu = await page.locator('.context-menu, [role="menu"]').isVisible();
    console.log(`📋 Context menu visible: ${contextMenu}`);

    if (contextMenu) {
      // Look for edit option in context menu
      const editOption = page.locator('button, a').filter({ hasText: /Edit|Bearbeiten/i });
      const editVisible = await editOption.first().isVisible();
      console.log(`✏️ Edit option in context menu: ${editVisible}`);

      if (editVisible) {
        await editOption.first().click();
        await page.waitForTimeout(2000);
      }
    } else {
      // Try double-click if no context menu
      console.log('🖱️ Trying double-click approach...');
      await deepWorkSession.dblclick();
      await page.waitForTimeout(2000);
    }

    // Check what modal opened
    const sessionEditModal = await page.locator('h2:has-text("Session Details")').isVisible();
    const calendarEditModal = await page.locator('h2:has-text("Session bearbeiten")').isVisible();

    console.log(`📋 SessionEditModal (Session Details): ${sessionEditModal}`);
    console.log(`📋 CalendarSessionEditModal (Session bearbeiten): ${calendarEditModal}`);

    // Take screenshot of opened modal
    await page.screenshot({ path: 'tmp/debug-calendar-01-modal.png', fullPage: true });

    // Look for delete button
    const deleteButtons = await page.locator('button').filter({ hasText: /Delete|Löschen/i }).count();
    console.log(`🗑️ Delete buttons found: ${deleteButtons}`);

    if (deleteButtons > 0) {
      const deleteButton = page.locator('button').filter({ hasText: /Delete|Löschen/i }).first();
      const buttonText = await deleteButton.textContent();
      const buttonVisible = await deleteButton.isVisible();
      console.log(`🗑️ Delete button: "${buttonText}" (visible: ${buttonVisible})`);

      if (buttonVisible) {
        console.log('🗑️ Attempting deletion...');

        // Set up dialog handler
        page.on('dialog', async dialog => {
          console.log(`💬 Dialog: "${dialog.message()}"`);
          await dialog.accept();
        });

        // Click delete
        await deleteButton.click();
        await page.waitForTimeout(3000);

        // Check if sessions changed
        const newSessionCount = await page.locator('text=Deep Work').count();
        console.log(`📊 Sessions after deletion: ${newSessionCount}`);

        if (newSessionCount < sessions) {
          console.log('✅ SUCCESS: Session deleted from calendar!');
        } else {
          console.log('❌ Session still present in calendar');
        }
      }
    }

    await page.screenshot({ path: 'tmp/debug-calendar-02-after.png', fullPage: true });

    console.log('🔍 Check browser for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugCalendarDelete();