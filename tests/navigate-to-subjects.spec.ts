import { test, expect } from '@playwright/test';

test('Navigate to Subjects via Navigation', async ({ page }) => {
  console.log('🧭 Testing navigation to subjects page...');

  // Start from root page
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click on "Subjects" in navigation
  await page.click('text=Subjects');
  await page.waitForTimeout(2000);

  // Take screenshot of subjects page
  await page.screenshot({ 
    path: 'tmp/subjects-via-nav.png',
    fullPage: true 
  });

  // Check if we can find the Add Subject button
  const buttons = await page.$$eval('button', buttons => 
    buttons.map(btn => ({
      text: btn.textContent?.trim(),
      visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
    }))
  );

  console.log('🔘 Buttons found:', JSON.stringify(buttons, null, 2));

  // Try to click Add Subject if it exists
  try {
    await page.click('text=Add Subject', { timeout: 5000 });
    await page.waitForTimeout(1500);
    
    await page.screenshot({ 
      path: 'tmp/subject-form-modal.png',
      fullPage: true 
    });
    
    console.log('✅ Successfully opened Subject Form modal');
    
    // Now check the input field styles
    const inputAnalysis = await page.evaluate(() => {
      const nameInput = document.querySelector('input[id="name"]') as HTMLInputElement;
      if (nameInput) {
        const computed = window.getComputedStyle(nameInput);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor,
          visibility: computed.visibility,
          opacity: computed.opacity,
          placeholder: nameInput.placeholder
        };
      }
      return null;
    });
    
    console.log('🎨 Name Input Styles:', JSON.stringify(inputAnalysis, null, 2));
    
  } catch (error) {
    console.log('❌ Could not find or click Add Subject button:', error);
  }

  console.log('✅ Navigation test completed');
});