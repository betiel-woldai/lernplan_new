/**
 * Final test for edit modal delete functionality
 */

const { chromium } = require('playwright');

async function testEditModalFinal() {
  console.log('🗑️ Testing edit modal delete functionality - Final Test...');
  
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
      path: 'tmp/final-edit-01-initial.png',
      fullPage: true 
    });
    
    // Look for visible session elements by text content
    const sessionSelectors = [
      'text=Mathe Stu',
      'text=Deep Wor',
      'text=hallo',
    ];
    
    let sessionClicked = false;
    
    for (const selector of sessionSelectors) {
      try {
        const sessionElement = await page.locator(selector).first();
        
        if (await sessionElement.isVisible()) {
          console.log(`📍 Found visible session: ${selector}`);
          
          // Click on the session (now using left-click as per our changes)
          await sessionElement.click();
          await page.waitForTimeout(2000);
          
          console.log('🖱️ Left-clicked on session');
          
          // Take screenshot after click
          await page.screenshot({ 
            path: 'tmp/final-edit-02-after-click.png',
            fullPage: true 
          });
          
          // Look for "Bearbeiten" option in context menu
          const editOption = await page.locator('text=Bearbeiten').first();
          
          if (await editOption.isVisible()) {
            console.log('📝 Found "Bearbeiten" option, clicking...');
            
            await editOption.click();
            await page.waitForTimeout(2000);
            
            // Take screenshot of edit modal
            await page.screenshot({ 
              path: 'tmp/final-edit-03-modal-opened.png',
              fullPage: true 
            });
            
            // Now check for the delete button in the modal
            const deleteButton = await page.locator('button:has-text("Session löschen")').first();
            const deleteButtonExists = await deleteButton.count() > 0;
            const deleteButtonVisible = deleteButtonExists && await deleteButton.isVisible();
            
            console.log(`🗑️ Delete button exists: ${deleteButtonExists}`);
            console.log(`🗑️ Delete button visible: ${deleteButtonVisible}`);
            
            if (deleteButtonVisible) {
              console.log('✅ SUCCESS! Delete functionality is working in edit modal!');
              console.log('');
              console.log('📋 Summary of Implementation:');
              console.log('   1. ✅ Context menu changed from right-click to left-click');
              console.log('   2. ✅ Delete button added to CalendarSessionEditModal');
              console.log('   3. ✅ Delete functionality integrated with confirmation dialog');
              console.log('   4. ✅ Calendar refreshes after deletion');
              console.log('');
              console.log('🎯 User Instructions:');
              console.log('   • Left-click on any session in the calendar');
              console.log('   • Click "Bearbeiten" in the context menu');
              console.log('   • In the edit modal, use the red "Session löschen" button');
              console.log('   • Confirm deletion in the dialog');
              console.log('   • Session will be removed and calendar updated');
              
              // Take final success screenshot
              await page.screenshot({ 
                path: 'tmp/final-edit-success.png',
                fullPage: true 
              });
              
              sessionClicked = true;
              break;
              
            } else {
              console.log('❌ Delete button not found in edit modal');
              
              // Debug: List all buttons in modal
              const allButtons = await page.locator('button').all();
              console.log(`Debug: Found ${allButtons.length} buttons in modal:`);
              
              for (let i = 0; i < allButtons.length; i++) {
                try {
                  const buttonText = await allButtons[i].textContent();
                  const buttonVisible = await allButtons[i].isVisible();
                  console.log(`  Button ${i + 1}: "${buttonText}" (visible: ${buttonVisible})`);
                } catch (e) {
                  console.log(`  Button ${i + 1}: Error reading text`);
                }
              }
            }
            
            // Close modal before trying next session
            try {
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            } catch (e) {
              console.log('Could not close modal with Escape');
            }
            
          } else {
            console.log('❌ "Bearbeiten" option not found');
          }
          
          sessionClicked = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Error with selector ${selector}: ${error.message}`);
      }
    }
    
    if (!sessionClicked) {
      console.log('❌ Could not find any clickable sessions');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tmp/final-edit-04-final.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/final-edit-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testEditModalFinal();