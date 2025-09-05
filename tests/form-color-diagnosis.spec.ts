import { test, expect } from '@playwright/test';

test('Subject Form Color Diagnosis', async ({ page }) => {
  console.log('🔍 Diagnosing Subject Form input visibility issues...');

  await page.goto('http://localhost:3001/subjects');
  await page.waitForTimeout(2000);

  // Click the "Add Subject" button (should be visible on top right)
  await page.click('text=Add Subject');
  await page.waitForTimeout(1500);

  // Take screenshot of the opened modal
  await page.screenshot({ 
    path: 'tmp/form-modal-opened.png',
    fullPage: true 
  });

  // Get computed styles for name input field
  const inputAnalysis = await page.evaluate(() => {
    const nameInput = document.querySelector('input[id="name"]') as HTMLInputElement;
    if (nameInput) {
      const computed = window.getComputedStyle(nameInput);
      
      // Get placeholder pseudo-element styles
      let placeholderStyles = null;
      try {
        const placeholderEl = window.getComputedStyle(nameInput, '::placeholder');
        placeholderStyles = {
          color: placeholderEl.color,
          opacity: placeholderEl.opacity
        };
      } catch (e) {
        placeholderStyles = 'Unable to get placeholder styles';
      }
      
      return {
        element: 'name input',
        textColor: computed.color,
        backgroundColor: computed.backgroundColor,
        borderColor: computed.borderColor,
        borderWidth: computed.borderWidth,
        padding: computed.padding,
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
        visibility: computed.visibility,
        display: computed.display,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
        position: computed.position,
        placeholder: nameInput.placeholder,
        placeholderStyles: placeholderStyles,
        value: nameInput.value
      };
    }
    return { error: 'Name input not found' };
  });

  console.log('📊 Name Input Analysis:', JSON.stringify(inputAnalysis, null, 2));

  // Try to type in the input
  await page.fill('input[id="name"]', 'Test Mathematics Subject');
  await page.waitForTimeout(500);
  
  // Take screenshot after typing
  await page.screenshot({ 
    path: 'tmp/form-after-typing.png',
    fullPage: true 
  });

  // Check if the typed text is visible by getting the input value
  const inputValue = await page.inputValue('input[id="name"]');
  console.log('✍️ Input Value after typing:', inputValue);

  // Check all input fields for visibility issues
  const allInputsAnalysis = await page.evaluate(() => {
    const inputs = ['name', 'startDate', 'examDate', 'hoursPerWeek', 'daysPerWeek', 'intensityWeeks'];
    const results = [];
    
    for (const inputId of inputs) {
      const input = document.querySelector(`input[id="${inputId}"]`) as HTMLInputElement;
      if (input) {
        const computed = window.getComputedStyle(input);
        results.push({
          id: inputId,
          type: input.type,
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          visibility: computed.visibility,
          display: computed.display,
          opacity: computed.opacity,
          hasValue: input.value.length > 0,
          placeholder: input.placeholder
        });
      }
    }
    return results;
  });

  console.log('📋 All Inputs Analysis:', JSON.stringify(allInputsAnalysis, null, 2));

  console.log('✅ Form color diagnosis completed');
});