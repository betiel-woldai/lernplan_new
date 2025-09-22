const { chromium } = require('playwright');

async function testApprovalFlow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🚀 Testing session approval flow...');

    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    console.log('📅 App loaded');

    // Take screenshot of initial state
    await page.screenshot({ path: 'tmp/01-initial.png', fullPage: true });
    console.log('📸 Initial state: tmp/01-initial.png');

    // Look for Start button
    const startButton = page.locator('button:has-text("Start")');
    if (await startButton.isVisible({ timeout: 5000 })) {
      console.log('🎯 Found Start button, clicking...');
      await startButton.click();
      await page.waitForTimeout(2000);

      // Look for subject selector modal or similar
      const subjectOptions = page.locator('text=/Math|Deep|Deutsch|Englisch/').first();
      if (await subjectOptions.isVisible({ timeout: 3000 })) {
        await subjectOptions.click();
        console.log('📚 Selected subject');
        await page.waitForTimeout(1000);

        // Look for start/confirm button in modal
        const confirmButton = page.locator('button:has-text("Start"), button:has-text("Starten"), button[type="submit"]').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
          console.log('▶️ Started session');
          await page.waitForTimeout(3000);

          // Take screenshot of active session
          await page.screenshot({ path: 'tmp/02-active-session.png', fullPage: true });
          console.log('📸 Active session: tmp/02-active-session.png');

          // Look for Stop button
          const stopButton = page.locator('button:has-text("Stop")');
          if (await stopButton.isVisible({ timeout: 2000 })) {
            console.log('⏹️ Found Stop button, clicking...');
            await stopButton.click();
            await page.waitForTimeout(2000);

            // Take screenshot after stop (should show approval modal)
            await page.screenshot({ path: 'tmp/03-approval-modal.png', fullPage: true });
            console.log('📸 After stop click: tmp/03-approval-modal.png');

            // Look for approval modal elements
            const modalTitle = page.locator('text="Session beenden"');
            const approveButton = page.locator('button:has-text("Session speichern")');
            const discardButton = page.locator('button:has-text("Verwerfen")');

            if (await modalTitle.isVisible({ timeout: 3000 })) {
              console.log('✅ Approval modal appeared!');

              // Test approval
              if (await approveButton.isVisible()) {
                console.log('💾 Clicking approve button...');
                await approveButton.click();
                await page.waitForTimeout(3000);

                // Take final screenshot
                await page.screenshot({ path: 'tmp/04-after-approval.png', fullPage: true });
                console.log('📸 After approval: tmp/04-after-approval.png');

                console.log('🎉 Approval flow test completed successfully!');
              } else {
                console.log('❌ Approve button not found');
              }
            } else {
              console.log('❌ Approval modal did not appear');
            }
          } else {
            console.log('❌ Stop button not found');
          }
        } else {
          console.log('❌ Confirm/Start button not found');
        }
      } else {
        console.log('❌ Subject selector not found');
      }
    } else {
      console.log('❌ Start button not found');
    }

    // Keep browser open for manual inspection
    console.log('🔍 Keeping browser open for 15 seconds...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('❌ Error during test:', error);
  }

  await browser.close();
}

testApprovalFlow();