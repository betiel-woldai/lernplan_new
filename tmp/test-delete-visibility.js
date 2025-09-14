/**
 * Test delete functionality visibility
 */

const { chromium } = require('playwright');

async function testDeleteVisibility() {
  console.log('🔍 Testing delete functionality visibility...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar page loaded');
    
    // First create a session to test delete on
    console.log('📝 Creating a test session...');
    
    // Click on an empty calendar cell
    try {
      const calendarCells = await page.locator('.calendar-cell').all();
      if (calendarCells.length > 0) {
        await calendarCells[15].click(); // Click on a day
        await page.waitForTimeout(2000);
        
        // Check if modal opened
        if (await page.isVisible('text=Neue Session erstellen')) {
          console.log('✅ Create modal opened');
          
          // Fill form quickly
          await page.fill('input[placeholder*="Mathematik"]', 'Test Delete Session');
          const subjectSelect = await page.locator('select').first();
          if (await subjectSelect.isVisible()) {
            await subjectSelect.selectOption({ index: 1 });
          }
          
          // Submit
          await page.click('button:has-text("Erstellen")');
          await page.waitForTimeout(3000);
          
          console.log('✅ Test session created');
        }
      }
    } catch (error) {
      console.log('⚠️ Could not create test session, continuing with existing sessions...');
    }
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'tmp/calendar-before-delete-test.png',
      fullPage: true 
    });
    
    // Look for any existing sessions
    console.log('🔍 Looking for sessions in calendar...');
    
    const sessionElements = await page.locator('[class*="session"], [title*="Session"], div:has-text("Mathe"), div:has-text("Deep Work")').all();
    console.log(`Found ${sessionElements.length} potential session elements`);
    
    if (sessionElements.length > 0) {
      // Try right-clicking on the first session element
      const firstSession = sessionElements[0];
      const sessionText = await firstSession.textContent();
      console.log(`Attempting right-click on session: "${sessionText}"`);
      
      await firstSession.click({ button: 'right' });
      await page.waitForTimeout(2000);
      
      // Check for context menu
      const contextMenuVisible = await page.isVisible('text=Löschen');
      const contextMenuDeleteVisible = await page.isVisible('text=Delete');
      const contextMenuTrashVisible = await page.locator('[data-testid="delete"]').isVisible();
      
      console.log(`Context menu "Löschen" visible: ${contextMenuVisible}`);
      console.log(`Context menu "Delete" visible: ${contextMenuDeleteVisible}`);
      console.log(`Trash icon visible: ${contextMenuTrashVisible}`);
      
      // Look for any context menu at all
      const anyContextMenu = await page.locator('.context-menu, [role="menu"], [aria-label*="menu"]').count();
      console.log(`Any context menu elements found: ${anyContextMenu}`);
      
      // Check for edit options
      const editVisible = await page.isVisible('text=Bearbeiten');
      const editEnglish = await page.isVisible('text=Edit');
      console.log(`Edit option visible: ${editVisible || editEnglish}`);
      
      // Take screenshot of right-click state
      await page.screenshot({ 
        path: 'tmp/calendar-after-rightclick.png',
        fullPage: true 
      });
      
      if (!contextMenuVisible && !editVisible) {
        console.log('❌ No context menu visible after right-click');
        console.log('🔍 Checking if sessions have hover/click interactions...');
        
        // Try regular click to see what happens
        await firstSession.click();
        await page.waitForTimeout(1000);
        
        // Check if any modal or menu appeared
        const modalAfterClick = await page.locator('.modal, [role="dialog"]').count();
        console.log(`Modals after regular click: ${modalAfterClick}`);
      }
    } else {
      console.log('❌ No session elements found to test delete functionality');
    }
    
    // List all clickable elements that might be sessions
    const allClickableElements = await page.locator('div[onclick], button, [role="button"], .cursor-pointer').all();
    console.log(`Total clickable elements on page: ${allClickableElements.length}`);
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'tmp/calendar-delete-test-final.png',
      fullPage: true 
    });
    
    console.log('📸 Screenshots saved for analysis');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/delete-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testDeleteVisibility();