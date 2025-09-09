import { test, expect } from '@playwright/test';

test.describe('Calendar Sync Functionality Test', () => {
  let consoleErrors: string[] = [];
  let apiErrors: any[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    apiErrors = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('Console Error:', msg.text());
      }
    });

    // Listen for API errors
    page.on('response', async response => {
      if (!response.ok()) {
        try {
          const responseBody = await response.text();
          apiErrors.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            body: responseBody
          });
          console.log('API Error:', response.url(), response.status(), responseBody);
        } catch (error) {
          apiErrors.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            body: 'Could not read response body'
          });
        }
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
    });
  });

  test('should test calendar sync via API call', async ({ page }) => {
    // Navigate to calendar page first
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ 
      path: 'tmp/calendar-before-sync-test.png', 
      fullPage: true 
    });

    // Test the sync functionality by making an API call within the page context
    const syncResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/calendar/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: '62d1b19b-3874-43b1-9424-ca7c2de10557'
          })
        });

        const result = await response.json();
        
        return {
          ok: response.ok,
          status: response.status,
          data: result
        };
      } catch (error) {
        return {
          ok: false,
          status: 0,
          data: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }
    });

    console.log('=== SYNC API TEST RESULTS ===');
    console.log('Sync Response Status:', syncResponse.status);
    console.log('Sync Response OK:', syncResponse.ok);
    console.log('Sync Response Data:', JSON.stringify(syncResponse.data, null, 2));

    // Wait for any potential updates to the page
    await page.waitForTimeout(2000);

    // Reload the page to see the updated calendar
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take screenshot after sync
    await page.screenshot({ 
      path: 'tmp/calendar-after-sync-test.png', 
      fullPage: true 
    });

    // Check for UUID errors specifically
    const uuidErrors = [...consoleErrors, ...apiErrors.map(e => e.body)]
      .filter(error => typeof error === 'string' && error.toLowerCase().includes('uuid'));

    console.log('UUID errors found:', uuidErrors.length);
    uuidErrors.forEach((error, index) => {
      console.log(`  UUID Error ${index + 1}:`, error);
    });

    // Assertions
    expect(syncResponse.ok).toBe(true);
    expect(syncResponse.status).toBe(200);
    expect(syncResponse.data).toHaveProperty('message');
    expect(syncResponse.data.message).toContain('synchronized successfully');
    
    // UUID errors should be minimal or zero
    expect(uuidErrors.length).toBeLessThanOrEqual(0);
  });

  test('should verify calendar displays study sessions correctly', async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');

    // Wait for calendar to load
    await page.waitForTimeout(3000);

    // Check if calendar sessions are displayed
    const studySessions = await page.locator('.calendar-event, [class*="session"], [class*="Study"]').count();
    console.log(`Found ${studySessions} study session elements on calendar`);

    // Look for specific subject sessions
    const mathSessions = await page.getByText(/Mathe.*Study Session/i).count();
    const physikSessions = await page.getByText(/physik.*Study Session/i).count();
    const chemieSessions = await page.getByText(/Chemie.*Study Session/i).count();

    console.log('Subject sessions found:');
    console.log(`  Math sessions: ${mathSessions}`);
    console.log(`  Physik sessions: ${physikSessions}`);
    console.log(`  Chemie sessions: ${chemieSessions}`);

    // Take final screenshot
    await page.screenshot({ 
      path: 'tmp/calendar-sessions-verification.png', 
      fullPage: true 
    });

    // Verify we have sessions displayed
    expect(studySessions).toBeGreaterThan(0);
    expect(mathSessions + physikSessions + chemieSessions).toBeGreaterThan(0);
  });
});