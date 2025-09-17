import { test, expect } from '@playwright/test';

test('Test CalendarSessionEditModal with planned session', async ({ page }) => {
  console.log('🧪 Testing CalendarSessionEditModal by creating and editing planned session');

  // Navigate to the application
  await page.goto('http://localhost:3003');
  await page.waitForLoadState('networkidle');

  // Close any open modals first
  const closeButton = page.locator('button:has-text("Close")');
  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(1000);
  }

  // Take initial screenshot
  await page.screenshot({
    path: 'tmp/planned-modal-01-initial.png',
    fullPage: true
  });

  console.log('📅 Creating a new planned session...');

  // Click on "+ Session" button to create a new session
  const sessionButton = page.locator('button:has-text("Session")');
  if (await sessionButton.isVisible()) {
    console.log('🎯 Clicking on + Session button...');
    await sessionButton.click();
    await page.waitForTimeout(2000);

    // Take screenshot after clicking session button
    await page.screenshot({
      path: 'tmp/planned-modal-02-create-modal.png',
      fullPage: true
    });

    // Look for session creation modal
    const createModal = page.locator('h2:has-text("Neue Session")');
    const createModalVisible = await createModal.isVisible();
    console.log(`📋 Create session modal visible: ${createModalVisible}`);

    if (createModalVisible) {
      // Fill in basic session details
      const titleInput = page.locator('input[placeholder*="Session"]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Session für Modal');
      }

      // Select a subject if available
      const subjectSelect = page.locator('select').first();
      if (await subjectSelect.isVisible()) {
        await subjectSelect.selectOption({ index: 1 });
      }

      // Set a time
      const timeInput = page.locator('input[type="time"]').first();
      if (await timeInput.isVisible()) {
        await timeInput.fill('14:00');
      }

      const endTimeInput = page.locator('input[type="time"]').last();
      if (await endTimeInput.isVisible()) {
        await endTimeInput.fill('15:00');
      }

      // Save the session
      const saveButton = page.locator('button:has-text("Speichern")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(3000);

        // Take screenshot after saving
        await page.screenshot({
          path: 'tmp/planned-modal-03-after-create.png',
          fullPage: true
        });

        console.log('✅ Session created, now looking for it to edit...');

        // Look for the created session
        const testSession = page.locator('text="Test Session"');
        const testSessionVisible = await testSession.isVisible();
        console.log(`📅 Test session visible: ${testSessionVisible}`);

        if (testSessionVisible) {
          console.log('🎯 Right-clicking on test session...');
          await testSession.click({ button: 'right' });
          await page.waitForTimeout(2000);

          // Take screenshot after right-click
          await page.screenshot({
            path: 'tmp/planned-modal-04-rightclick.png',
            fullPage: true
          });

          // Look for edit option
          const editOption = page.locator('text="Bearbeiten"');
          const editVisible = await editOption.isVisible();
          console.log(`📝 Edit option visible: ${editVisible}`);

          if (editVisible) {
            await editOption.click();
            await page.waitForTimeout(3000);

            // Take screenshot of edit modal
            await page.screenshot({
              path: 'tmp/planned-modal-05-edit-modal.png',
              fullPage: true
            });

            // Check if edit modal is visible
            const editModal = page.locator('h2:has-text("Session bearbeiten")');
            const editModalVisible = await editModal.isVisible();
            console.log(`📋 Edit modal visible: ${editModalVisible}`);

            if (editModalVisible) {
              console.log('✅ CalendarSessionEditModal opened successfully!');

              // Check for Timeline Information (should NOT exist)
              const timelineHeader = page.locator('text="Timeline-Informationen"');
              const timelineExists = await timelineHeader.isVisible();
              console.log(`📅 Timeline section exists: ${timelineExists}`);

              // Check for Delete button
              const deleteButton = page.locator('button:has-text("Session löschen")');
              const deleteExists = await deleteButton.isVisible();
              console.log(`🗑️ Delete button exists: ${deleteExists}`);

              // Test results
              if (!timelineExists) {
                console.log('✅ SUCCESS: Timeline Information removed from CalendarSessionEditModal');
              } else {
                console.log('❌ FAIL: Timeline Information still exists in CalendarSessionEditModal');
              }

              if (deleteExists) {
                console.log('✅ SUCCESS: Delete button exists in CalendarSessionEditModal');
              } else {
                console.log('❌ FAIL: Delete button missing in CalendarSessionEditModal');
              }

              // Take final screenshot
              await page.screenshot({
                path: 'tmp/planned-modal-06-final.png',
                fullPage: true
              });

              // Close modal
              const cancelButton = page.locator('button:has-text("Abbrechen")');
              if (await cancelButton.isVisible()) {
                await cancelButton.click();
              }

            } else {
              console.log('❌ CalendarSessionEditModal did not open');
            }
          } else {
            console.log('❌ Edit option not found in context menu');
          }
        } else {
          console.log('❌ Created test session not found');
        }
      } else {
        console.log('❌ Save button not found');
      }
    } else {
      console.log('❌ Create session modal did not open');
    }
  } else {
    console.log('❌ Session button not found');
  }

  console.log('✅ Planned session modal test completed');
});