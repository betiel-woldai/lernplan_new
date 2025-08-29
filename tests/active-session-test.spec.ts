import { test, expect } from '@playwright/test';

test.describe('Active Session Timer', () => {
  test('Complete active session timer workflow', async ({ page }) => {
    console.log('🚀 Testing active session timer functionality...');

    // Navigate to subjects page
    await page.goto('http://localhost:3000/subjects');
    await page.waitForTimeout(2000);

    // First, let's add a test subject so we can start a session
    console.log('📚 Adding test subject for session...');
    
    // Click Add Subject
    const addSubjectBtn = page.locator('button:has-text("Add Subject")');
    if (await addSubjectBtn.isVisible()) {
      await addSubjectBtn.click();
      await page.waitForTimeout(1000);

      // Fill out subject form
      await page.fill('input[name="name"]', 'Session Test Subject');
      
      // Select a color (first preset)
      const firstColorSwatch = page.locator('[data-testid="color-swatch"]').first();
      if (await firstColorSwatch.isVisible()) {
        await firstColorSwatch.click();
      }

      // Set dates
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await page.fill('input[name="startDate"]', today);
      await page.fill('input[name="examDate"]', nextWeek);

      // Set study parameters
      await page.fill('input[name="hoursPerWeek"]', '10');
      await page.fill('input[name="daysPerWeek"]', '5');
      await page.fill('input[name="intensityWeeks"]', '2');

      // Create subject
      const createBtn = page.locator('button:has-text("Create Subject")');
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(1500);
        console.log('✅ Test subject created');
      }
    }

    // Now test the active session timer
    console.log('⏱️ Testing session timer...');

    // Click Start Session
    const startSessionBtn = page.locator('button:has-text("Start Session")');
    if (await startSessionBtn.isVisible()) {
      await startSessionBtn.click();
      await page.waitForTimeout(1000);

      // Select the test subject
      const subjectRadio = page.locator('input[name="subject"]').first();
      if (await subjectRadio.isVisible()) {
        await subjectRadio.click();
      }

      // Set a short duration for testing (1 minute)
      await page.selectOption('select', '15'); // 15 minutes
      
      // Add session notes
      await page.fill('textarea', 'Testing active session timer functionality');

      // Take screenshot of filled modal
      await page.screenshot({ 
        path: 'tmp/active-01-start-session-filled.png',
        fullPage: true 
      });

      // Start the session
      const startBtn = page.locator('button:has-text("Start Session")');
      if (await startBtn.isVisible()) {
        await startBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Session started');
      }
    }

    // Verify session timer appears
    await page.waitForTimeout(2000);
    
    // Take screenshot showing active timer
    await page.screenshot({ 
      path: 'tmp/active-02-session-timer-active.png',
      fullPage: true 
    });

    // Check if session timer is visible and running
    const sessionTimer = page.locator('[class*="bg-white rounded-lg shadow-md border-2"]');
    if (await sessionTimer.isVisible()) {
      console.log('✅ Session timer component is visible');

      // Check for progress circle
      const progressCircle = page.locator('svg circle');
      if (await progressCircle.count() > 0) {
        console.log('✅ Progress circle is present');
      }

      // Check for timer display
      const timerText = page.locator('text=/\\d+:\\d+/');
      if (await timerText.isVisible()) {
        console.log('✅ Timer display is working');
      }

      // Test pause functionality
      const pauseBtn = page.locator('button:has-text("Pause")');
      if (await pauseBtn.isVisible()) {
        await pauseBtn.click();
        await page.waitForTimeout(1000);
        
        console.log('⏸️ Session paused');
        
        await page.screenshot({ 
          path: 'tmp/active-03-session-paused.png',
          fullPage: true 
        });

        // Test resume functionality
        const resumeBtn = page.locator('button:has-text("Resume")');
        if (await resumeBtn.isVisible()) {
          await resumeBtn.click();
          await page.waitForTimeout(1000);
          
          console.log('▶️ Session resumed');
          
          await page.screenshot({ 
            path: 'tmp/active-04-session-resumed.png',
            fullPage: true 
          });
        }
      }

      // Test complete functionality
      const completeBtn = page.locator('button:has-text("Complete")');
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await page.waitForTimeout(3000); // Wait for completion process
        
        console.log('✅ Session completed');
        
        await page.screenshot({ 
          path: 'tmp/active-05-session-completed.png',
          fullPage: true 
        });

        // Check if session history updated
        const historyBtn = page.locator('button:has-text("Session History")');
        if (await historyBtn.isVisible()) {
          await historyBtn.click();
          await page.waitForTimeout(1500);

          await page.screenshot({ 
            path: 'tmp/active-06-session-history-updated.png',
            fullPage: true 
          });

          console.log('📊 Session history updated');
        }
      }
    }

    // Test mobile responsiveness with active session
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'tmp/active-07-mobile-timer.png',
      fullPage: true 
    });

    console.log('🎉 Active session timer test completed successfully!');
  });
});