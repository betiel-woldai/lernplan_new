/**
 * Demonstrate complete delete workflow
 */

const { chromium } = require('playwright');

async function testDeleteWorkflow() {
  console.log('🗑️ Testing complete delete workflow...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar loaded');
    
    // Find a session to delete
    const sessionElement = await page.locator('text=Mathe Study Session').first();
    
    if (await sessionElement.isVisible()) {
      console.log('📍 Found session to delete');
      
      // Right-click to open context menu
      await sessionElement.click({ button: 'right' });
      await page.waitForTimeout(1500);
      
      console.log('📋 Context menu opened');
      
      // Take screenshot showing the context menu with delete option
      await page.screenshot({ 
        path: 'tmp/delete-context-menu-demo.png',
        fullPage: true 
      });
      
      // Check if delete option is visible
      const deleteVisible = await page.isVisible('text=Löschen');
      console.log(`🗑️ Delete option visible: ${deleteVisible}`);
      
      if (deleteVisible) {
        console.log('✅ Delete functionality is properly visible in context menu!');
        console.log('📝 Instructions for user:');
        console.log('   1. Right-click on any session in the calendar');
        console.log('   2. Click "Löschen" (red text at bottom of menu)');
        console.log('   3. Confirm deletion in the dialog');
        console.log('   4. Session will be removed from calendar');
        
        // Optionally click delete and handle confirmation
        await page.click('text=Löschen');
        
        // Handle the confirmation dialog
        page.once('dialog', async dialog => {
          console.log(`📋 Confirmation dialog: "${dialog.message()}"`);
          console.log('✅ Confirmation working properly');
          await dialog.dismiss(); // Don't actually delete for demo
        });
        
        await page.waitForTimeout(1000);
        
      } else {
        console.log('❌ Delete option not visible');
      }
      
    } else {
      console.log('❌ No sessions found to test delete on');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDeleteWorkflow();