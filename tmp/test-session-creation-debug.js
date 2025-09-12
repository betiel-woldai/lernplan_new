const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugSessionCreation() {
    console.log('🔍 Starting Session Creation Debug Test');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 2000,
        args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Listen to all network requests and console messages
    page.on('request', request => {
        if (request.url().includes('api') || request.method() === 'POST') {
            console.log('🌐 Request:', request.method(), request.url());
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('api') || response.status() !== 200) {
            console.log('📡 Response:', response.status(), response.url());
        }
    });
    
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        if (type === 'error') {
            console.log('🔴 Console Error:', text);
        } else if (type === 'log' && (text.includes('session') || text.includes('API') || text.includes('Error'))) {
            console.log('💬 Relevant Log:', text);
        }
    });
    
    const debugLog = [];
    
    try {
        console.log('📍 Step 1: Navigate and open modal');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Open modal
        const startButton = page.locator('button:has-text("Lernsession starten")');
        await startButton.waitFor({ state: 'visible' });
        await startButton.click();
        await page.waitForTimeout(1500);
        
        debugLog.push('Modal opened successfully');
        
        console.log('📍 Step 2: Fill form with minimal data');
        
        // Select Mathe subject (second option)
        const subjectSelect = page.locator('select').first();
        await subjectSelect.selectOption({ index: 1 });
        debugLog.push('Subject selected: Mathe');
        
        // Keep default duration (25 minutes)
        debugLog.push('Duration kept as default (25 minutes)');
        
        // Screenshot before clicking
        const beforeClickPath = path.join(__dirname, 'debug-before-start-click.png');
        await page.screenshot({ path: beforeClickPath, fullPage: true });
        console.log('📸 Screenshot before click: debug-before-start-click.png');
        
        console.log('📍 Step 3: Monitor network during Start Session click');
        
        // Set up promise to catch network activity
        let apiCallMade = false;
        let apiResponse = null;
        
        page.on('response', async response => {
            if (response.url().includes('/api/') && response.request().method() === 'POST') {
                apiCallMade = true;
                apiResponse = {
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                };
                
                try {
                    const responseBody = await response.json();
                    apiResponse.body = responseBody;
                } catch (e) {
                    apiResponse.error = 'Failed to parse response body';
                }
                
                console.log('🎯 API Call detected:', apiResponse);
            }
        });
        
        // Find and click the Start Session button
        const startSessionButton = page.locator('button:has-text("Start Session")');
        await startSessionButton.waitFor({ state: 'visible' });
        
        console.log('🎯 Clicking Start Session button...');
        await startSessionButton.click({ force: true });
        
        // Wait and observe what happens
        await page.waitForTimeout(5000);
        
        console.log('📍 Step 4: Check results');
        
        // Check if modal is still visible
        const modalStillVisible = await page.locator('[role="dialog"]').isVisible();
        debugLog.push(`Modal still visible after click: ${modalStillVisible}`);
        
        if (modalStillVisible) {
            console.log('⚠️ Modal is still open - checking for error messages');
            
            // Look for error messages
            const errorSelectors = [
                '.error',
                '.text-red-500',
                '[role="alert"]',
                '.alert-error',
                'text*="error"',
                'text*="Error"',
                'text*="failed"',
                'text*="Failed"'
            ];
            
            let errorFound = false;
            for (const selector of errorSelectors) {
                try {
                    const errorElement = page.locator(selector);
                    if (await errorElement.isVisible()) {
                        const errorText = await errorElement.textContent();
                        console.log('❌ Error message found:', errorText);
                        debugLog.push(`Error message: ${errorText}`);
                        errorFound = true;
                        break;
                    }
                } catch (e) {
                    // Continue checking other selectors
                }
            }
            
            if (!errorFound) {
                console.log('🤔 No error messages visible in modal');
                debugLog.push('No visible error messages in modal');
            }
        }
        
        // Check for session indicators
        const sessionIndicators = await page.locator('text=/\\d{2}:\\d{2}|läuft|aktiv/').count();
        debugLog.push(`Session indicators found: ${sessionIndicators}`);
        
        // Screenshot after action
        const afterClickPath = path.join(__dirname, 'debug-after-start-click.png');
        await page.screenshot({ path: afterClickPath, fullPage: true });
        console.log('📸 Screenshot after click: debug-after-start-click.png');
        
        // Final analysis
        console.log('\n📊 DEBUG SUMMARY:');
        console.log('==================');
        debugLog.forEach((log, index) => {
            console.log(`${index + 1}. ${log}`);
        });
        
        console.log(`\n🌐 API Call made: ${apiCallMade}`);
        if (apiResponse) {
            console.log('📡 API Response:', JSON.stringify(apiResponse, null, 2));
        }
        
        // Create debug report
        const debugReport = {
            timestamp: new Date().toISOString(),
            modalStillVisible: modalStillVisible,
            apiCallMade: apiCallMade,
            apiResponse: apiResponse,
            debugLog: debugLog,
            screenshots: [
                'debug-before-start-click.png',
                'debug-after-start-click.png'
            ]
        };
        
        const reportPath = path.join(__dirname, 'session-creation-debug-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(debugReport, null, 2));
        console.log(`\n📋 Debug report saved: session-creation-debug-report.json`);
        
    } catch (error) {
        console.error('💥 Debug test error:', error.message);
        
        // Error screenshot
        const errorPath = path.join(__dirname, 'debug-error.png');
        await page.screenshot({ path: errorPath, fullPage: true }).catch(() => {});
        console.log('📸 Error screenshot: debug-error.png');
    }
    
    await browser.close();
}

// Run debug test
debugSessionCreation().then(() => {
    console.log('\n🎯 Session Creation Debug Complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
});