import { test, expect } from '@playwright/test';

test.describe('Calendar Session Click Test - Issue #15', () => {
  test('Test clicking calendar sessions and modal functionality', async ({ page }) => {
    test.setTimeout(90000);
    
    console.log('🚀 Testing calendar session clicking functionality...');
    
    // Step 1: Load homepage which shows the calendar
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-01-homepage-with-sessions.png', 
      fullPage: true 
    });
    
    // Step 2: Look for calendar sessions that are clickable
    console.log('🔍 Looking for clickable calendar sessions...');
    
    // Try different session selectors based on what we see in the screenshot
    const sessionSelectors = [
      '.calendar-day [class*="session"]',
      '.calendar-day button',
      '[data-session-id]',
      '.session-item',
      '.calendar-session',
      // Based on the calendar structure, sessions appear to be in calendar days
      '.calendar-day > div',
      '.calendar-day span',
      '[data-testid*="session"]'
    ];
    
    let clickableSession = null;
    let sessionCount = 0;
    
    for (const selector of sessionSelectors) {
      try {
        const sessions = await page.locator(selector).all();
        sessionCount = sessions.length;
        
        if (sessionCount > 0) {
          console.log(`✅ Found ${sessionCount} elements with selector: ${selector}`);
          
          // Check if any are clickable (have click handlers or are buttons)
          for (let i = 0; i < Math.min(3, sessions.length); i++) {
            const session = sessions[i];
            const tagName = await session.evaluate(el => el.tagName);
            const hasClick = await session.evaluate(el => 
              el.onclick !== null || 
              el.getAttribute('role') === 'button' || 
              el.tagName === 'BUTTON' ||
              el.style.cursor === 'pointer' ||
              el.classList.contains('cursor-pointer')
            );
            
            if (hasClick || tagName === 'BUTTON') {
              console.log(`🎯 Found clickable session at index ${i}: ${tagName}`);
              clickableSession = session;
              break;
            }
          }
          
          if (clickableSession) break;
        }
      } catch (error) {
        console.log(`❌ Error with selector ${selector}: ${error.message}`);
      }
    }
    
    // Alternative approach: look for sessions in calendar days by text content
    if (!clickableSession) {
      console.log('🔧 Trying alternative approach: looking for sessions by content...');
      
      // Find calendar days with session content
      const daysWithSessions = await page.locator('.calendar-day').filter({
        has: page.locator('text=/Mathe|Deep Work|Study|Session/')
      }).all();
      
      console.log(`📅 Found ${daysWithSessions.length} calendar days with session content`);
      
      if (daysWithSessions.length > 0) {
        // Look for clickable elements within these days
        for (const day of daysWithSessions.slice(0, 3)) {
          const clickableElements = await day.locator('button, [role="button"], .cursor-pointer, [data-clickable]').all();
          if (clickableElements.length > 0) {
            clickableSession = clickableElements[0];
            console.log('🎯 Found clickable session element in calendar day');
            break;
          }
        }
      }
    }
    
    // Final fallback: try clicking on any visible session-like text
    if (!clickableSession) {
      console.log('🔧 Final fallback: looking for session text to click...');
      const sessionTexts = await page.locator('text=/Deep Work|Mathe|Study/').all();
      if (sessionTexts.length > 0) {
        clickableSession = sessionTexts[0];
        console.log('🎯 Using session text as clickable element');
      }
    }
    
    if (clickableSession) {
      console.log('🖱️ Step 3: Clicking on session...');
      
      // Take screenshot before clicking
      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-02-before-session-click.png', 
        fullPage: true 
      });
      
      // Click the session
      await clickableSession.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking to see if modal opened
      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-03-after-session-click.png', 
        fullPage: true 
      });
      
      // Step 4: Check if modal or edit interface appeared
      console.log('📋 Step 4: Checking for edit modal or interface...');
      
      // Look for modal elements
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '.modal-overlay',
        '[data-testid*="modal"]',
        '.fixed.inset-0', // Tailwind modal overlay
        '.session-edit-modal',
        '.edit-session-modal'
      ];
      
      let modalFound = false;
      for (const selector of modalSelectors) {
        if (await page.locator(selector).isVisible()) {
          console.log(`✅ Modal found with selector: ${selector}`);
          modalFound = true;
          break;
        }
      }
      
      if (modalFound) {
        console.log('🎉 Session modal opened successfully!');
        
        // Step 5: Look for German terminology
        console.log('🇩🇪 Step 5: Checking for German terminology...');
        
        const germanTerms = [
          'ausstehend',
          'abgeschlossen', 
          'Ausstehend',
          'Abgeschlossen',
          'Status',
          'Fertiggestellt',
          'Bearbeitung'
        ];
        
        let germanTermsFound = [];
        for (const term of germanTerms) {
          try {
            const element = await page.locator(`text="${term}"`).first();
            if (await element.isVisible()) {
              germanTermsFound.push(term);
              console.log(`✅ German term found: "${term}"`);
            }
          } catch (error) {
            // Term not found
          }
        }
        
        // Step 6: Look for completion toggle
        console.log('🔘 Step 6: Looking for completion toggle...');
        
        const toggleSelectors = [
          'input[type="checkbox"]',
          'input[type="checkbox"][name*="completed"]',
          'input[type="checkbox"][name*="status"]',
          'button[role="switch"]',
          'select[name*="status"]',
          'button:has-text("ausstehend")',
          'button:has-text("abgeschlossen")'
        ];
        
        let toggleElement = null;
        for (const selector of toggleSelectors) {
          try {
            const element = await page.locator(selector).first();
            if (await element.isVisible()) {
              toggleElement = element;
              console.log(`✅ Found toggle element: ${selector}`);
              break;
            }
          } catch (error) {
            // Element not found
          }
        }
        
        if (toggleElement) {
          console.log('🔄 Step 7: Testing completion status toggle...');
          
          // Get current state
          const isChecked = await toggleElement.isChecked?.() || false;
          const currentText = await toggleElement.textContent?.() || '';
          console.log(`Current toggle state: ${isChecked ? 'checked' : 'unchecked'}, text: "${currentText}"`);
          
          // Toggle it
          await toggleElement.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ 
            path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-04-after-toggle.png', 
            fullPage: true 
          });
          
          // Check new state
          const newIsChecked = await toggleElement.isChecked?.() || false;
          const newText = await toggleElement.textContent?.() || '';
          console.log(`New toggle state: ${newIsChecked ? 'checked' : 'unchecked'}, text: "${newText}"`);
          
          if (isChecked !== newIsChecked || currentText !== newText) {
            console.log('✅ Toggle state changed successfully!');
          } else {
            console.log('⚠️ Toggle state did not change');
          }
        }
        
        // Step 8: Look for and test save functionality
        console.log('💾 Step 8: Looking for save functionality...');
        
        const saveSelectors = [
          'button[type="submit"]',
          'button:has-text("Speichern")',
          'button:has-text("Save")',
          'button:has-text("Änderungen speichern")',
          'button:has-text("Update")',
          '[data-testid*="save"]'
        ];
        
        let saveButton = null;
        for (const selector of saveSelectors) {
          try {
            const button = await page.locator(selector).first();
            if (await button.isVisible()) {
              saveButton = button;
              console.log(`✅ Found save button: ${selector}`);
              break;
            }
          } catch (error) {
            // Button not found
          }
        }
        
        if (saveButton) {
          console.log('🔄 Clicking save button...');
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-05-after-save.png', 
            fullPage: true 
          });
        } else {
          console.log('⚠️ No save button found, trying to close modal...');
          
          // Try to close modal with common close methods
          const closeSelectors = [
            'button:has-text("×")',
            'button:has-text("Close")',
            'button:has-text("Schließen")',
            '[aria-label="Close"]',
            '.modal-close'
          ];
          
          for (const selector of closeSelectors) {
            try {
              const closeBtn = await page.locator(selector).first();
              if (await closeBtn.isVisible()) {
                await closeBtn.click();
                await page.waitForTimeout(1000);
                break;
              }
            } catch (error) {
              // Close button not found
            }
          }
        }
        
        // Step 9: Verify calendar updated
        console.log('📊 Step 9: Verifying calendar updates...');
        
        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-06-calendar-updated.png', 
          fullPage: true 
        });
        
        // Step 10: Check statistics sync by navigating to analytics
        console.log('📈 Step 10: Checking statistics sync...');
        
        await page.click('a[href="/analytics"]');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-07-analytics-after-change.png', 
          fullPage: true 
        });
        
        // Go back to homepage to see final state
        await page.click('a[href="/"]');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-08-final-homepage-state.png', 
          fullPage: true 
        });
        
        console.log('✅ Calendar session click test completed successfully!');
        
        // Summary
        console.log('\n📋 TEST SUMMARY:');
        console.log(`- Sessions found: ${sessionCount > 0 ? 'Yes' : 'No'}`);
        console.log(`- Modal opened: ${modalFound ? 'Yes' : 'No'}`);
        console.log(`- German terms found: ${germanTermsFound.length > 0 ? germanTermsFound.join(', ') : 'None'}`);
        console.log(`- Toggle functionality: ${toggleElement ? 'Available' : 'Not found'}`);
        console.log(`- Save functionality: ${saveButton ? 'Available' : 'Not found'}`);
        
      } else {
        console.log('❌ No modal opened after clicking session');
        
        // Check if page content changed
        const newContent = await page.textContent('body');
        console.log('Page content after click:', newContent.substring(0, 200));
        
        // Look for any form elements that might have appeared
        const formElements = await page.locator('form, input, select, textarea').all();
        console.log(`Found ${formElements.length} form elements after click`);
      }
      
    } else {
      console.log('❌ No clickable sessions found');
      console.log(`Total sessions found: ${sessionCount}`);
      
      // Debug screenshot
      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-click-debug-no-clickable-sessions.png', 
        fullPage: true 
      });
    }
    
    console.log('🏁 Calendar session click test completed');
  });
});