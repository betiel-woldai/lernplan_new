const { chromium } = require('playwright');

async function testSessionDialog() {
  console.log('🚀 Starting session dialog tests...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
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
    await page.screenshot({ path: './test-results/01-homepage.png' });

    // Navigate to calendar view
    console.log('📅 Looking for calendar or sessions...');
    
    // Try to find calendar or sessions link
    const possibleSelectors = [
      'a[href*="calendar"]',
      'a[href*="sessions"]', 
      'text=Calendar',
      'text=Kalender',
      'text=Sessions',
      '[data-testid="calendar-link"]',
      '[data-testid="sessions-link"]'
    ];

    let calendarFound = false;
    for (const selector of possibleSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found navigation element: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          calendarFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!calendarFound) {
      // Try looking for any buttons or links that might lead to sessions
      console.log('🔍 Searching for session-related elements...');
      await page.screenshot({ path: './test-results/02-homepage-full.png' });
      
      // Check for any session-related text or buttons
      const sessionElements = await page.locator('text=/session|kalender|calendar/i').all();
      if (sessionElements.length > 0) {
        console.log(`Found ${sessionElements.length} session-related elements`);
        await sessionElements[0].click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: './test-results/03-after-navigation.png' });

    // Look for existing sessions or add session button
    console.log('🔍 Looking for sessions or add session functionality...');
    
    const addSessionSelectors = [
      'button:has-text("Session hinzufügen")',
      'button:has-text("Add Session")',
      'button:has-text("Neue Session")',
      '[data-testid="add-session"]',
      'text=/add.*session/i',
      'text=/session.*add/i',
      'text=/neue.*session/i',
      'button[class*="add"]'
    ];

    let addButtonFound = false;
    for (const selector of addSessionSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found add session button: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          addButtonFound = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // Look for existing sessions to edit
    if (!addButtonFound) {
      console.log('🔍 Looking for existing sessions to edit...');
      const sessionSelectors = [
        '.session-item',
        '[data-testid="session"]',
        '.calendar-event',
        '.session-card',
        'text=/edit|bearbeiten/i'
      ];

      for (const selector of sessionSelectors) {
        try {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            console.log(`✅ Found ${elements.length} session elements: ${selector}`);
            await elements[0].click();
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    await page.screenshot({ path: './test-results/04-session-modal-opened.png' });

    // Test 1: Font Color Visibility
    console.log('🎨 Testing font color visibility...');
    
    const formFieldSelectors = [
      'select', // subject dropdown
      'input[type="date"]', // date input
      'input[type="number"]', // duration input
      'input[type="time"]', // time input
      'textarea', // notes textarea
      '.form-control',
      '.input'
    ];

    const formFields = [];
    for (const selector of formFieldSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        if (await element.isVisible()) {
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              visibility: computed.visibility,
              display: computed.display
            };
          });
          formFields.push({
            selector,
            styles,
            placeholder: await element.getAttribute('placeholder') || '',
            value: await element.inputValue().catch(() => '')
          });
        }
      }
    }

    console.log('📋 Form field analysis:');
    formFields.forEach((field, index) => {
      console.log(`Field ${index + 1}:`);
      console.log(`  Selector: ${field.selector}`);
      console.log(`  Color: ${field.styles.color}`);
      console.log(`  Background: ${field.styles.backgroundColor}`);
      console.log(`  Font Size: ${field.styles.fontSize}`);
      console.log(`  Placeholder: ${field.placeholder}`);
      console.log(`  Value: ${field.value}`);
      console.log('');
    });

    // Test 2: Status Change Functionality
    console.log('🔄 Testing status change functionality...');
    
    const statusButtons = [
      'button:has-text("als ausstehend markieren")',
      'button:has-text("als abgeschlossen markieren")', 
      'button:has-text("Mark as Pending")',
      'button:has-text("Mark as Completed")',
      'text=/mark.*pending/i',
      'text=/mark.*completed/i',
      'text=/ausstehend/i',
      'text=/abgeschlossen/i'
    ];

    let statusButton = null;
    for (const selector of statusButtons) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          statusButton = element;
          console.log(`✅ Found status button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (statusButton) {
      await page.screenshot({ path: './test-results/05-before-status-change.png' });
      await statusButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: './test-results/06-after-status-change.png' });
    }

    // Test 3: Check for modal close and calendar update
    console.log('💾 Testing save/close functionality...');
    
    const saveButtons = [
      'button:has-text("Save")',
      'button:has-text("Speichern")',
      'button:has-text("Update")',
      'button:has-text("Aktualisieren")',
      '[data-testid="save-button"]'
    ];

    for (const selector of saveButtons) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found save button: ${selector}`);
          await element.click();
          await page.waitForTimeout(3000);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    await page.screenshot({ path: './test-results/07-after-save-calendar-view.png' });

    // Check console for any errors
    console.log('🔍 Checking browser console...');
    const logs = [];
    page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // Wait a bit more to capture any console messages
    await page.waitForTimeout(2000);
    
    console.log('📊 Browser console messages:');
    logs.forEach(log => {
      console.log(`${log.type.toUpperCase()}: ${log.text}`);
      if (log.location) {
        console.log(`  Location: ${log.location.url}:${log.location.lineNumber}`);
      }
    });

    // Final screenshot of the application state
    await page.screenshot({ path: './test-results/08-final-state.png' });

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: './test-results/error-screenshot.png' });
  } finally {
    await browser.close();
    console.log('✅ Test completed');
  }
}

// Create test results directory
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results');
}

testSessionDialog();