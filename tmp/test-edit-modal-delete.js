/**
 * Test the delete functionality in edit modal
 */

const { chromium } = require('playwright');

async function testEditModalDelete() {
  console.log('🗑️ Testing delete functionality in edit modal...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar loaded');
    
    // Find a session to test with
    const sessionSelector = 'text=Mathe Study Session';
    const sessionElement = await page.locator(sessionSelector).first();
    
    if (await sessionElement.isVisible()) {
      console.log('📍 Found session to test');
      
      // Take screenshot of initial state
      await page.screenshot({ 
        path: 'tmp/edit-delete-01-initial.png',
        fullPage: true 
      });
      
      // Left-click on session to open context menu (new functionality)
      await sessionElement.click();
      await page.waitForTimeout(1500);
      
      console.log('📋 Context menu should be open');
      
      // Take screenshot showing context menu
      await page.screenshot({ 
        path: 'tmp/edit-delete-02-context-menu.png',
        fullPage: true 
      });
      
      // Check if "Bearbeiten" option is visible
      const editVisible = await page.isVisible('text=Bearbeiten');
      console.log(`✏️ Edit option visible: ${editVisible}`);
      
      if (editVisible) {
        // Click on "Bearbeiten" to open edit modal
        await page.click('text=Bearbeiten');
        await page.waitForTimeout(2000);
        
        console.log('📝 Edit modal should be open');
        
        // Take screenshot showing edit modal
        await page.screenshot({ 
          path: 'tmp/edit-delete-03-edit-modal.png',
          fullPage: true 
        });
        
        // Check if delete button is visible in the edit modal
        const deleteButtonVisible = await page.isVisible('text=Session löschen');
        console.log(`🗑️ Delete button in edit modal visible: ${deleteButtonVisible}`);
        
        if (deleteButtonVisible) {
          console.log('✅ Delete functionality successfully added to edit modal!');
          console.log('📝 Instructions for user:');
          console.log('   1. Left-click on any session in the calendar');
          console.log('   2. Click "Bearbeiten" in the context menu');
          console.log('   3. In the edit modal, click "Session löschen" (red button on left)');
          console.log('   4. Confirm deletion in the dialog');
          console.log('   5. Session will be removed from calendar');
          
          // Optionally test the delete functionality (but don't actually delete)
          // await page.click('text=Session löschen');
          
          // Handle the confirmation dialog
          // page.once('dialog', async dialog => {
          //   console.log(`📋 Delete confirmation: "${dialog.message()}"`);
          //   await dialog.dismiss(); // Don't actually delete for demo
          // });
          
        } else {
          console.log('❌ Delete button not found in edit modal');
        }
        
        // Close the edit modal
        await page.click('text=Abbrechen');
        await page.waitForTimeout(500);
        
      } else {
        console.log('❌ Edit option not visible in context menu');
      }
      
    } else {
      console.log('❌ No sessions found to test with');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tmp/edit-delete-04-final.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/edit-delete-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testEditModalDelete();