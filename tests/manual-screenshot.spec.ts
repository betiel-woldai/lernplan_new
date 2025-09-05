import { test, expect } from '@playwright/test';

test('Manual Screenshot for Form Debug', async ({ page }) => {
  console.log('📸 Taking screenshot to manually inspect...');

  await page.goto('http://localhost:3001/subjects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Take screenshot of the main page
  await page.screenshot({ 
    path: 'tmp/manual-subjects-page.png',
    fullPage: true 
  });

  // Check what buttons are actually present
  const buttons = await page.$$eval('button', buttons => 
    buttons.map(btn => ({
      text: btn.textContent?.trim(),
      className: btn.className,
      visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
    }))
  );

  console.log('🔘 Available buttons:', JSON.stringify(buttons, null, 2));

  console.log('✅ Manual screenshot taken');
});