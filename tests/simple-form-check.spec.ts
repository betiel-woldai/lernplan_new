import { test, expect } from '@playwright/test';

test('Simple Subject Form Color Check', async ({ page }) => {
  console.log('🎨 Checking Subject Form colors and visibility...');

  await page.goto('http://localhost:3001/subjects');
  await page.waitForTimeout(2000);

  // Click "Add Your First Subject" button
  await page.click('button:has-text("Add Your First Subject")');
  await page.waitForTimeout(1000);

  // Take screenshot of opened form
  await page.screenshot({ 
    path: 'tmp/form-opened.png',
    fullPage: true 
  });

  // Check input field styles
  const inputStyles = await page.evaluate(() => {
    const nameInput = document.querySelector('input[id="name"]') as HTMLInputElement;
    if (nameInput) {
      const computed = window.getComputedStyle(nameInput);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        borderColor: computed.borderColor,
        textColor: computed.getPropertyValue('color'),
        placeholderColor: computed.getPropertyValue('::placeholder'),
        visibility: computed.visibility,
        display: computed.display
      };
    }
    return null;
  });

  console.log('📊 Input Styles:', inputStyles);

  // Try to type and see if text appears
  const nameInput = page.locator('input[id="name"]');
  await nameInput.fill('Test Mathematics');
  await page.waitForTimeout(500);

  await page.screenshot({ 
    path: 'tmp/form-with-text.png',
    fullPage: true 
  });

  console.log('✅ Form check completed');
});