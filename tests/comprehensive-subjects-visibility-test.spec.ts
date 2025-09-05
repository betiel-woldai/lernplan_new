import { test, expect } from '@playwright/test';

test.describe('Subjects Page Visibility and Functionality Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the subjects page
    await page.goto('http://localhost:3000/subjects');
    await page.waitForLoadState('networkidle');
  });

  test('should display subjects page with visible text in all input fields', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ 
      path: 'tmp/subjects-page-initial.png', 
      fullPage: true 
    });

    // Check that the page loads properly
    await expect(page).toHaveTitle(/Subjects/i);
    
    // Check for search input visibility
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[name="search"]').first();
    if (await searchInput.count() > 0) {
      // Check computed styles for text visibility
      const searchStyles = await searchInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          opacity: styles.opacity,
          visibility: styles.visibility
        };
      });
      console.log('Search input styles:', searchStyles);
      
      // Take screenshot of search area
      await searchInput.screenshot({ path: 'tmp/search-input-visibility.png' });
    }

    // Check for any other visible input fields on the main page
    const allInputs = page.locator('input[type="text"], input[type="search"], textarea');
    const inputCount = await allInputs.count();
    console.log(`Found ${inputCount} input fields on subjects page`);
    
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const inputStyles = await input.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          placeholder: el.getAttribute('placeholder') || 'no placeholder'
        };
      });
      console.log(`Input ${i + 1} styles:`, inputStyles);
    }
  });

  test('should open Subject Form modal and test input visibility', async ({ page }) => {
    // Look for "Add Subject" button
    const addButton = page.locator('button', { hasText: /add subject/i }).or(
      page.locator('button[aria-label*="add"]')
    ).or(
      page.locator('button:has-text("+")')
    ).first();

    if (await addButton.count() > 0) {
      await addButton.screenshot({ path: 'tmp/add-subject-button.png' });
      await addButton.click();
      
      // Wait for modal to appear
      await page.waitForTimeout(1000);
      
      // Take screenshot of opened modal
      await page.screenshot({ 
        path: 'tmp/subject-form-modal-open.png', 
        fullPage: true 
      });

      // Test Subject Name field
      const subjectNameField = page.locator('input[name="name"], input[placeholder*="name"], input[id*="name"]').first();
      if (await subjectNameField.count() > 0) {
        await subjectNameField.fill('Test Subject Name');
        await page.waitForTimeout(500);
        
        const nameStyles = await subjectNameField.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            value: (el as HTMLInputElement).value
          };
        });
        console.log('Subject name field styles and value:', nameStyles);
        
        await subjectNameField.screenshot({ path: 'tmp/subject-name-filled.png' });
        expect(nameStyles.value).toBe('Test Subject Name');
      }

      // Test Date fields
      const dateFields = page.locator('input[type="date"], input[placeholder*="date"]');
      const dateCount = await dateFields.count();
      for (let i = 0; i < dateCount; i++) {
        const dateField = dateFields.nth(i);
        await dateField.fill('2024-12-31');
        await page.waitForTimeout(300);
        
        const dateStyles = await dateField.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            value: (el as HTMLInputElement).value
          };
        });
        console.log(`Date field ${i + 1} styles and value:`, dateStyles);
      }

      // Test Number fields
      const numberFields = page.locator('input[type="number"]');
      const numberCount = await numberFields.count();
      for (let i = 0; i < numberCount; i++) {
        const numberField = numberFields.nth(i);
        await numberField.fill('123');
        await page.waitForTimeout(300);
        
        const numberStyles = await numberField.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            value: (el as HTMLInputElement).value
          };
        });
        console.log(`Number field ${i + 1} styles and value:`, numberStyles);
      }

      // Take final screenshot of filled form
      await page.screenshot({ 
        path: 'tmp/subject-form-all-fields-filled.png', 
        fullPage: true 
      });

    } else {
      console.log('Add Subject button not found');
      // Take screenshot to see what's available
      await page.screenshot({ 
        path: 'tmp/subjects-page-no-add-button.png', 
        fullPage: true 
      });
    }
  });

  test('should test search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"], input[name="search"]').first();
    
    if (await searchInput.count() > 0) {
      // Test typing in search field
      await searchInput.fill('mathematics');
      await page.waitForTimeout(500);
      
      const searchValue = await searchInput.inputValue();
      console.log('Search input value:', searchValue);
      expect(searchValue).toBe('mathematics');
      
      // Check search input visibility
      const searchStyles = await searchInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          value: (el as HTMLInputElement).value
        };
      });
      console.log('Search input styles and value:', searchStyles);
      
      await page.screenshot({ 
        path: 'tmp/search-functionality-test.png', 
        fullPage: true 
      });
    } else {
      console.log('Search input not found on subjects page');
    }
  });

  test('should test responsiveness across different screen sizes', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Take screenshot at this viewport size
      await page.screenshot({ 
        path: `tmp/subjects-${viewport.name}-${viewport.width}x${viewport.height}.png`, 
        fullPage: true 
      });

      // Test input visibility at this screen size
      const inputs = page.locator('input[type="text"], input[type="search"], textarea');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i);
          const styles = await input.evaluate((el) => {
            const styles = window.getComputedStyle(el);
            return {
              color: styles.color,
              backgroundColor: styles.backgroundColor,
              display: styles.display,
              visibility: styles.visibility
            };
          });
          console.log(`${viewport.name} - Input ${i + 1} styles:`, styles);
        }
      }

      // Try to open modal if Add button is available
      const addButton = page.locator('button', { hasText: /add subject/i }).or(
        page.locator('button[aria-label*="add"]')
      ).or(
        page.locator('button:has-text("+")')
      ).first();

      if (await addButton.count() > 0) {
        await addButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
          path: `tmp/modal-${viewport.name}-${viewport.width}x${viewport.height}.png`, 
          fullPage: true 
        });
        
        // Close modal by pressing Escape or clicking close button
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
  });

  test('should capture console logs for debugging', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    // Reload page to capture any console messages
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Try to interact with elements to trigger any console messages
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      await inputs.first().click();
      await inputs.first().fill('test console logging');
      await page.waitForTimeout(1000);
    }

    console.log('Captured console logs:');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}: ${log}`);
    });

    // Save console logs to file
    const fs = require('fs');
    fs.writeFileSync('tmp/console-logs.json', JSON.stringify(consoleLogs, null, 2));
  });
});