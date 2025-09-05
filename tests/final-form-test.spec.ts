import { test, expect } from '@playwright/test';

test('Final Subject Form Test', async ({ page }) => {
  console.log('🎯 Final test of Subject Form...');

  await page.goto('http://localhost:3001/subjects');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  // Take screenshot to see current state
  await page.screenshot({ 
    path: 'tmp/before-clicking.png',
    fullPage: true 
  });

  // Try different button selectors
  const buttonSelectors = [
    'button:has-text("Add Subject")',
    'button:has-text("Add Your First Subject")',
    '[class*="bg-blue-600"]:has-text("Add")',
    'button[class*="bg-blue-600"]'
  ];

  let buttonFound = false;
  
  for (const selector of buttonSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        console.log(`✅ Found button with selector: ${selector}`);
        await page.click(selector, { timeout: 5000 });
        buttonFound = true;
        break;
      }
    } catch (error) {
      console.log(`❌ Button not found with selector: ${selector}`);
    }
  }

  if (buttonFound) {
    await page.waitForTimeout(2000);
    
    // Take screenshot of form
    await page.screenshot({ 
      path: 'tmp/form-modal-final.png',
      fullPage: true 
    });

    // Check for name input specifically
    const nameInputExists = await page.$('input[id="name"]');
    if (nameInputExists) {
      console.log('✅ Name input found!');
      
      // Get styles
      const styles = await page.evaluate(() => {
        const input = document.querySelector('input[id="name"]') as HTMLInputElement;
        if (input) {
          const computed = window.getComputedStyle(input);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            border: computed.border
          };
        }
        return null;
      });
      
      console.log('🎨 Name input styles:', JSON.stringify(styles, null, 2));
      
      // Test typing
      await page.fill('input[id="name"]', 'Test Subject Name');
      await page.waitForTimeout(500);
      
      const value = await page.inputValue('input[id="name"]');
      console.log('✍️ Input value:', value);
      
      await page.screenshot({ 
        path: 'tmp/form-with-typed-text.png',
        fullPage: true 
      });
      
    } else {
      console.log('❌ Name input not found in form');
    }
    
  } else {
    console.log('❌ No button found to open the form');
  }

  console.log('✅ Final form test completed');
});