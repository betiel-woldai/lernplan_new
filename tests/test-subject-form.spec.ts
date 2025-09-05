import { test, expect } from '@playwright/test';

test('Test Subject Form Input Visibility', async ({ page }) => {
  console.log('🎨 Testing Subject Form input field visibility...');

  // Navigate to subjects page
  await page.goto('http://localhost:3001/subjects');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Click "Add Subject" button
  await page.click('text=Add Subject');
  await page.waitForTimeout(1500);

  // Take screenshot of opened form
  await page.screenshot({ 
    path: 'tmp/subject-form-opened.png',
    fullPage: true 
  });

  // Analyze all input fields
  const inputAnalysis = await page.evaluate(() => {
    const inputs = ['name', 'startDate', 'examDate', 'hoursPerWeek', 'daysPerWeek', 'intensityWeeks'];
    const results = [];
    
    for (const inputId of inputs) {
      const input = document.querySelector(`input[id="${inputId}"]`) as HTMLInputElement;
      if (input) {
        const computed = window.getComputedStyle(input);
        results.push({
          id: inputId,
          type: input.type,
          textColor: computed.color,
          backgroundColor: computed.backgroundColor,
          borderColor: computed.borderColor,
          visibility: computed.visibility,
          display: computed.display,
          opacity: computed.opacity,
          fontSize: computed.fontSize,
          placeholder: input.placeholder,
          value: input.value
        });
      } else {
        results.push({ id: inputId, error: 'Input not found' });
      }
    }
    return results;
  });

  console.log('📋 Input Fields Analysis:');
  inputAnalysis.forEach(input => {
    console.log(`  ${input.id}:`, JSON.stringify(input, null, 4));
  });

  // Test typing in name field
  const nameInput = page.locator('input[id="name"]');
  await nameInput.fill('Mathematics');
  await page.waitForTimeout(500);
  
  const inputValue = await nameInput.inputValue();
  console.log('✍️ Typed value in name field:', inputValue);

  // Take screenshot after typing
  await page.screenshot({ 
    path: 'tmp/subject-form-after-typing.png',
    fullPage: true 
  });

  console.log('✅ Subject Form input visibility test completed');
});