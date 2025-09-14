/**
 * Simple test for edit modal delete functionality
 */

const { chromium } = require('playwright');

async function testEditModalSimple() {
  console.log('🗑️ Testing edit modal delete functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar loaded');
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'tmp/edit-modal-simple-01-initial.png',
      fullPage: true 
    });
    
    // Try to find and click on any session
    const sessions = await page.locator('[class*="session"], .calendar-session, [data-testid*="session"]').all();
    console.log(`Found ${sessions.length} potential session elements`);
    
    if (sessions.length > 0) {
      // Try clicking the first session
      const firstSession = sessions[0];
      const sessionText = await firstSession.textContent();
      console.log(`Clicking on session: "${sessionText?.substring(0, 30)}..."`);
      
      await firstSession.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after clicking
      await page.screenshot({ 
        path: 'tmp/edit-modal-simple-02-after-click.png',
        fullPage: true 
      });
      
      // Look for context menu
      const contextMenuItems = await page.locator('text=Bearbeiten').all();
      console.log(`Found ${contextMenuItems.length} "Bearbeiten" options`);
      
      if (contextMenuItems.length > 0) {
        await contextMenuItems[0].click();
        await page.waitForTimeout(2000);
        
        console.log('📝 Clicked "Bearbeiten", modal should be open');
        
        // Take screenshot of modal
        await page.screenshot({ 
          path: 'tmp/edit-modal-simple-03-modal.png',
          fullPage: true 
        });
        
        // Check for delete button
        const deleteButton = await page.locator('text=Session löschen').first();
        const deleteButtonVisible = await deleteButton.isVisible();
        console.log(`🗑️ Delete button visible: ${deleteButtonVisible}`);
        
        if (deleteButtonVisible) {
          console.log('✅ SUCCESS: Delete button found in edit modal!');
        } else {
          console.log('❌ ISSUE: Delete button not visible in edit modal');
          
          // Debug: Check what buttons are available
          const allButtons = await page.locator('button').all();
          console.log(`Total buttons found: ${allButtons.length}`);
          
          for (let i = 0; i < Math.min(10, allButtons.length); i++) {
            const buttonText = await allButtons[i].textContent();
            console.log(`Button ${i + 1}: "${buttonText}"`);
          }
        }
        
      } else {
        console.log('❌ No "Bearbeiten" option found');
      }
      
    } else {
      console.log('❌ No sessions found to test with');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tmp/edit-modal-simple-04-final.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/edit-modal-simple-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testEditModalSimple();