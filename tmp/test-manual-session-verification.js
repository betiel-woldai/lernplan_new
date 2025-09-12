const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function manualSessionVerification() {
    console.log('🕵️ Starting Manual Session Verification Test');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 3000,
        args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Track all API calls
    const apiCalls = [];
    page.on('request', request => {
        if (request.url().includes('api')) {
            apiCalls.push({
                method: request.method(),
                url: request.url(),
                timestamp: new Date().toISOString()
            });
        }
    });
    
    const apiResponses = [];
    page.on('response', async response => {
        if (response.url().includes('api')) {
            const responseData = {
                status: response.status(),
                url: response.url(),
                timestamp: new Date().toISOString()
            };
            
            try {
                const body = await response.text();
                if (body) {
                    responseData.body = body.length > 500 ? body.substring(0, 500) + '...' : body;
                }
            } catch (e) {
                responseData.bodyError = 'Could not read response body';
            }
            
            apiResponses.push(responseData);
        }
    });
    
    // Console messages
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        });
    });
    
    const testResults = {
        timestamp: new Date().toISOString(),
        steps: [],
        apiCalls: [],
        apiResponses: [],
        consoleLogs: [],
        screenshots: [],
        finalState: {}
    };
    
    try {
        console.log('📍 Step 1: Navigate to Overview page and wait for full load');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(4000); // Extra wait for all components
        
        const step1Screenshot = path.join(__dirname, 'manual-01-initial-load.png');
        await page.screenshot({ path: step1Screenshot, fullPage: true });
        testResults.screenshots.push('manual-01-initial-load.png');
        
        testResults.steps.push({
            step: 1,
            description: 'Navigate to Overview page',
            success: true,
            details: 'Page loaded successfully'
        });
        
        console.log('📍 Step 2: Verify start button exists and is functional');
        
        // Look for start session button
        const startButton = page.locator('button:has-text("Lernsession starten")');
        const buttonExists = await startButton.isVisible();
        const buttonEnabled = buttonExists ? await startButton.isEnabled() : false;
        
        testResults.steps.push({
            step: 2,
            description: 'Verify start button',
            success: buttonExists && buttonEnabled,
            details: `Button exists: ${buttonExists}, Button enabled: ${buttonEnabled}`
        });
        
        if (buttonExists && buttonEnabled) {
            console.log('📍 Step 3: Click start button and wait for modal');
            
            await startButton.click();
            await page.waitForTimeout(2000);
            
            const step3Screenshot = path.join(__dirname, 'manual-03-modal-opened.png');
            await page.screenshot({ path: step3Screenshot, fullPage: true });
            testResults.screenshots.push('manual-03-modal-opened.png');
            
            // Verify modal opened
            const modal = page.locator('[role="dialog"], .fixed.inset-0');
            const modalVisible = await modal.isVisible();
            
            testResults.steps.push({
                step: 3,
                description: 'Click start button and open modal',
                success: modalVisible,
                details: `Modal visible: ${modalVisible}`
            });
            
            if (modalVisible) {
                console.log('📍 Step 4: Fill form and prepare for session creation');
                
                // Select subject
                const subjectSelect = page.locator('select').first();
                if (await subjectSelect.isVisible()) {
                    await subjectSelect.selectOption({ index: 1 }); // Select Mathe
                    console.log('✅ Subject selected: Mathe');
                }
                
                // Add session notes for identification
                const sessionNotes = page.locator('textarea');
                if (await sessionNotes.isVisible()) {
                    const uniqueNote = `Test session created at ${new Date().toISOString()}`;
                    await sessionNotes.fill(uniqueNote);
                    console.log('✅ Session notes added:', uniqueNote);
                }
                
                const step4Screenshot = path.join(__dirname, 'manual-04-form-ready.png');
                await page.screenshot({ path: step4Screenshot, fullPage: true });
                testResults.screenshots.push('manual-04-form-ready.png');
                
                console.log('📍 Step 5: Attempt session creation with network monitoring');
                
                // Clear previous API tracking
                apiCalls.length = 0;
                apiResponses.length = 0;
                
                const sessionCreateButton = page.locator('button:has-text("Start Session")');
                if (await sessionCreateButton.isVisible()) {
                    console.log('🎯 Found Start Session button, clicking...');
                    
                    // Click and wait for potential API calls
                    await sessionCreateButton.click();
                    console.log('⏳ Waiting 6 seconds to observe API calls and state changes...');
                    await page.waitForTimeout(6000);
                    
                    // Take post-click screenshot
                    const step5Screenshot = path.join(__dirname, 'manual-05-after-session-start.png');
                    await page.screenshot({ path: step5Screenshot, fullPage: true });
                    testResults.screenshots.push('manual-05-after-session-start.png');
                    
                    // Check modal state
                    const modalStillOpen = await modal.isVisible();
                    
                    testResults.steps.push({
                        step: 5,
                        description: 'Attempt session creation',
                        success: !modalStillOpen, // Success if modal closed
                        details: `Modal closed: ${!modalStillOpen}, API calls made: ${apiCalls.length}`
                    });
                    
                    console.log('📍 Step 6: Analyze results and check for session evidence');
                    
                    // Look for session indicators across the page
                    const sessionIndicators = await Promise.all([
                        page.locator('text=/\\d{2}:\\d{2}/').count(),
                        page.locator(':has-text("läuft")').count(),
                        page.locator(':has-text("aktiv")').count(),
                        page.locator('.timer').count(),
                        page.locator('[data-testid*="session"]').count(),
                        page.textContent('body').then(text => text.includes('25') && text.includes('min'))
                    ]);
                    
                    const totalIndicators = sessionIndicators.slice(0, -1).reduce((a, b) => a + b, 0);
                    const textIndicator = sessionIndicators[sessionIndicators.length - 1];
                    
                    // Check if page URL changed or if there are new elements
                    const currentUrl = page.url();
                    const pageChanged = !currentUrl.endsWith('/');
                    
                    testResults.steps.push({
                        step: 6,
                        description: 'Check for session evidence',
                        success: totalIndicators > 0 || textIndicator || !modalStillOpen,
                        details: `Timer indicators: ${totalIndicators}, Text indicators: ${textIndicator}, URL changed: ${pageChanged}, Modal closed: ${!modalStillOpen}`
                    });
                    
                    // Final comprehensive screenshot
                    const finalScreenshot = path.join(__dirname, 'manual-06-final-state.png');
                    await page.screenshot({ path: finalScreenshot, fullPage: true });
                    testResults.screenshots.push('manual-06-final-state.png');
                    
                    testResults.finalState = {
                        modalClosed: !modalStillOpen,
                        sessionIndicators: totalIndicators,
                        textIndicatorFound: textIndicator,
                        urlChanged: pageChanged,
                        apiCallsMade: apiCalls.length,
                        currentUrl: currentUrl
                    };
                } else {
                    testResults.steps.push({
                        step: 5,
                        description: 'Find Start Session button',
                        success: false,
                        details: 'Start Session button not found in modal'
                    });
                }
            }
        }
        
        // Store API data
        testResults.apiCalls = apiCalls;
        testResults.apiResponses = apiResponses;
        testResults.consoleLogs = consoleLogs.filter(log => 
            log.text.includes('session') || 
            log.text.includes('API') || 
            log.text.includes('Error') ||
            log.type === 'error'
        );
        
    } catch (error) {
        console.error('💥 Manual test error:', error.message);
        testResults.steps.push({
            step: 'error',
            description: 'Test execution error',
            success: false,
            details: error.message
        });
        
        // Error screenshot
        const errorScreenshot = path.join(__dirname, 'manual-error.png');
        await page.screenshot({ path: errorScreenshot, fullPage: true }).catch(() => {});
        testResults.screenshots.push('manual-error.png');
    }
    
    // Generate comprehensive report
    const reportPath = path.join(__dirname, 'manual-session-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log('\n📊 MANUAL VERIFICATION RESULTS:');
    console.log('================================');
    
    testResults.steps.forEach(step => {
        const status = step.success ? '✅' : '❌';
        console.log(`${status} Step ${step.step}: ${step.description}`);
        console.log(`   Details: ${step.details}`);
    });
    
    if (testResults.finalState.modalClosed !== undefined) {
        console.log('\n🎯 FINAL STATE ANALYSIS:');
        console.log('Modal closed:', testResults.finalState.modalClosed ? '✅' : '❌');
        console.log('Session indicators found:', testResults.finalState.sessionIndicators);
        console.log('API calls made:', testResults.finalState.apiCallsMade);
        console.log('Current URL:', testResults.finalState.currentUrl);
    }
    
    if (testResults.apiCalls.length > 0) {
        console.log('\n🌐 API CALLS MADE:');
        testResults.apiCalls.forEach(call => {
            console.log(`   ${call.method} ${call.url}`);
        });
    }
    
    console.log(`\n📸 Screenshots: ${testResults.screenshots.length}`);
    console.log(`📋 Full report: manual-session-verification-report.json`);
    
    await browser.close();
    return testResults;
}

// Run the manual verification test
manualSessionVerification().then(results => {
    console.log('\n🎯 Manual Session Verification Complete!');
    
    const successfulSteps = results.steps.filter(s => s.success).length;
    const totalSteps = results.steps.length;
    console.log(`📈 Success Rate: ${successfulSteps}/${totalSteps} (${(successfulSteps/totalSteps*100).toFixed(1)}%)`);
    
    process.exit(0);
}).catch(error => {
    console.error('💥 Manual verification failed:', error);
    process.exit(1);
});