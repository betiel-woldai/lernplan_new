/**
 * Debug test to trace the edit flow
 */

const { chromium } = require('playwright');

async function testDebugEditFlow() {
  console.log('🔍 Testing edit flow with detailed debugging...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    if (msg.text().includes('DEBUG')) {
      console.log(`🖥️ Debug: ${msg.text()}`);
    }
  });
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar loaded');
    
    // Inject debugging code
    await page.evaluate(() => {
      // Override console.log to help us track function calls
      window.originalLog = console.log;
      window.debugLog = (...args) => {
        console.log('DEBUG:', ...args);
      };
      
      // Try to find and instrument the edit handler if possible
      const calendarElement = document.querySelector('[class*="calendar"]');
      if (calendarElement) {
        window.debugLog('Found calendar element');
      }
    });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tmp/debug-edit-01-initial.png',
      fullPage: true 
    });
    
    // Click on a session
    const sessionElement = await page.locator('text=Mathe Stu').first();
    
    if (await sessionElement.isVisible()) {
      console.log('📍 Clicking on session...');
      
      await sessionElement.click();
      await page.waitForTimeout(2000);
      
      // Check if context menu opened
      await page.screenshot({ 
        path: 'tmp/debug-edit-02-context-menu.png',
        fullPage: true 
      });
      
      const editButton = await page.locator('text=Bearbeiten').first();
      
      if (await editButton.isVisible()) {
        console.log('📝 Found Bearbeiten button, clicking...');
        
        // Add event listener for modal before clicking
        await page.evaluate(() => {
          window.debugLog('About to click Bearbeiten button');
          
          // Set up a mutation observer to detect modal creation
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === 1 && (
                    node.classList?.contains('fixed') || 
                    node.querySelector?.('.fixed') ||
                    node.textContent?.includes('Session bearbeiten')
                  )) {
                    window.debugLog('Modal detected in DOM!', {
                      nodeName: node.nodeName,
                      className: node.className,
                      textContent: node.textContent?.substring(0, 100)
                    });
                  }
                });
              }
            });
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // Store observer for cleanup
          window.modalObserver = observer;
        });
        
        await editButton.click();
        await page.waitForTimeout(3000);
        
        console.log('📝 Clicked Bearbeiten, checking for modal...');
        
        // Check for modal elements more thoroughly
        await page.evaluate(() => {
          window.debugLog('Checking for modal elements...');
          
          // Look for various modal indicators
          const modalBackdrops = document.querySelectorAll('.fixed');
          window.debugLog(`Found ${modalBackdrops.length} fixed elements`);
          
          const editModalHeaders = document.querySelectorAll('*');
          let foundModalHeader = false;
          editModalHeaders.forEach(el => {
            if (el.textContent && el.textContent.includes('Session bearbeiten')) {
              window.debugLog('Found modal header!', {
                tagName: el.tagName,
                className: el.className,
                visible: el.offsetParent !== null
              });
              foundModalHeader = true;
            }
          });
          
          if (!foundModalHeader) {
            window.debugLog('No modal header found');
          }
          
          // Check React component tree in dev tools if possible
          if (window.React) {
            window.debugLog('React is available');
          }
        });
        
        await page.screenshot({ 
          path: 'tmp/debug-edit-03-after-bearbeiten-click.png',
          fullPage: true 
        });
        
        // Check if modal is actually visible
        const modalExists = await page.locator('text=Session bearbeiten').count();
        console.log(`🔍 Modal header count: ${modalExists}`);
        
        if (modalExists > 0) {
          console.log('✅ Edit modal is visible!');
          
          // Now check for delete button
          const deleteButtonCount = await page.locator('button:has-text("Session löschen")').count();
          console.log(`🗑️ Delete button count: ${deleteButtonCount}`);
          
          if (deleteButtonCount > 0) {
            console.log('🎉 SUCCESS: Both edit modal and delete button are working!');
          } else {
            console.log('❓ Edit modal visible but delete button missing');
          }
          
        } else {
          console.log('❌ Edit modal not visible after clicking Bearbeiten');
          
          // Debug: check what happened
          const allVisibleText = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            const visibleTexts = [];
            allElements.forEach(el => {
              if (el.offsetParent !== null && el.textContent && el.textContent.trim().length > 0) {
                visibleTexts.push(el.textContent.trim().substring(0, 50));
              }
            });
            return visibleTexts.slice(0, 20); // First 20 visible text elements
          });
          
          console.log('📝 Visible page content:', allVisibleText.join(' | '));
        }
        
      } else {
        console.log('❌ Bearbeiten button not visible');
      }
      
    } else {
      console.log('❌ No session found to test with');
    }
    
    // Cleanup
    await page.evaluate(() => {
      if (window.modalObserver) {
        window.modalObserver.disconnect();
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/debug-edit-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testDebugEditFlow();