/**
 * Debug test with browser console monitoring
 */

const { chromium } = require('playwright');

async function testWithConsoleDebugging() {
  console.log('🔍 Testing with console debugging...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    console.log(`🖥️ Browser Console [${msg.type()}]: ${msg.text()}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar loaded, checking for any console errors...');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tmp/console-debug-01-initial.png',
      fullPage: true 
    });
    
    // Try to click on a session and monitor what happens
    const sessionElement = await page.locator('text=Mathe Stu').first();
    
    if (await sessionElement.isVisible()) {
      console.log('📍 Found session, clicking...');
      
      await sessionElement.click();
      await page.waitForTimeout(2000);
      
      console.log('🖱️ Session clicked, taking screenshot...');
      await page.screenshot({ 
        path: 'tmp/console-debug-02-after-click.png',
        fullPage: true 
      });
      
      // Check for context menu
      const contextMenuVisible = await page.isVisible('text=Bearbeiten');
      console.log(`📋 Context menu visible: ${contextMenuVisible}`);
      
      if (contextMenuVisible) {
        console.log('📝 Clicking "Bearbeiten"...');
        await page.click('text=Bearbeiten');
        await page.waitForTimeout(3000);
        
        // Take screenshot after clicking edit
        await page.screenshot({ 
          path: 'tmp/console-debug-03-after-edit-click.png',
          fullPage: true 
        });
        
        // Check if modal is visible by looking for modal backdrop or specific modal elements
        const modalBackdrop = await page.locator('.fixed.inset-0.bg-black.bg-opacity-50').count();
        const modalHeader = await page.locator('text=Session bearbeiten').count();
        
        console.log(`🔍 Modal backdrop elements: ${modalBackdrop}`);
        console.log(`🔍 Modal header elements: ${modalHeader}`);
        
        if (modalHeader > 0) {
          console.log('✅ Edit modal is open!');
          
          // Now check for delete button
          const deleteButton = await page.locator('button:has-text("Session löschen")').count();
          console.log(`🗑️ Delete buttons found: ${deleteButton}`);
          
          if (deleteButton > 0) {
            console.log('✅ SUCCESS: Delete button found in edit modal!');
          } else {
            console.log('❌ Delete button not found in edit modal');
            
            // Check all visible text in modal
            const modalContent = await page.locator('.fixed.inset-0').textContent();
            console.log('📝 Modal content preview:', modalContent?.substring(0, 200) + '...');
          }
        } else {
          console.log('❌ Edit modal did not open');
        }
      }
    } else {
      console.log('❌ No session found to test with');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'tmp/console-debug-04-final.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/console-debug-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testWithConsoleDebugging();