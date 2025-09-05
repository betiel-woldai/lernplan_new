import { test, expect } from '@playwright/test';

test.describe('Subjects Page Visibility Tests - Simple', () => {
  
  test('verify subjects page visibility fixes', async ({ page }) => {
    // Navigate to the subjects page
    await page.goto('http://localhost:3000/subjects');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tmp/subjects-visibility-test-initial.png', 
      fullPage: true 
    });

    console.log('Page loaded, taking screenshots and testing visibility...');

    // Test if we can find and click the Add Subject button
    const addButton = page.locator('button:has-text("Add Subject"), button:has-text("+"), button[aria-label*="add"]').first();
    
    if (await addButton.count() > 0) {
      console.log('Found Add Subject button, clicking it...');
      await addButton.click();
      await page.waitForTimeout(1500);
      
      // Take screenshot of modal
      await page.screenshot({ 
        path: 'tmp/subject-modal-opened.png', 
        fullPage: true 
      });

      // Test form inputs in modal
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[id*="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test Subject');
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: 'tmp/subject-name-input-filled.png', 
          fullPage: true 
        });

        const inputValue = await nameInput.inputValue();
        console.log('Subject name input value:', inputValue);
        expect(inputValue).toBe('Test Subject');
      }

      // Test date inputs
      const dateInputs = page.locator('input[type="date"]');
      const dateCount = await dateInputs.count();
      if (dateCount > 0) {
        await dateInputs.first().fill('2024-12-31');
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: 'tmp/date-input-filled.png', 
          fullPage: true 
        });
      }

      // Test number inputs
      const numberInputs = page.locator('input[type="number"]');
      const numberCount = await numberInputs.count();
      if (numberCount > 0) {
        await numberInputs.first().fill('10');
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: 'tmp/number-input-filled.png', 
          fullPage: true 
        });
      }

      // Final screenshot of all filled inputs
      await page.screenshot({ 
        path: 'tmp/all-inputs-filled-final.png', 
        fullPage: true 
      });

    } else {
      console.log('Add Subject button not found, taking screenshot of current page');
      await page.screenshot({ 
        path: 'tmp/no-add-button-found.png', 
        fullPage: true 
      });
    }

    // Test search functionality if available
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('mathematics');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'tmp/search-test.png', 
        fullPage: true 
      });
      
      const searchValue = await searchInput.inputValue();
      console.log('Search input value:', searchValue);
    }
  });

  test('test different screen sizes', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/subjects');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `tmp/responsive-${viewport.name}-${viewport.width}x${viewport.height}.png`, 
        fullPage: true 
      });

      console.log(`Screenshot taken for ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  });
});