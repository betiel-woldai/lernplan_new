const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Visible for debugging
  const page = await browser.newPage();

  try {
    console.log('📅 Testing Calendar-as-Master real-time sync...');

    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({ path: 'tmp/step1-initial-state.png' });
    console.log('📸 Initial state captured');

    // Wait for the calendar to load
    await page.waitForTimeout(2000);

    // Click on today's date (15) in the calendar
    console.log('📅 Clicking on today (15th) in calendar...');
    await page.click('td:has-text("15")');
    await page.waitForTimeout(1000);

    // Click on the "+ Session" button
    console.log('➕ Clicking + Session button...');
    await page.click('button:has-text("Session")');
    await page.waitForTimeout(2000);

    // Fill in session details in the modal
    console.log('✍️  Filling session details...');
    await page.fill('input[placeholder*="Mathematik"]', 'Test Real-Time Session');
    await page.selectOption('select', { label: 'Deep Work' }); // Select a subject
    await page.fill('input[type="time"]:first-of-type', '14:00'); // Start time
    await page.fill('input[type="time"]:last-of-type', '15:00');  // End time

    // Take screenshot of filled modal
    await page.screenshot({ path: 'tmp/step2-session-modal.png' });
    console.log('📸 Session modal captured');

    // Create the session
    await page.click('button:has-text("Session erstellen")');
    await page.waitForTimeout(3000); // Wait for creation and API calls

    // Take screenshot after session creation
    await page.screenshot({ path: 'tmp/step3-session-created.png' });
    console.log('✅ Session created');

    // Now find and click on the newly created session to edit it
    console.log('🎯 Finding the newly created session...');
    await page.waitForTimeout(2000);

    // Look for the session on today's date
    const sessionExists = await page.isVisible('text=Test Real-Time Session');
    if (sessionExists) {
      console.log('✅ Session found in calendar');

      // Click on the session to edit it
      await page.click('text=Test Real-Time Session');
      await page.waitForTimeout(2000);

      // Mark as completed in the edit modal
      console.log('✅ Marking session as completed...');
      await page.click('button:has-text("Als abgeschlossen markieren")');
      await page.waitForTimeout(1000);

      // Save the changes
      await page.click('button:has-text("Änderungen speichern")');
      await page.waitForTimeout(3000); // Wait for save and real-time updates

      // Take screenshot of final state
      await page.screenshot({ path: 'tmp/step4-session-completed.png', fullPage: true });
      console.log('📸 Final state with completed session captured');

      // Check sidebar for updates
      const sidebarText = await page.textContent('.bg-blue-50'); // Today's stats section
      console.log('📊 Sidebar content:', sidebarText);

      if (sidebarText.includes('1h 0m') || sidebarText.includes('1 heute abgeschlossen')) {
        console.log('🎉 SUCCESS: Real-time sync working! Sidebar shows completed session.');
      } else {
        console.log('⚠️  Sidebar may not have updated yet. Content:', sidebarText);
      }

    } else {
      console.log('❌ Could not find the created session');
    }

  } catch (error) {
    console.error('❌ Error during real-time sync test:', error);
    await page.screenshot({ path: 'tmp/error-state.png' });
  }

  await page.waitForTimeout(5000); // Keep browser open to see results
  await browser.close();
})();