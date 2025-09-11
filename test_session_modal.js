const { chromium } = require('playwright');

async function testSessionModal() {
  console.log('🚀 Starting detailed session modal test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 // Even slower for better interaction
  });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: './test-results/modal-01-homepage.png', fullPage: true });

    // Look for and click on a calendar session
    console.log('🔍 Looking for calendar sessions to edit...');
    
    // Try clicking on existing math sessions in the calendar
    const sessionElements = await page.locator('text=Mathe').all();
    console.log(`Found ${sessionElements.length} Math sessions`);
    
    if (sessionElements.length > 0) {
      console.log('📝 Clicking on first Math session...');
      await sessionElements[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: './test-results/modal-02-after-session-click.png', fullPage: true });
    }

    // Look for modal or session details
    console.log('🔍 Looking for session modal...');
    
    const modalSelectors = [
      '[role="dialog"]',
      '.modal',
      '.session-modal',
      '.session-edit-modal',
      '[data-testid="session-modal"]'
    ];

    let modalFound = false;
    for (const selector of modalSelectors) {
      try {
        const modal = page.locator(selector);
        if (await modal.isVisible()) {
          console.log(`✅ Found modal: ${selector}`);
          modalFound = true;
          await page.screenshot({ path: './test-results/modal-03-modal-found.png', fullPage: true });
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // If no modal found, try double-clicking or right-clicking
    if (!modalFound && sessionElements.length > 0) {
      console.log('🖱️ Trying double-click on session...');
      await sessionElements[0].dblclick();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: './test-results/modal-04-after-double-click.png', fullPage: true });
      
      // Check for modal again
      for (const selector of modalSelectors) {
        try {
          const modal = page.locator(selector);
          if (await modal.isVisible()) {
            console.log(`✅ Found modal after double-click: ${selector}`);
            modalFound = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    }

    // Try clicking the + Session button to create a new session
    if (!modalFound) {
      console.log('➕ Trying to create new session...');
      const addSessionBtn = page.locator('text=Session').first();
      if (await addSessionBtn.isVisible()) {
        await addSessionBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: './test-results/modal-05-add-session-clicked.png', fullPage: true });
        
        // Check for modal again
        for (const selector of modalSelectors) {
          try {
            const modal = page.locator(selector);
            if (await modal.isVisible()) {
              console.log(`✅ Found modal after add session: ${selector}`);
              modalFound = true;
              break;
            }
          } catch (e) {
            // Continue
          }
        }
      }
    }

    // Detailed form field analysis
    if (modalFound || true) { // Continue even if modal not clearly detected
      console.log('🎨 Analyzing form fields...');
      
      // Look for all form elements
      const allInputs = await page.locator('input, select, textarea').all();
      console.log(`Found ${allInputs.length} form elements`);
      
      for (let i = 0; i < allInputs.length; i++) {
        try {
          const element = allInputs[i];
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          const type = await element.getAttribute('type') || '';
          const placeholder = await element.getAttribute('placeholder') || '';
          const value = await element.inputValue().catch(() => '');
          
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              visibility: computed.visibility,
              display: computed.display,
              opacity: computed.opacity
            };
          });
          
          console.log(`Form element ${i + 1}:`);
          console.log(`  Tag: ${tagName}${type ? `[${type}]` : ''}`);
          console.log(`  Placeholder: "${placeholder}"`);
          console.log(`  Value: "${value}"`);
          console.log(`  Color: ${styles.color}`);
          console.log(`  Background: ${styles.backgroundColor}`);
          console.log(`  Font: ${styles.fontSize} ${styles.fontWeight}`);
          console.log(`  Visibility: ${styles.visibility}, Display: ${styles.display}, Opacity: ${styles.opacity}`);
          console.log('');
        } catch (error) {
          console.log(`Could not analyze element ${i + 1}: ${error.message}`);
        }
      }

      // Look for status buttons
      console.log('🔄 Looking for status buttons...');
      const statusTexts = [
        'ausstehend',
        'abgeschlossen', 
        'pending',
        'completed',
        'mark as',
        'markieren'
      ];

      for (const text of statusTexts) {
        const buttons = await page.locator(`text=/${text}/i`).all();
        console.log(`Found ${buttons.length} buttons with text "${text}"`);
        
        for (let i = 0; i < buttons.length; i++) {
          try {
            const buttonText = await buttons[i].textContent();
            const isVisible = await buttons[i].isVisible();
            console.log(`  Button ${i + 1}: "${buttonText}" (visible: ${isVisible})`);
          } catch (e) {
            // Continue
          }
        }
      }

      // Take screenshot of current state
      await page.screenshot({ path: './test-results/modal-06-form-analysis.png', fullPage: true });
    }

    // Check DOM structure for debugging
    console.log('🏗️ Checking DOM structure...');
    const bodyHTML = await page.locator('body').innerHTML();
    const hasModal = bodyHTML.includes('modal') || bodyHTML.includes('dialog');
    const hasForm = bodyHTML.includes('<form') || bodyHTML.includes('input') || bodyHTML.includes('select');
    
    console.log(`DOM contains modal-related elements: ${hasModal}`);
    console.log(`DOM contains form elements: ${hasForm}`);

    // Final comprehensive screenshot
    await page.screenshot({ path: './test-results/modal-07-final-state.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: './test-results/modal-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Detailed modal test completed');
  }
}

// Create test results directory
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results');
}

testSessionModal();