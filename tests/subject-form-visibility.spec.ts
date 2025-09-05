import { test, expect } from '@playwright/test';

test('Subject Form Visibility Check', async ({ page }) => {
  console.log('🔍 Testing Subject Form visibility issues...');

  // Navigate to subjects page
  await page.goto('http://localhost:3001/subjects');
  await page.waitForTimeout(2000);

  // Take screenshot of subjects page
  await page.screenshot({ 
    path: 'tmp/subject-form-01-subjects-page.png',
    fullPage: true 
  });

  // Click "Add New Subject" button to open form
  try {
    await page.click('button:has-text("Add New Subject")');
    await page.waitForTimeout(1000);

    // Take screenshot of the form modal
    await page.screenshot({ 
      path: 'tmp/subject-form-02-modal-open.png',
      fullPage: true 
    });

    // Check input field visibility by taking focused screenshots
    const nameInput = page.locator('input[id="name"]');
    const startDateInput = page.locator('input[id="startDate"]');
    const examDateInput = page.locator('input[id="examDate"]');
    const hoursInput = page.locator('input[id="hoursPerWeek"]');

    // Test input focus and visibility
    await nameInput.focus();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'tmp/subject-form-03-name-input-focused.png',
      fullPage: true 
    });

    // Try typing in the name input
    await nameInput.type('Test Subject');
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'tmp/subject-form-04-name-input-typed.png',
      fullPage: true 
    });

    // Check computed styles of input fields
    const nameInputStyles = await page.evaluate(() => {
      const input = document.querySelector('input[id="name"]') as HTMLInputElement;
      if (input) {
        const styles = window.getComputedStyle(input);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          border: styles.border,
          visibility: styles.visibility,
          display: styles.display,
          opacity: styles.opacity,
          fontSize: styles.fontSize,
          padding: styles.padding
        };
      }
      return null;
    });

    console.log('🎨 Name Input Computed Styles:', nameInputStyles);

    // Check if input has value
    const inputValue = await nameInput.inputValue();
    console.log('📝 Input Value:', inputValue);

  } catch (error) {
    console.log('❌ Could not find Add New Subject button, checking if form is already visible');
    await page.screenshot({ 
      path: 'tmp/subject-form-error-no-button.png',
      fullPage: true 
    });
  }

  console.log('✅ Subject Form visibility check completed!');
});