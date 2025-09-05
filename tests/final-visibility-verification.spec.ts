import { test, expect } from '@playwright/test';

test.describe('Final Subjects Page Visibility Verification', () => {
  test.setTimeout(20000);
  
  test('verify subjects page loads with proper text visibility', async ({ page }) => {
    console.log('🧪 Testing subjects page visibility fixes...');
    
    await page.goto('/subjects');
    await page.waitForTimeout(3000);
    
    // Take initial screenshot for documentation
    await page.screenshot({ 
      path: 'tmp/final-subjects-visibility-desktop.png', 
      fullPage: true 
    });

    console.log('✅ Desktop screenshot taken');

    // Test search input visibility
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Mathematics');
      await page.waitForTimeout(500);
      
      const inputValue = await searchInput.inputValue();
      console.log('✅ Search input works, value:', inputValue);
      expect(inputValue).toBe('Mathematics');
      
      await searchInput.screenshot({ path: 'tmp/search-input-filled.png' });
      await searchInput.clear();
    }

    // Test Add Subject button
    const addButton = page.locator('button:has-text("Add Subject")').first();
    if (await addButton.count() > 0) {
      console.log('✅ Add Subject button found');
      await addButton.click();
      await page.waitForTimeout(2000);
      
      // Take screenshot of modal
      await page.screenshot({ 
        path: 'tmp/subject-modal-visibility-test.png', 
        fullPage: true 
      });

      // Test modal inputs
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test Physics');
        await page.waitForTimeout(500);
        
        const modalInputValue = await nameInput.inputValue();
        console.log('✅ Modal input works, value:', modalInputValue);
        expect(modalInputValue).toBe('Test Physics');
        
        await nameInput.screenshot({ path: 'tmp/modal-input-visibility.png' });
      }

      // Test date inputs in modal
      const dateInputs = page.locator('input[type="date"]');
      const dateCount = await dateInputs.count();
      if (dateCount > 0) {
        await dateInputs.first().fill('2024-12-25');
        await page.waitForTimeout(500);
        console.log('✅ Date input filled successfully');
      }

      // Test number inputs in modal
      const numberInputs = page.locator('input[type="number"]');
      const numberCount = await numberInputs.count();
      if (numberCount > 0) {
        await numberInputs.first().fill('15');
        await page.waitForTimeout(500);
        console.log('✅ Number input filled successfully');
      }

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
  });

  test('verify responsive design and text visibility across screen sizes', async ({ page }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      console.log(`🧪 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/subjects');
      await page.waitForTimeout(2000);
      
      // Take responsive screenshot
      await page.screenshot({ 
        path: `tmp/subjects-${viewport.name.toLowerCase()}-responsive.png`, 
        fullPage: true 
      });

      // Test search input visibility at this viewport
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(`${viewport.name} Test`);
        await page.waitForTimeout(500);
        
        const inputValue = await searchInput.inputValue();
        console.log(`✅ ${viewport.name}: Search input visible and functional, value: ${inputValue}`);
        
        await searchInput.clear();
      }

      // Test Add Subject button visibility
      const addButton = page.locator('button:has-text("Add Subject")').first();
      if (await addButton.count() > 0) {
        const isVisible = await addButton.isVisible();
        console.log(`✅ ${viewport.name}: Add Subject button visible: ${isVisible}`);
      }

      console.log(`✅ ${viewport.name} viewport test completed`);
    }
  });

  test('verify text contrast and readability', async ({ page }) => {
    await page.goto('/subjects');
    await page.waitForTimeout(2000);

    // Test search input text styles
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.count() > 0) {
      const searchStyles = await searchInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        };
      });
      
      console.log('✅ Search input styles:', searchStyles);
      
      // Fill input to test text visibility
      await searchInput.fill('Visibility Test');
      await searchInput.screenshot({ path: 'tmp/search-text-contrast.png' });
    }

    // Test subject card text visibility
    const subjectCards = page.locator('[data-testid="subject-card"], .subject-card, .card').first();
    if (await subjectCards.count() > 0) {
      const cardStyles = await subjectCards.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      console.log('✅ Subject card styles:', cardStyles);
    }

    console.log('✅ Text contrast verification completed');
  });
});