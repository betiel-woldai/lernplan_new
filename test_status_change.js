const { chromium } = require('playwright');

async function testStatusChange() {
  console.log('🔄 Starting status change test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: './test-results/status-01-homepage.png', fullPage: true });

    // Click on a math session to open modal
    console.log('📝 Opening session modal...');
    const mathSession = page.locator('text=Mathe').first();
    await mathSession.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: './test-results/status-02-modal-opened.png', fullPage: true });

    // Test 1: Font Color Visibility Analysis
    console.log('🎨 Analyzing font colors in modal...');
    
    // Get all form elements and their styles
    const formElements = await page.locator('input, select, textarea').all();
    const fontAnalysis = [];
    
    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i];
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          tag: el.tagName.toLowerCase(),
          type: el.type || '',
          value: el.value || '',
          placeholder: el.placeholder || ''
        };
      });
      fontAnalysis.push(styles);
    }

    console.log('📊 Font Analysis Results:');
    fontAnalysis.forEach((style, index) => {
      console.log(`Element ${index + 1} (${style.tag}${style.type ? `[${style.type}]` : ''}):`);
      console.log(`  Color: ${style.color}`);
      console.log(`  Background: ${style.backgroundColor}`);
      console.log(`  Font: ${style.fontSize} ${style.fontWeight}`);
      console.log(`  Value: "${style.value}"`);
      console.log(`  Placeholder: "${style.placeholder}"`);
      
      // Check if color is visible (not white or transparent)
      const isVisible = !style.color.includes('255, 255, 255') && 
                       !style.color.includes('rgba(255, 255, 255') &&
                       style.color !== 'rgb(255, 255, 255)';
      console.log(`  ✅ Text is visible: ${isVisible}`);
      console.log('');
    });

    // Test 2: Current Status Detection
    console.log('🔍 Detecting current session status...');
    
    const statusElement = page.locator('text=/Status:|Abgeschlossen|Ausstehend|Completed|Pending/i');
    const statusText = await statusElement.textContent().catch(() => 'Not found');
    console.log(`Current status display: "${statusText}"`);
    
    // Look for status indicator
    const statusIndicator = page.locator('.text-green-600, .text-yellow-600, .text-red-600');
    const indicatorText = await statusIndicator.textContent().catch(() => 'No indicator');
    console.log(`Status indicator: "${indicatorText}"`);

    // Test 3: Status Change Button Test
    console.log('🔄 Testing status change functionality...');
    
    // Look for the status change button
    const statusButton = page.locator('text=/als ausstehend markieren|als abgeschlossen markieren/i').first();
    const buttonExists = await statusButton.isVisible().catch(() => false);
    console.log(`Status change button exists: ${buttonExists}`);
    
    if (buttonExists) {
      const buttonText = await statusButton.textContent();
      console.log(`Button text: "${buttonText}"`);
      
      // Take screenshot before status change
      await page.screenshot({ path: './test-results/status-03-before-change.png', fullPage: true });
      
      // Click the status change button
      console.log('🖱️ Clicking status change button...');
      await statusButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot after status change
      await page.screenshot({ path: './test-results/status-04-after-change.png', fullPage: true });
      
      // Check if status changed
      const newStatusText = await statusElement.textContent().catch(() => 'Not found');
      const newIndicatorText = await statusIndicator.textContent().catch(() => 'No indicator');
      
      console.log(`New status display: "${newStatusText}"`);
      console.log(`New status indicator: "${newIndicatorText}"`);
      
      // Check if button text changed
      const newButtonText = await statusButton.textContent().catch(() => 'Button gone');
      console.log(`New button text: "${newButtonText}"`);
    }

    // Test 4: Save and Check Calendar Update
    console.log('💾 Testing save and calendar update...');
    
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Speichern")').first();
    const saveExists = await saveButton.isVisible().catch(() => false);
    
    if (saveExists) {
      await saveButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: './test-results/status-05-after-save-calendar.png', fullPage: true });
      
      // Check if calendar updated - look for color changes
      const calendarSessions = await page.locator('text=Mathe').all();
      console.log(`Found ${calendarSessions.length} math sessions in calendar`);
      
      // Get styles of calendar sessions to check colors
      for (let i = 0; i < Math.min(calendarSessions.length, 3); i++) {
        const sessionStyles = await calendarSessions[i].evaluate((el) => {
          const computed = window.getComputedStyle(el.closest('.calendar-event, .session-item, [class*="session"]') || el);
          return {
            backgroundColor: computed.backgroundColor,
            borderColor: computed.borderColor,
            color: computed.color
          };
        });
        console.log(`Calendar session ${i + 1} styles:`, sessionStyles);
      }
    } else {
      // Try to close modal with X button
      const closeButton = page.locator('button:has-text("×"), .close, [aria-label="Close"]').first();
      const closeExists = await closeButton.isVisible().catch(() => false);
      
      if (closeExists) {
        await closeButton.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: './test-results/status-05-modal-closed.png', fullPage: true });
      }
    }

    // Test 5: Duration and XP Analysis
    console.log('📊 Analyzing duration and XP calculations...');
    
    // Look for XP display in modal or sidebar
    const xpElements = await page.locator('text=/XP|exp/i').all();
    for (let i = 0; i < xpElements.length; i++) {
      const xpText = await xpElements[i].textContent();
      console.log(`XP element ${i + 1}: "${xpText}"`);
    }
    
    // Check sidebar statistics
    const statsElements = await page.locator('.stats, [class*="stat"], [class*="progress"]').all();
    console.log(`Found ${statsElements.length} statistics elements`);

    // Final comprehensive screenshot
    await page.screenshot({ path: './test-results/status-06-final-analysis.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: './test-results/status-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('✅ Status change test completed');
  }
}

const fs = require('fs');
if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results');
}

testStatusChange();