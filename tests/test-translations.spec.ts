import { test, expect } from '@playwright/test';

test.describe('SubjectForm Translation Tests', () => {
  test('should display SubjectForm in German by default', async ({ page }) => {
    console.log('🌐 Testing SubjectForm translations in German...');
    
    await page.goto('http://localhost:3002/subjects', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on "Add Subject" button
    const addButton = page.locator('button').filter({ hasText: 'Fach hinzufügen' });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    await page.waitForTimeout(1000);
    
    // Take screenshot of form in German
    await page.screenshot({ path: 'tmp/subject-form-german.png', fullPage: true });
    
    // Check German form labels
    await expect(page.locator('label').filter({ hasText: 'Fachname' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Fachfarbe' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Startdatum' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Prüfungsdatum' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Stunden pro Woche' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Tage pro Woche' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Intensivwochen' })).toBeVisible();
    
    // Check buttons
    await expect(page.locator('button').filter({ hasText: 'Abbrechen' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Neues Fach hinzufügen' })).toBeVisible();
    
    // Check form title
    await expect(page.locator('h2').filter({ hasText: 'Neues Fach hinzufügen' })).toBeVisible();
    
    console.log('✅ German translations verified successfully');
  });
  
  test('should display SubjectForm in English after switching language', async ({ page }) => {
    console.log('🌐 Testing SubjectForm translations in English...');
    
    await page.goto('http://localhost:3002/subjects', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Open settings to change language
    const settingsButton = page.locator('[aria-label="Settings"], button').filter({ hasText: 'Einstellungen' }).or(page.locator('button[title="Settings"]'));
    if (await settingsButton.count() > 0) {
      await settingsButton.first().click();
      await page.waitForTimeout(500);
      
      // Look for English language option
      const englishOption = page.locator('button, label').filter({ hasText: 'English' });
      if (await englishOption.count() > 0) {
        await englishOption.first().click();
        await page.waitForTimeout(1000);
        
        // Close settings modal if needed
        const closeButton = page.locator('button').filter({ hasText: 'Close' }).or(page.locator('button').filter({ hasText: 'Save' }));
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
        }
        
        await page.waitForTimeout(1000);
      }
    }
    
    // Click on "Add Subject" button (now in English)
    const addButton = page.locator('button').filter({ hasText: 'Add Subject' });
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    await page.waitForTimeout(1000);
    
    // Take screenshot of form in English
    await page.screenshot({ path: 'tmp/subject-form-english.png', fullPage: true });
    
    // Check English form labels
    await expect(page.locator('label').filter({ hasText: 'Subject Name' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Subject Color' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Start Date' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Exam Date' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Hours per Week' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Days per Week' })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Intensity Weeks' })).toBeVisible();
    
    // Check buttons
    await expect(page.locator('button').filter({ hasText: 'Cancel' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Add New Subject' })).toBeVisible();
    
    // Check form title
    await expect(page.locator('h2').filter({ hasText: 'Add New Subject' })).toBeVisible();
    
    console.log('✅ English translations verified successfully');
  });
});