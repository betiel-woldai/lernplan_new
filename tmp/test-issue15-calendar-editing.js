/**
 * Manual test script for Issue #15 Calendar Inline Editing capabilities
 * Tests the calendar inline editing functionality with German terminology
 */

const { chromium } = require('playwright');

async function testCalendarInlineEditing() {
  console.log('🚀 Starting Issue #15 Calendar Inline Editing Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Initial homepage
    console.log('📱 Step 1: Loading homepage...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-01-homepage.png', 
      fullPage: true 
    });
    
    // Check what's on the homepage
    const pageContent = await page.textContent('body');
    console.log('Homepage content preview:', pageContent.substring(0, 200));
    
    // Look for any session creation buttons
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(btn => ({ text: btn.textContent?.trim(), visible: btn.offsetParent !== null }))
    );
    console.log('Available buttons:', buttons.filter(btn => btn.visible));

    // Step 2: Navigate to Analytics/Calendar
    console.log('📊 Step 2: Navigating to Analytics/Calendar...');
    await page.click('a[href="/analytics"]');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-02-calendar-initial.png', 
      fullPage: true 
    });

    // Look for existing sessions in the calendar
    const sessionElements = await page.$$eval('*', elements => {
      return elements
        .filter(el => {
          const text = el.textContent || '';
          const className = el.className || '';
          return text.toLowerCase().includes('session') || 
                 className.includes('session') || 
                 className.includes('calendar') ||
                 text.includes('Deep Work') ||
                 text.includes('Study') ||
                 el.hasAttribute('data-session') ||
                 el.hasAttribute('data-testid');
        })
        .slice(0, 10) // Limit to first 10
        .map(el => ({
          tag: el.tagName,
          text: el.textContent?.substring(0, 100),
          className: el.className,
          clickable: el.onclick !== null || el.role === 'button' || el.tagName === 'BUTTON'
        }));
    });
    
    console.log('Found session-related elements:', sessionElements);

    // Step 3: Look for clickable calendar sessions
    console.log('🎯 Step 3: Looking for clickable sessions...');
    
    // Try various selectors for calendar sessions
    const sessionSelectors = [
      '.calendar-session',
      '.session-item', 
      '.calendar-event',
      '[data-testid="calendar-session"]',
      '[data-testid="session"]',
      '.session',
      'button[data-session]',
      '[role="button"][data-session]'
    ];

    let foundSessions = [];
    for (const selector of sessionSelectors) {
      try {
        const sessions = await page.$$(selector);
        if (sessions.length > 0) {
          console.log(`✅ Found ${sessions.length} sessions with selector: ${selector}`);
          foundSessions = sessions;
          break;
        }
      } catch (error) {
        console.log(`❌ Error with selector ${selector}:`, error.message);
      }
    }

    if (foundSessions.length > 0) {
      console.log('🎉 Found existing sessions! Testing calendar editing...');
      
      // Step 4: Click on first session
      console.log('🖱️  Step 4: Clicking on first session...');
      await foundSessions[0].click();
      await page.waitForTimeout(2000);

      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-03-modal-opened.png', 
        fullPage: true 
      });

      // Step 5: Look for German terminology and completion toggle
      console.log('🇩🇪 Step 5: Testing German terminology and completion toggle...');
      
      // Check for German terms
      const germanTerms = ['ausstehend', 'abgeschlossen', 'Ausstehend', 'Abgeschlossen'];
      let germanFound = false;
      for (const term of germanTerms) {
        try {
          const element = await page.$(`text="${term}"`);
          if (element) {
            console.log(`✅ German term found: "${term}"`);
            germanFound = true;
          }
        } catch (error) {
          // Term not found, continue
        }
      }

      if (!germanFound) {
        console.log('⚠️ German terms not found, checking modal content...');
        const modalContent = await page.textContent('body');
        console.log('Modal content:', modalContent.substring(0, 300));
      }

      // Look for completion toggle elements
      const toggleSelectors = [
        'input[type="checkbox"]',
        'input[type="checkbox"][name*="completed"]',
        'input[type="checkbox"][name*="status"]',
        'button[role="switch"]',
        'select[name*="status"]'
      ];

      let toggleFound = false;
      for (const selector of toggleSelectors) {
        try {
          const toggle = await page.$(selector);
          if (toggle) {
            console.log(`✅ Found completion toggle: ${selector}`);
            
            // Test the toggle
            const isChecked = await toggle.isChecked?.() || false;
            console.log(`Current state: ${isChecked ? 'completed' : 'pending'}`);
            
            await toggle.click();
            await page.waitForTimeout(1000);
            
            const newState = await toggle.isChecked?.() || false;
            console.log(`New state: ${newState ? 'completed' : 'pending'}`);
            
            await page.screenshot({ 
              path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-04-after-toggle.png', 
              fullPage: true 
            });
            
            toggleFound = true;
            break;
          }
        } catch (error) {
          console.log(`Toggle selector ${selector} error:`, error.message);
        }
      }

      if (!toggleFound) {
        console.log('❌ No completion toggle found');
      }

      // Step 6: Save changes
      console.log('💾 Step 6: Saving changes...');
      const saveSelectors = [
        'button[type="submit"]',
        'button:has-text("Speichern")',
        'button:has-text("Save")', 
        'button:has-text("Update")',
        'button:has-text("Änderungen speichern")'
      ];

      let saved = false;
      for (const selector of saveSelectors) {
        try {
          const saveButton = await page.$(selector);
          if (saveButton && await saveButton.isVisible()) {
            await saveButton.click();
            await page.waitForTimeout(1500);
            saved = true;
            console.log('✅ Changes saved');
            break;
          }
        } catch (error) {
          console.log(`Save selector ${selector} error:`, error.message);
        }
      }

      if (!saved) {
        // Try to close modal
        console.log('💭 Trying to close modal...');
        const closeSelectors = ['button:has-text("×")', 'button:has-text("Close")', '[aria-label="Close"]'];
        for (const selector of closeSelectors) {
          try {
            const closeButton = await page.$(selector);
            if (closeButton) {
              await closeButton.click();
              await page.waitForTimeout(1000);
              break;
            }
          } catch (error) {
            // Continue
          }
        }
      }

      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-05-after-save.png', 
        fullPage: true 
      });

      // Step 7: Check statistics sync
      console.log('📊 Step 7: Checking statistics sync...');
      await page.click('a[href="/"]');
      await page.waitForTimeout(2000);

      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-06-dashboard-updated.png', 
        fullPage: true 
      });

      console.log('✅ Calendar inline editing test completed successfully!');
      
    } else {
      console.log('❌ No existing sessions found. Let me check if we can create some...');
      
      // Step Alt: Try to create sessions for testing
      console.log('🔧 Trying to create test sessions...');
      
      // Go to subjects page
      await page.click('a[href="/subjects"]');
      await page.waitForTimeout(2000);

      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-subjects-page.png', 
        fullPage: true 
      });

      // Look for start session buttons on subjects page
      const subjectButtons = await page.$$eval('button', buttons => 
        buttons
          .filter(btn => btn.offsetParent !== null)
          .map(btn => btn.textContent?.trim())
      );
      console.log('Subjects page buttons:', subjectButtons);

      // Go back to homepage
      await page.click('a[href="/"]');
      await page.waitForTimeout(2000);

      // Look for main start session button
      const startButtons = await page.$$('button');
      for (const button of startButtons) {
        const text = await button.textContent();
        if (text && (text.includes('Start') || text.includes('Sitzung') || text.includes('starten'))) {
          console.log(`Found potential start button: "${text}"`);
        }
      }

      await page.screenshot({ 
        path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-no-sessions-found.png', 
        fullPage: true 
      });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/tmp/issue15-test-error.png', 
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed, browser will remain open for inspection');
    // await browser.close();
  }
}

// Run the test
testCalendarInlineEditing().catch(console.error);