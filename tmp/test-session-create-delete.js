/**
 * Comprehensive test for session creation and deletion functionality
 */

const { chromium } = require('playwright');

async function testSessionCreateDelete() {
  console.log('🔄 Testing complete session create and delete workflow...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar page loaded');
    
    // Step 1: Create a new session
    console.log('📝 Step 1: Creating a new session...');
    
    // Click on an empty calendar cell to open create modal
    const emptyCells = await page.locator('.calendar-grid .calendar-cell').all();
    if (emptyCells.length > 0) {
      await emptyCells[15].click(); // Click on a day in the middle
      await page.waitForTimeout(2000);
      
      // Check if modal opened
      const modalVisible = await page.isVisible('text=Neue Session erstellen');
      if (modalVisible) {
        console.log('✅ Create modal opened');
        
        // Fill in the form
        await page.fill('input[placeholder*="Mathematik"]', 'Test Session für Delete');
        await page.selectOption('select', { index: 1 }); // Select first subject
        await page.fill('input[type="time"]', '10:00');
        await page.fill('input[type="time"]:nth-of-type(2)', '11:00');
        
        // Submit the form
        await page.click('button:has-text("Erstellen")');
        await page.waitForTimeout(3000);
        
        console.log('✅ Session creation form submitted');
        
        // Check if modal closed and session appears
        const modalClosed = await page.isHidden('text=Neue Session erstellen');
        if (modalClosed) {
          console.log('✅ Create modal closed successfully');
        }
        
        // Take screenshot of calendar with new session
        await page.screenshot({ 
          path: 'tmp/calendar-after-session-creation.png',
          fullPage: true 
        });
        
        console.log('📸 Screenshot saved: tmp/calendar-after-session-creation.png');
        
        // Step 2: Find and delete the session
        console.log('🗑️ Step 2: Testing session deletion...');
        
        // Look for the created session
        const sessionElement = await page.locator('text=Test Session für Delete').first();
        if (await sessionElement.isVisible()) {
          console.log('✅ Created session found in calendar');
          
          // Right-click to open context menu
          await sessionElement.click({ button: 'right' });
          await page.waitForTimeout(1500);
          
          // Check if context menu opened
          const contextMenuVisible = await page.isVisible('text=Löschen');
          if (contextMenuVisible) {
            console.log('✅ Context menu with delete option opened');
            
            // Click delete
            await page.click('text=Löschen');
            await page.waitForTimeout(1000);
            
            // Handle confirmation dialog
            page.on('dialog', async dialog => {
              console.log('📋 Confirmation dialog:', dialog.message());
              await dialog.accept();
            });
            
            await page.waitForTimeout(2000);
            
            // Check if session was deleted
            const sessionGone = await page.locator('text=Test Session für Delete').count();
            if (sessionGone === 0) {
              console.log('✅ Session successfully deleted from calendar');
            } else {
              console.log('❌ Session still visible after deletion');
            }
            
            // Take final screenshot
            await page.screenshot({ 
              path: 'tmp/calendar-after-session-deletion.png',
              fullPage: true 
            });
            
            console.log('📸 Final screenshot saved: tmp/calendar-after-session-deletion.png');
            
          } else {
            console.log('❌ Context menu not found');
          }
        } else {
          console.log('❌ Created session not found in calendar');
        }
      } else {
        console.log('❌ Create modal did not open');
      }
    }
    
    console.log('🎯 Session create and delete test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testSessionCreateDelete();