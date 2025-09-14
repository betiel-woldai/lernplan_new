/**
 * Test right-click on specific session elements
 */

const { chromium } = require('playwright');

async function testRightClickSession() {
  console.log('🖱️ Testing right-click on specific sessions...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log('✅ Calendar page loaded');
    
    // Look for specific session elements that contain text
    const sessionSelectors = [
      'text=Mathe Stu',
      'text=Deep Wor',
      'text=hallo',
      '[title*="Study Session"]',
      '.calendar-session',
      '.session-card'
    ];
    
    for (const selector of sessionSelectors) {
      console.log(`🔍 Looking for sessions with selector: ${selector}`);
      
      try {
        const sessions = await page.locator(selector).all();
        console.log(`Found ${sessions.length} sessions with selector "${selector}"`);
        
        if (sessions.length > 0) {
          const firstSession = sessions[0];
          const sessionText = await firstSession.textContent();
          console.log(`Session text: "${sessionText?.substring(0, 50)}..."`);
          
          // Get bounding box to ensure element is visible
          const boundingBox = await firstSession.boundingBox();
          if (boundingBox) {
            console.log(`Session position: x=${boundingBox.x}, y=${boundingBox.y}, width=${boundingBox.width}, height=${boundingBox.height}`);
            
            // Right-click on the center of the element
            await page.mouse.click(
              boundingBox.x + boundingBox.width / 2, 
              boundingBox.y + boundingBox.height / 2, 
              { button: 'right' }
            );
            
            await page.waitForTimeout(2000);
            
            // Take screenshot immediately after right-click
            await page.screenshot({ 
              path: `tmp/rightclick-${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
              fullPage: true 
            });
            
            // Check for context menu elements
            const contextMenus = await page.locator('.context-menu, [role="menu"], .menu, .dropdown-menu').all();
            console.log(`Context menus found: ${contextMenus.length}`);
            
            // Check for delete option
            const deleteOptions = await page.locator('text=Löschen, text=Delete, [aria-label*="delete"], [title*="delete"]').all();
            console.log(`Delete options found: ${deleteOptions.length}`);
            
            if (deleteOptions.length > 0) {
              console.log('✅ Delete option found! Breaking out of loop.');
              break;
            }
            
            // Click elsewhere to close any menu
            await page.mouse.click(100, 100);
            await page.waitForTimeout(500);
          }
        }
      } catch (error) {
        console.log(`⚠️ Error with selector "${selector}": ${error.message}`);
      }
    }
    
    // Try a more direct approach - look for elements with specific classes
    console.log('🔍 Looking for calendar session elements by class...');
    
    const calendarSessions = await page.locator('[class*="session"], [data-testid*="session"], div:has(text("Mathe")), div:has(text("Deep Work"))').all();
    console.log(`Found ${calendarSessions.length} potential calendar sessions`);
    
    if (calendarSessions.length > 0) {
      // Try right-clicking on a few different sessions
      for (let i = 0; i < Math.min(3, calendarSessions.length); i++) {
        const session = calendarSessions[i];
        console.log(`Testing session ${i + 1}...`);
        
        try {
          await session.scrollIntoViewIfNeeded();
          await session.click({ button: 'right' });
          await page.waitForTimeout(1500);
          
          // Take screenshot
          await page.screenshot({ 
            path: `tmp/session-${i + 1}-rightclick.png`,
            fullPage: true 
          });
          
          // Check for any visible menus
          const allMenus = await page.locator('div[style*="position"], .fixed, .absolute').all();
          console.log(`Positioned elements after right-click: ${allMenus.length}`);
          
          // Look for text content that might be a menu
          const visibleDeleteText = await page.isVisible('text=Löschen');
          console.log(`"Löschen" visible: ${visibleDeleteText}`);
          
          if (visibleDeleteText) {
            console.log('✅ Found delete option! Taking final screenshot...');
            await page.screenshot({ 
              path: 'tmp/delete-menu-visible.png',
              fullPage: true 
            });
            break;
          }
          
          // Click elsewhere to close menu
          await page.mouse.click(200, 200);
          await page.waitForTimeout(500);
          
        } catch (error) {
          console.log(`Error testing session ${i + 1}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tmp/rightclick-test-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testRightClickSession();