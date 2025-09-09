const { chromium } = require('playwright');

async function testDashboard() {
  console.log('🚀 Starting Dashboard Test - Real-time Data Propagation');
  console.log('='*60);

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down to observe behavior
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const logEntry = `${new Date().toISOString()} - ${msg.type()}: ${msg.text()}`;
    console.log('CONSOLE:', logEntry);
    consoleLogs.push(logEntry);
  });
  
  // Collect network requests
  const networkLogs = [];
  page.on('request', request => {
    if (request.url().includes('api')) {
      const logEntry = `REQUEST: ${request.method()} ${request.url()}`;
      console.log('NETWORK:', logEntry);
      networkLogs.push(logEntry);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api')) {
      const logEntry = `RESPONSE: ${response.status()} ${response.url()}`;
      console.log('NETWORK:', logEntry);
      networkLogs.push(logEntry);
    }
  });

  try {
    console.log('\n📍 Step 1: Loading Dashboard Page');
    await page.goto('http://localhost:3001');
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    console.log('\n📍 Step 2: Looking for XP Data in Dashboard');
    
    // Look for XP displays
    const xpElements = await page.$$eval('[data-testid*="xp"], [class*="xp"], [class*="XP"], text=/XP/i', elements => {
      return elements.map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent,
        innerHTML: el.innerHTML
      }));
    }).catch(() => []);
    
    console.log('XP Elements found:', xpElements);
    
    // Search for any elements containing numbers that might be XP
    const numberElements = await page.$$eval('*', elements => {
      return elements
        .filter(el => {
          const text = el.textContent?.trim() || '';
          return /\b\d+\s*(XP|xp|points?)\b/i.test(text) || 
                 /\b124\b/.test(text) || 
                 /\bXP:\s*\d+/.test(text);
        })
        .map(el => ({
          tag: el.tagName,
          class: el.className,
          text: el.textContent?.trim(),
          innerHTML: el.innerHTML
        }));
    }).catch(() => []);
    
    console.log('Number/XP Elements found:', numberElements);
    
    console.log('\n📍 Step 3: Taking Screenshot of Dashboard');
    await page.screenshot({ 
      path: '/Users/b.woldai/1programm_code/claude-code/dias/lernplan_new/dashboard_test.png',
      fullPage: true 
    });
    
    console.log('\n📍 Step 4: Checking for Debug Logs');
    console.log('Console logs captured:');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    console.log('\n📍 Step 5: Checking Network Requests');
    console.log('Network requests captured:');
    networkLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // Wait a bit more to capture any delayed logs
    console.log('\n📍 Step 6: Waiting for Additional Debug Logs');
    await page.waitForTimeout(5000);
    
    // Check if there are any elements with "124" (the expected XP)
    const has124 = await page.evaluate(() => {
      return document.body.textContent.includes('124');
    });
    
    console.log(`\n📊 Test Results Summary:`);
    console.log(`- Page loaded successfully: ✓`);
    console.log(`- XP elements found: ${xpElements.length}`);
    console.log(`- Number elements found: ${numberElements.length}`);
    console.log(`- Contains "124": ${has124 ? '✓' : '✗'}`);
    console.log(`- Console logs captured: ${consoleLogs.length}`);
    console.log(`- Network requests captured: ${networkLogs.length}`);
    
    // Look for specific debug patterns
    const debugPatterns = [
      '🐛 useUserStats: Fetching user stats',
      '🐛 useUserStats: Received data',
      '🐛 Dashboard DEBUG',
      '🚀 Event Dispatched'
    ];
    
    console.log(`\n🔍 Debug Pattern Analysis:`);
    debugPatterns.forEach(pattern => {
      const found = consoleLogs.some(log => log.includes(pattern));
      console.log(`- "${pattern}": ${found ? '✓ Found' : '✗ Not found'}`);
    });
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Dashboard test completed');
  }
}

testDashboard().catch(console.error);