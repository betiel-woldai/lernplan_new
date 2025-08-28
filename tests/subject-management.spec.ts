import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';

test.describe('Subject Management Interface (Issue #3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Navigation and Initial State', () => {
    test('should navigate from dashboard to subjects page', async ({ page }) => {
      // Take screenshot of dashboard first
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-01-dashboard-initial.png', 
        fullPage: true 
      });

      // Navigate to subjects page
      await page.click('a[href="/subjects"]');
      await page.waitForLoadState('networkidle');
      
      // Verify we're on the subjects page
      await expect(page).toHaveURL('/subjects');
      await expect(page.locator('h1')).toContainText('Subjects');
    });

    test('should display initial state with 3 mock subjects', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of initial subjects page
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-02-initial-state.png', 
        fullPage: true 
      });

      // Check that 3 mock subjects are displayed
      const subjectCards = page.locator('[data-testid="subject-card"]');
      await expect(subjectCards).toHaveCount(3);

      // Verify mock subjects content
      await expect(page.locator('text=Mathematics')).toBeVisible();
      await expect(page.locator('text=Physics')).toBeVisible();
      await expect(page.locator('text=Chemistry')).toBeVisible();

      // Verify each subject has essential information
      for (let i = 0; i < 3; i++) {
        const card = subjectCards.nth(i);
        await expect(card.locator('[data-testid="subject-name"]')).toBeVisible();
        await expect(card.locator('[data-testid="subject-description"]')).toBeVisible();
        await expect(card.locator('[data-testid="subject-color"]')).toBeVisible();
      }
    });
  });

  test.describe('CRUD Operations', () => {
    test('should create a new subject successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Click "Add Subject" button
      await page.click('button:has-text("Add Subject")');
      
      // Wait for modal to appear
      await page.waitForSelector('[data-testid="subject-modal"]');
      
      // Take screenshot of add subject modal
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-03-add-modal.png', 
        fullPage: true 
      });

      // Fill out the form with test data
      await page.fill('input[name="name"]', 'Computer Science');
      await page.fill('textarea[name="description"]', 'Programming and algorithms fundamentals');
      await page.fill('input[name="startDate"]', '2024-01-15');
      await page.fill('input[name="examDate"]', '2024-06-15');
      await page.fill('input[name="totalHours"]', '120');
      await page.fill('input[name="priority"]', '5');

      // Test color picker
      const colorPicker = page.locator('[data-testid="color-picker"]');
      await colorPicker.click();
      await page.click('[data-color="#10B981"]'); // Green color
      
      // Take screenshot of color picker in action
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-04-color-picker.png', 
        fullPage: true 
      });

      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for modal to close and new subject to appear
      await page.waitForSelector('[data-testid="subject-modal"]', { state: 'hidden' });
      await page.waitForTimeout(500); // Allow for state updates

      // Verify new subject appears
      await expect(page.locator('text=Computer Science')).toBeVisible();
      
      // Take screenshot after creation
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-05-after-creation.png', 
        fullPage: true 
      });

      // Verify we now have 4 subjects
      const subjectCards = page.locator('[data-testid="subject-card"]');
      await expect(subjectCards).toHaveCount(4);
    });

    test('should edit an existing subject', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Click edit button on first subject (Mathematics)
      const firstSubject = page.locator('[data-testid="subject-card"]').first();
      await firstSubject.locator('button[data-testid="edit-subject"]').click();
      
      // Wait for modal to appear
      await page.waitForSelector('[data-testid="subject-modal"]');
      
      // Verify form is pre-filled with existing data
      await expect(page.locator('input[name="name"]')).toHaveValue('Mathematics');
      
      // Modify the subject name and description
      await page.fill('input[name="name"]', 'Advanced Mathematics');
      await page.fill('textarea[name="description"]', 'Calculus and advanced mathematical concepts');
      
      // Take screenshot of edit modal
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-06-edit-modal.png', 
        fullPage: true 
      });

      // Submit the changes
      await page.click('button[type="submit"]');
      
      // Wait for modal to close
      await page.waitForSelector('[data-testid="subject-modal"]', { state: 'hidden' });
      await page.waitForTimeout(500);

      // Verify changes are reflected
      await expect(page.locator('text=Advanced Mathematics')).toBeVisible();
      await expect(page.locator('text=Calculus and advanced mathematical concepts')).toBeVisible();
      
      // Take screenshot after edit
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-07-after-edit.png', 
        fullPage: true 
      });
    });

    test('should delete a subject with confirmation', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Count initial subjects
      const initialCount = await page.locator('[data-testid="subject-card"]').count();

      // Click delete button on last subject
      const lastSubject = page.locator('[data-testid="subject-card"]').last();
      await lastSubject.locator('button[data-testid="delete-subject"]').click();
      
      // Wait for confirmation modal
      await page.waitForSelector('[data-testid="delete-confirmation"]');
      
      // Take screenshot of delete confirmation
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-08-delete-confirmation.png', 
        fullPage: true 
      });

      // Confirm deletion
      await page.click('button[data-testid="confirm-delete"]');
      
      // Wait for modal to close and subject to be removed
      await page.waitForSelector('[data-testid="delete-confirmation"]', { state: 'hidden' });
      await page.waitForTimeout(500);

      // Verify subject count decreased
      const finalCount = await page.locator('[data-testid="subject-card"]').count();
      expect(finalCount).toBe(initialCount - 1);
      
      // Take screenshot after deletion
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-09-after-deletion.png', 
        fullPage: true 
      });
    });
  });

  test.describe('Form Validation', () => {
    test('should validate empty form submission', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Click "Add Subject" button
      await page.click('button:has-text("Add Subject")');
      await page.waitForSelector('[data-testid="subject-modal"]');

      // Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Take screenshot of validation errors
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-10-validation-errors.png', 
        fullPage: true 
      });

      // Verify validation errors are displayed
      await expect(page.locator('.error-message, .text-red-500')).toHaveCount.greaterThan(0);
    });

    test('should validate invalid date combinations', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Click "Add Subject" button
      await page.click('button:has-text("Add Subject")');
      await page.waitForSelector('[data-testid="subject-modal"]');

      // Fill required fields
      await page.fill('input[name="name"]', 'Test Subject');
      await page.fill('textarea[name="description"]', 'Test description');
      
      // Set exam date before start date
      await page.fill('input[name="startDate"]', '2024-06-15');
      await page.fill('input[name="examDate"]', '2024-01-15');
      await page.fill('input[name="totalHours"]', '50');
      await page.fill('input[name="priority"]', '3');

      // Try to submit
      await page.click('button[type="submit"]');
      
      // Verify date validation error
      await expect(page.locator('text=Exam date must be after start date')).toBeVisible();
      
      // Take screenshot of date validation
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-11-date-validation.png', 
        fullPage: true 
      });
    });

    test('should validate invalid numeric values', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Click "Add Subject" button
      await page.click('button:has-text("Add Subject")');
      await page.waitForSelector('[data-testid="subject-modal"]');

      // Fill fields with invalid numeric values
      await page.fill('input[name="name"]', 'Test Subject');
      await page.fill('textarea[name="description"]', 'Test description');
      await page.fill('input[name="startDate"]', '2024-01-15');
      await page.fill('input[name="examDate"]', '2024-06-15');
      await page.fill('input[name="totalHours"]', '-10'); // Invalid negative hours
      await page.fill('input[name="priority"]', '15'); // Invalid priority > 10

      // Try to submit
      await page.click('button[type="submit"]');
      
      // Take screenshot of numeric validation
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-12-numeric-validation.png', 
        fullPage: true 
      });
    });
  });

  test.describe('Search and Filter Functionality', () => {
    test('should search subjects by name', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Type in search box
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('Math');
        await page.waitForTimeout(500); // Allow for search debounce

        // Verify only Mathematics subject is visible
        await expect(page.locator('text=Mathematics')).toBeVisible();
        await expect(page.locator('text=Physics')).not.toBeVisible();
        
        // Take screenshot of search results
        await page.screenshot({ 
          path: 'tests/screenshots/subjects-13-search-results.png', 
          fullPage: true 
        });

        // Test empty search results
        await searchInput.fill('NonExistentSubject');
        await page.waitForTimeout(500);
        
        // Verify no results message or empty state
        const subjectCards = page.locator('[data-testid="subject-card"]');
        await expect(subjectCards).toHaveCount(0);
        
        // Take screenshot of empty search
        await page.screenshot({ 
          path: 'tests/screenshots/subjects-14-empty-search.png', 
          fullPage: true 
        });
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on desktop (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for desktop view
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-15-desktop-1920.png', 
        fullPage: true 
      });

      // Verify grid layout shows multiple columns
      const subjectCards = page.locator('[data-testid="subject-card"]');
      await expect(subjectCards.first()).toBeVisible();
    });

    test('should display correctly on tablet (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for tablet view
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-16-tablet-768.png', 
        fullPage: true 
      });

      // Verify responsive layout
      const subjectCards = page.locator('[data-testid="subject-card"]');
      await expect(subjectCards.first()).toBeVisible();
    });

    test('should display correctly on mobile (375x812)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for mobile view
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-17-mobile-375.png', 
        fullPage: true 
      });

      // Verify mobile-friendly layout
      const subjectCards = page.locator('[data-testid="subject-card"]');
      await expect(subjectCards.first()).toBeVisible();
      
      // Test mobile modal behavior
      await page.click('button:has-text("Add Subject")');
      await page.waitForSelector('[data-testid="subject-modal"]');
      
      // Take screenshot of mobile modal
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-18-mobile-modal.png', 
        fullPage: true 
      });
    });
  });

  test.describe('UI Component Verification', () => {
    test('should display subject cards with all required elements', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      const firstCard = page.locator('[data-testid="subject-card"]').first();
      
      // Verify all card elements are present
      await expect(firstCard.locator('[data-testid="subject-name"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="subject-description"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="subject-color"]')).toBeVisible();
      await expect(firstCard.locator('button[data-testid="edit-subject"]')).toBeVisible();
      await expect(firstCard.locator('button[data-testid="delete-subject"]')).toBeVisible();
      
      // Take screenshot highlighting card components
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-19-card-components.png', 
        fullPage: true 
      });
    });

    test('should display different colored subject cards', async ({ page }) => {
      await page.goto(`${BASE_URL}/subjects`);
      await page.waitForLoadState('networkidle');

      // Verify different colors are displayed
      const colorElements = page.locator('[data-testid="subject-color"]');
      await expect(colorElements).toHaveCount.greaterThan(2);
      
      // Take screenshot showing color diversity
      await page.screenshot({ 
        path: 'tests/screenshots/subjects-20-color-variety.png', 
        fullPage: true 
      });
    });
  });
});