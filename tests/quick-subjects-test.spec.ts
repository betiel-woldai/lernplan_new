import { test, expect } from '@playwright/test';

test.describe('Quick Subjects Page Test', () => {
  test.setTimeout(15000); // 15 second timeout
  
  test('quick subjects page visibility check', async ({ page }) => {
    console.log('Navigating to subjects page...');
    
    try {
      await page.goto('/subjects', { timeout: 10000 });
    } catch (error) {
      console.log('Navigation error:', error);
      await page.screenshot({ path: 'tmp/navigation-error.png', fullPage: true });
      throw error;
    }
    
    // Wait a bit for page to load
    await page.waitForTimeout(2000);
    
    console.log('Taking initial screenshot...');
    await page.screenshot({ 
      path: 'tmp/subjects-initial-quick.png', 
      fullPage: true 
    });

    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if page has basic content
    const hasContent = await page.locator('body').textContent();
    console.log('Page has text content:', hasContent ? hasContent.substring(0, 100) + '...' : 'No content');
    
    // Look for any buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons on page`);
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const buttonText = await button.textContent();
        console.log(`Button ${i + 1}: "${buttonText}"`);
      }
    }
    
    // Look for input fields
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} input fields`);
    
    if (inputCount > 0) {
      await inputs.first().screenshot({ path: 'tmp/first-input-field.png' });
    }
    
    console.log('Test completed successfully');
  });

  test('test form interaction if available', async ({ page }) => {
    await page.goto('/subjects', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Look for Add Subject button with various selectors
    const addButton = page.locator('button:has-text("Add"), button:has-text("+"), button[aria-label*="add"], button[title*="add"]').first();
    
    const addButtonExists = await addButton.count() > 0;
    console.log('Add button exists:', addButtonExists);
    
    if (addButtonExists) {
      console.log('Clicking add button...');
      await addButton.click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ 
        path: 'tmp/after-add-button-click.png', 
        fullPage: true 
      });
      
      // Look for any modal or form
      const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first();
      const modalExists = await modal.count() > 0;
      
      if (modalExists) {
        console.log('Modal detected, testing inputs...');
        
        const modalInputs = modal.locator('input');
        const modalInputCount = await modalInputs.count();
        console.log(`Found ${modalInputCount} inputs in modal`);
        
        if (modalInputCount > 0) {
          const firstInput = modalInputs.first();
          await firstInput.fill('Test Subject');
          await page.waitForTimeout(500);
          
          await firstInput.screenshot({ path: 'tmp/modal-input-filled.png' });
          
          const inputValue = await firstInput.inputValue();
          console.log('Input value after typing:', inputValue);
          
          expect(inputValue).toBe('Test Subject');
        }
      }
    } else {
      console.log('No add button found');
      await page.screenshot({ 
        path: 'tmp/no-add-button-found.png', 
        fullPage: true 
      });
    }
  });
});