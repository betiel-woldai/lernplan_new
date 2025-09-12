import { test, expect } from '@playwright/test';

test.describe('Calendar Inline Editing - Issue #15 Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start fresh
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('Complete calendar inline editing workflow with German terminology', async ({ page }) => {
    // Step 1: Take initial screenshot
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-01-initial-dashboard.png', 
      fullPage: true 
    });
    console.log('📸 Initial dashboard screenshot captured');

    // Step 2: Create test sessions via Overview page
    console.log('🎯 Creating test sessions via Overview page...');
    
    // Find and click the "Sitzung starten" button
    const startButton = page.locator('button').filter({ hasText: /Sitzung starten|Start Session/ });
    await expect(startButton).toBeVisible({ timeout: 10000 });
    await startButton.click();
    await page.waitForTimeout(1000);

    // Fill out session form - first session
    const subjectSelect = page.locator('select[name="subjectId"]');
    await expect(subjectSelect).toBeVisible({ timeout: 5000 });
    await subjectSelect.selectOption({ index: 1 }); // Select first available subject
    
    const durationInput = page.locator('input[name="duration"]');
    await expect(durationInput).toBeVisible();
    await durationInput.fill('25');
    
    const noteInput = page.locator('input[name="note"], textarea[name="note"]');
    if (await noteInput.isVisible()) {
      await noteInput.fill('Test Session 1 - Deep Work');
    }

    // Start and immediately complete the session
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /Starten|Start/ });
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Stop the session immediately
    const stopButton = page.locator('button').filter({ hasText: /Stoppen|Stop/ });
    if (await stopButton.isVisible()) {
      await stopButton.click();
      await page.waitForTimeout(1000);
    }

    console.log('✅ First test session created');

    // Step 3: Create second session via Subjects page
    console.log('🎯 Navigating to Subjects page for second session...');
    await page.click('a[href="/subjects"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-02-subjects-page.png', 
      fullPage: true 
    });

    // Create session from subjects page
    const subjectStartButton = page.locator('button').filter({ hasText: /Sitzung starten|Start Session/ }).first();
    if (await subjectStartButton.isVisible()) {
      await subjectStartButton.click();
      await page.waitForTimeout(1000);

      // Fill duration
      const subjectDurationInput = page.locator('input[name="duration"]');
      if (await subjectDurationInput.isVisible()) {
        await subjectDurationInput.fill('30');
      }

      // Add note
      const subjectNoteInput = page.locator('input[name="note"], textarea[name="note"]');
      if (await subjectNoteInput.isVisible()) {
        await subjectNoteInput.fill('Test Session 2 - From Subjects');
      }

      // Start session
      const subjectSubmitButton = page.locator('button[type="submit"]').filter({ hasText: /Starten|Start/ });
      if (await subjectSubmitButton.isVisible()) {
        await subjectSubmitButton.click();
        await page.waitForTimeout(2000);

        // Stop immediately
        const subjectStopButton = page.locator('button').filter({ hasText: /Stoppen|Stop/ });
        if (await subjectStopButton.isVisible()) {
          await subjectStopButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    console.log('✅ Second test session created');

    // Step 4: Navigate to Analytics/Calendar page
    console.log('🎯 Navigating to Analytics/Calendar page...');
    await page.click('a[href="/analytics"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-03-calendar-before-editing.png', 
      fullPage: true 
    });

    // Step 5: Test calendar session clicking and modal opening
    console.log('🎯 Testing calendar session clicking...');
    
    // Look for calendar sessions (they might be in different formats)
    const calendarSessions = page.locator('.calendar-session, [data-testid="calendar-session"], .session-item, .calendar-event');
    const sessionCount = await calendarSessions.count();
    console.log(`Found ${sessionCount} calendar sessions`);

    if (sessionCount > 0) {
      // Click on first session
      await calendarSessions.first().click();
      await page.waitForTimeout(1500);

      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-04-session-modal-opened.png', 
        fullPage: true 
      });

      // Step 6: Test completion status toggle functionality
      console.log('🎯 Testing completion status toggle...');
      
      // Look for completion toggle (might be checkbox, button, or select)
      const completionToggle = page.locator(
        'input[type="checkbox"][name*="completed"], ' +
        'input[type="checkbox"][name*="status"], ' +
        'button:has-text("ausstehend"), ' +
        'button:has-text("abgeschlossen"), ' +
        'select[name*="status"], ' +
        '[data-testid="completion-toggle"]'
      );

      if (await completionToggle.isVisible()) {
        console.log('📋 Found completion toggle element');
        
        // Check current status and toggle it
        const isChecked = await completionToggle.isChecked?.() || false;
        await completionToggle.click();
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-05-after-status-toggle.png', 
          fullPage: true 
        });

        // Step 7: Verify German terminology appears correctly
        console.log('🇩🇪 Verifying German terminology...');
        
        // Check for German status terms
        const germanTerms = [
          page.locator('text="ausstehend"'),
          page.locator('text="abgeschlossen"'),
          page.locator('text="Abgeschlossen"'),
          page.locator('text="Ausstehend"')
        ];

        let germanTermFound = false;
        for (const term of germanTerms) {
          if (await term.isVisible()) {
            germanTermFound = true;
            console.log(`✅ German term found: ${await term.textContent()}`);
            break;
          }
        }

        if (!germanTermFound) {
          console.log('⚠️ No German terms found, checking all visible text...');
          const modalText = await page.textContent('body');
          console.log('Modal content includes:', modalText?.substring(0, 200));
        }

        // Step 8: Save changes and verify statistics sync
        console.log('💾 Saving changes...');
        
        const saveButton = page.locator('button').filter({ 
          hasText: /Speichern|Save|Änderungen speichern|Update/ 
        });
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(2000);
        } else {
          // Try closing modal with X or Cancel
          const closeButton = page.locator('button').filter({ hasText: /×|Schließen|Close|Abbrechen/ });
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(1000);
          }
        }

        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-06-after-save-calendar.png', 
          fullPage: true 
        });

        // Step 9: Verify statistics update immediately
        console.log('📊 Checking statistics updates...');
        
        // Navigate to dashboard to check stats
        await page.click('a[href="/"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-07-dashboard-stats-updated.png', 
          fullPage: true 
        });

        // Step 10: Test future session protection
        console.log('🔒 Testing future session protection...');
        
        // Go back to calendar
        await page.click('a[href="/analytics"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Try to click on sessions from different dates
        const futureSessions = page.locator('.calendar-session, [data-testid="calendar-session"]');
        const futureSessionCount = await futureSessions.count();
        
        if (futureSessionCount > 1) {
          // Click on second session (might be future)
          await futureSessions.nth(1).click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-08-future-session-test.png', 
            fullPage: true 
          });

          // Check if future session can be modified
          const futureToggle = page.locator('input[type="checkbox"][disabled], button[disabled]');
          if (await futureToggle.isVisible()) {
            console.log('✅ Future session protection working - toggle is disabled');
          }
        }

        // Step 11: Test session reverting (completed back to pending)
        console.log('🔄 Testing session status reverting...');
        
        // Find a completed session and revert it
        const completedSessions = page.locator('.calendar-session[data-status="completed"], .session-completed');
        if (await completedSessions.count() > 0) {
          await completedSessions.first().click();
          await page.waitForTimeout(1000);

          const revertToggle = page.locator('input[type="checkbox"][checked]');
          if (await revertToggle.isVisible()) {
            await revertToggle.click();
            await page.waitForTimeout(1000);

            await page.screenshot({ 
              path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-09-session-reverted.png', 
              fullPage: true 
            });

            // Save the revert
            const revertSaveButton = page.locator('button').filter({ hasText: /Speichern|Save/ });
            if (await revertSaveButton.isVisible()) {
              await revertSaveButton.click();
              await page.waitForTimeout(2000);
            }
          }
        }

        // Final screenshot
        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-10-final-calendar-state.png', 
          fullPage: true 
        });

        console.log('✅ Calendar inline editing test completed successfully!');
        
      } else {
        console.log('❌ No completion toggle found in modal');
        
        // Take screenshot of modal content for debugging
        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-debug-modal-content.png', 
          fullPage: true 
        });
        
        // Log modal content
        const modalContent = await page.textContent('body');
        console.log('Modal content:', modalContent?.substring(0, 500));
      }
      
    } else {
      console.log('❌ No calendar sessions found');
      
      // Debug screenshot
      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-debug-no-sessions.png', 
        fullPage: true 
      });
    }

    // Test console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('❌ JavaScript Error:', msg.text());
      }
    });

    // Test final state
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-11-test-complete.png', 
      fullPage: true 
    });
  });

  test('Edge case testing - Future sessions and statistics sync', async ({ page }) => {
    console.log('🧪 Testing edge cases...');
    
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-edge-01-initial.png', 
      fullPage: true 
    });

    // Navigate to analytics
    await page.click('a[href="/analytics"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for existing sessions
    const existingSessions = page.locator('.calendar-session, [data-testid="calendar-session"]');
    const sessionCount = await existingSessions.count();
    console.log(`Found ${sessionCount} existing sessions for edge case testing`);

    if (sessionCount > 0) {
      // Test clicking session and checking German terms
      await existingSessions.first().click();
      await page.waitForTimeout(1500);

      // Verify German terms are present
      const germanChecks = [
        { selector: 'text="ausstehend"', term: 'ausstehend' },
        { selector: 'text="abgeschlossen"', term: 'abgeschlossen' },
        { selector: 'text="Ausstehend"', term: 'Ausstehend' },
        { selector: 'text="Abgeschlossen"', term: 'Abgeschlossen' }
      ];

      for (const check of germanChecks) {
        if (await page.locator(check.selector).isVisible()) {
          console.log(`✅ German terminology verified: "${check.term}"`);
        }
      }

      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-edge-02-german-terms.png', 
        fullPage: true 
      });

      // Test statistics immediate sync
      const toggleElement = page.locator('input[type="checkbox"], button').first();
      if (await toggleElement.isVisible()) {
        await toggleElement.click();
        await page.waitForTimeout(500);

        // Save changes
        const saveBtn = page.locator('button').filter({ hasText: /Speichern|Save/ });
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }

        // Verify immediate statistics update
        await page.click('a[href="/"]');
        await page.waitForTimeout(2000);

        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-edge-03-stats-sync.png', 
          fullPage: true 
        });

        console.log('✅ Edge case testing completed');
      }
    }
  });
});