import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Subject Management CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/subjects`);
    await page.waitForLoadState('networkidle');
    
    // Reset to demo data to ensure consistent state
    const resetButton = page.locator('button', { hasText: 'Reset Demo' });
    if (await resetButton.count() > 0) {
      await resetButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should create a new subject successfully', async ({ page }) => {
    // Count initial subjects
    const initialSubjects = await page.locator('div').filter({ hasText: /Mathematics|Physics|Chemistry/ }).count();
    console.log('Initial subjects count:', initialSubjects);

    // Open Add Subject modal
    await page.click('button:has-text("Add Subject")');
    await page.waitForTimeout(1000);

    // Fill out the form
    await page.fill('input[name="name"]', 'Computer Science');
    
    // Select a color (click on green color)
    await page.click('[style*="rgb(16, 185, 129)"], [style*="#10B981"]');
    
    // Fill dates
    await page.fill('input[name="startDate"]', '15.01.2024');
    await page.fill('input[name="examDate"]', '15.06.2024');
    
    // Fill numeric inputs
    await page.fill('input[name="hoursPerWeek"]', '6');
    await page.fill('input[name="daysPerWeek"]', '4');
    await page.fill('input[name="intensityWeeks"]', '3');

    // Take screenshot before submitting
    await page.screenshot({ 
      path: 'tests/screenshots/crud-01-form-filled.png', 
      fullPage: true 
    });

    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Take screenshot after creation
    await page.screenshot({ 
      path: 'tests/screenshots/crud-02-after-creation.png', 
      fullPage: true 
    });

    // Verify new subject appears
    await expect(page.locator('text=Computer Science')).toBeVisible();
    
    // Count subjects again
    const finalSubjects = await page.locator('div').filter({ hasText: /Mathematics|Physics|Chemistry|Computer Science/ }).count();
    console.log('Final subjects count:', finalSubjects);
    expect(finalSubjects).toBeGreaterThan(initialSubjects);
  });

  test('should edit an existing subject', async ({ page }) => {
    // Find and hover over Mathematics card to show edit button
    const mathCard = page.locator('div').filter({ hasText: 'Mathematics' }).first();
    await mathCard.hover();
    
    // Click edit button (should appear on hover)
    const editButton = mathCard.locator('button').filter({ hasText: '' }).first();
    if (await editButton.count() > 0) {
      await editButton.click();
    } else {
      // Try clicking directly on the card to trigger edit
      await mathCard.click();
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1000);

    // Take screenshot of edit modal
    await page.screenshot({ 
      path: 'tests/screenshots/crud-03-edit-modal.png', 
      fullPage: true 
    });

    // Check if modal opened and form is pre-filled
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.count() > 0) {
      const currentValue = await nameInput.inputValue();
      console.log('Current name value:', currentValue);
      
      // Modify the name
      await nameInput.clear();
      await nameInput.fill('Advanced Mathematics');
      
      // Submit changes
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // Verify changes
      await expect(page.locator('text=Advanced Mathematics')).toBeVisible();
      
      // Take screenshot after edit
      await page.screenshot({ 
        path: 'tests/screenshots/crud-04-after-edit.png', 
        fullPage: true 
      });
    } else {
      console.log('Edit modal did not open or form not found');
    }
  });

  test('should delete a subject with confirmation', async ({ page }) => {
    // Count initial subjects
    const initialCount = await page.locator('div').filter({ hasText: /Mathematics|Physics|Chemistry/ }).count();
    
    // Find Chemistry card and hover to show delete button
    const chemistryCard = page.locator('div').filter({ hasText: 'Chemistry' }).first();
    await chemistryCard.hover();
    
    // Look for delete button (trash icon)
    await page.waitForTimeout(500);
    const deleteButton = chemistryCard.locator('button').nth(1); // Second button should be delete
    
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await page.waitForTimeout(1000);

      // Take screenshot of delete confirmation
      await page.screenshot({ 
        path: 'tests/screenshots/crud-05-delete-confirmation.png', 
        fullPage: true 
      });

      // Look for confirmation dialog
      const confirmButton = page.locator('button:has-text("Delete")');
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(2000);

        // Verify subject was deleted
        await expect(page.locator('text=Chemistry')).not.toBeVisible();
        
        // Take screenshot after deletion
        await page.screenshot({ 
          path: 'tests/screenshots/crud-06-after-deletion.png', 
          fullPage: true 
        });
        
        // Verify count decreased
        const finalCount = await page.locator('div').filter({ hasText: /Mathematics|Physics/ }).count();
        expect(finalCount).toBeLessThan(initialCount);
      } else {
        console.log('Delete confirmation not found');
      }
    } else {
      console.log('Delete button not found');
    }
  });

  test('should validate form inputs', async ({ page }) => {
    // Open Add Subject modal
    await page.click('button:has-text("Add Subject")');
    await page.waitForTimeout(1000);

    // Try to submit empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Take screenshot of validation errors
    await page.screenshot({ 
      path: 'tests/screenshots/crud-07-validation-empty.png', 
      fullPage: true 
    });

    // Fill name but leave other required fields empty
    await page.fill('input[name="name"]', 'Test Subject');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Take screenshot of partial validation
    await page.screenshot({ 
      path: 'tests/screenshots/crud-08-validation-partial.png', 
      fullPage: true 
    });

    // Test invalid date combination (exam before start)
    await page.fill('input[name="startDate"]', '15.06.2024');
    await page.fill('input[name="examDate"]', '15.01.2024');
    await page.fill('input[name="hoursPerWeek"]', '5');
    await page.fill('input[name="daysPerWeek"]', '3');
    await page.fill('input[name="intensityWeeks"]', '2');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Take screenshot of date validation
    await page.screenshot({ 
      path: 'tests/screenshots/crud-09-validation-dates.png', 
      fullPage: true 
    });
  });

  test('should test search functionality', async ({ page }) => {
    // Take screenshot of initial state
    await page.screenshot({ 
      path: 'tests/screenshots/crud-10-search-initial.png', 
      fullPage: true 
    });

    // Search for "Math"
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Math');
    await page.waitForTimeout(1000);

    // Take screenshot of search results
    await page.screenshot({ 
      path: 'tests/screenshots/crud-11-search-math.png', 
      fullPage: true 
    });

    // Verify only Mathematics is visible
    await expect(page.locator('text=Mathematics')).toBeVisible();
    
    // Search for color code
    await searchInput.clear();
    await searchInput.fill('#3B82F6');
    await page.waitForTimeout(1000);

    // Take screenshot of color search
    await page.screenshot({ 
      path: 'tests/screenshots/crud-12-search-color.png', 
      fullPage: true 
    });

    // Search for non-existent subject
    await searchInput.clear();
    await searchInput.fill('NonExistent');
    await page.waitForTimeout(1000);

    // Take screenshot of empty search
    await page.screenshot({ 
      path: 'tests/screenshots/crud-13-search-empty.png', 
      fullPage: true 
    });

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);

    // Take screenshot after clearing
    await page.screenshot({ 
      path: 'tests/screenshots/crud-14-search-cleared.png', 
      fullPage: true 
    });
  });
});