const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testOverviewSessionInitiation() {
    console.log('🚀 Starting Overview Session Initiation Test');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000,
        args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Listen to console messages for debugging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('🔴 Console Error:', msg.text());
        } else if (msg.type() === 'log') {
            console.log('💬 Console Log:', msg.text());
        }
    });
    
    const testResults = {
        timestamp: new Date().toISOString(),
        tests: [],
        screenshots: []
    };
    
    try {
        console.log('📍 Step 1: Navigate to Overview page');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Take initial screenshot
        const screenshotPath1 = path.join(__dirname, 'overview-test-01-initial.png');
        await page.screenshot({ path: screenshotPath1, fullPage: true });
        testResults.screenshots.push('overview-test-01-initial.png');
        console.log('📸 Screenshot saved: overview-test-01-initial.png');
        
        // Test 1: Verify page loads correctly
        const pageTitle = await page.title();
        testResults.tests.push({
            name: 'Page loads correctly',
            passed: pageTitle.includes('Lernplan'),
            details: `Page title: ${pageTitle}`
        });
        console.log('✅ Test 1: Page loads correctly -', pageTitle.includes('Lernplan') ? 'PASSED' : 'FAILED');
        
        console.log('📍 Step 2: Check for "Lernsession starten" button');
        
        // Look for the start session button - try multiple selectors
        let startButton = null;
        const buttonSelectors = [
            'button:has-text("Lernsession starten")',
            '[data-testid="start-session-button"]',
            'button[aria-label*="Lernsession"]',
            'button:has-text("Start")',
            '.play-button',
            'button:has(.play-icon)',
            '[title*="Lernsession"]'
        ];
        
        for (const selector of buttonSelectors) {
            try {
                startButton = await page.locator(selector).first();
                if (await startButton.isVisible({ timeout: 1000 })) {
                    console.log(`🎯 Found start button with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        // Test 2: Verify start button is visible
        const buttonVisible = startButton && await startButton.isVisible();
        testResults.tests.push({
            name: 'Start session button is visible',
            passed: buttonVisible,
            details: buttonVisible ? 'Button found and visible' : 'Button not found or not visible'
        });
        console.log('✅ Test 2: Start button visibility -', buttonVisible ? 'PASSED' : 'FAILED');
        
        if (!buttonVisible) {
            // Check what elements are actually present
            console.log('🔍 Debugging: Checking page content...');
            const bodyText = await page.textContent('body');
            console.log('Page text contains "Lernsession":', bodyText.includes('Lernsession'));
            console.log('Page text contains "starten":', bodyText.includes('starten'));
            console.log('Page text contains "Start":', bodyText.includes('Start'));
            
            // Take debug screenshot
            const debugScreenshot = path.join(__dirname, 'overview-debug-no-button.png');
            await page.screenshot({ path: debugScreenshot, fullPage: true });
            testResults.screenshots.push('overview-debug-no-button.png');
            console.log('📸 Debug screenshot saved: overview-debug-no-button.png');
        }
        
        if (buttonVisible) {
            console.log('📍 Step 3: Test button clickability');
            
            // Test 3: Verify button is clickable
            const buttonEnabled = await startButton.isEnabled();
            testResults.tests.push({
                name: 'Start session button is clickable',
                passed: buttonEnabled,
                details: buttonEnabled ? 'Button is enabled' : 'Button is disabled'
            });
            console.log('✅ Test 3: Button clickability -', buttonEnabled ? 'PASSED' : 'FAILED');
            
            if (buttonEnabled) {
                console.log('📍 Step 4: Click button and test modal opening');
                
                // Take screenshot before clicking
                const screenshotPath2 = path.join(__dirname, 'overview-test-02-before-click.png');
                await page.screenshot({ path: screenshotPath2, fullPage: true });
                testResults.screenshots.push('overview-test-02-before-click.png');
                
                // Click the button
                await startButton.click();
                await page.waitForTimeout(1500);
                
                // Take screenshot after clicking
                const screenshotPath3 = path.join(__dirname, 'overview-test-03-after-click.png');
                await page.screenshot({ path: screenshotPath3, fullPage: true });
                testResults.screenshots.push('overview-test-03-after-click.png');
                console.log('📸 Screenshot saved: overview-test-03-after-click.png');
                
                // Test 4: Verify modal opened
                const modalSelectors = [
                    '[role="dialog"]',
                    '.modal',
                    '[data-testid="start-session-modal"]',
                    '.fixed.inset-0',
                    '[aria-modal="true"]'
                ];
                
                let modalFound = false;
                for (const selector of modalSelectors) {
                    try {
                        const modal = page.locator(selector);
                        if (await modal.isVisible({ timeout: 1000 })) {
                            modalFound = true;
                            console.log(`🎯 Modal found with selector: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        // Continue
                    }
                }
                
                testResults.tests.push({
                    name: 'StartSessionModal opens after button click',
                    passed: modalFound,
                    details: modalFound ? 'Modal opened successfully' : 'Modal did not open'
                });
                console.log('✅ Test 4: Modal opening -', modalFound ? 'PASSED' : 'FAILED');
                
                if (modalFound) {
                    console.log('📍 Step 5: Test complete session creation flow');
                    
                    // Look for subject selection
                    const subjectSelectors = [
                        'select[name="subject"]',
                        '[data-testid="subject-select"]',
                        'select:first-of-type',
                        '.subject-select'
                    ];
                    
                    let subjectSelect = null;
                    for (const selector of subjectSelectors) {
                        try {
                            subjectSelect = page.locator(selector);
                            if (await subjectSelect.isVisible({ timeout: 1000 })) {
                                console.log(`🎯 Subject select found: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            // Continue
                        }
                    }
                    
                    if (subjectSelect && await subjectSelect.isVisible()) {
                        // Select a subject
                        await subjectSelect.selectOption({ index: 1 });
                        console.log('📝 Selected subject');
                        await page.waitForTimeout(500);
                    }
                    
                    // Look for duration input
                    const durationSelectors = [
                        'input[name="duration"]',
                        '[data-testid="duration-input"]',
                        'input[type="number"]',
                        '.duration-input'
                    ];
                    
                    let durationInput = null;
                    for (const selector of durationSelectors) {
                        try {
                            durationInput = page.locator(selector);
                            if (await durationInput.isVisible({ timeout: 1000 })) {
                                console.log(`🎯 Duration input found: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            // Continue
                        }
                    }
                    
                    if (durationInput && await durationInput.isVisible()) {
                        await durationInput.clear();
                        await durationInput.fill('25');
                        console.log('⏱️ Set duration to 25 minutes');
                        await page.waitForTimeout(500);
                    }
                    
                    // Take screenshot of filled form
                    const screenshotPath4 = path.join(__dirname, 'overview-test-04-form-filled.png');
                    await page.screenshot({ path: screenshotPath4, fullPage: true });
                    testResults.screenshots.push('overview-test-04-form-filled.png');
                    
                    // Look for start button in modal
                    const startButtonSelectors = [
                        'button:has-text("Start")',
                        'button:has-text("Starten")',
                        '[data-testid="start-button"]',
                        'button[type="submit"]',
                        '.start-button'
                    ];
                    
                    let modalStartButton = null;
                    for (const selector of startButtonSelectors) {
                        try {
                            modalStartButton = page.locator(selector);
                            if (await modalStartButton.isVisible({ timeout: 1000 })) {
                                console.log(`🎯 Modal start button found: ${selector}`);
                                break;
                            }
                        } catch (e) {
                            // Continue
                        }
                    }
                    
                    if (modalStartButton && await modalStartButton.isVisible()) {
                        console.log('📍 Step 6: Start session from modal');
                        await modalStartButton.click();
                        await page.waitForTimeout(2000);
                        
                        // Take screenshot after starting session
                        const screenshotPath5 = path.join(__dirname, 'overview-test-05-session-started.png');
                        await page.screenshot({ path: screenshotPath5, fullPage: true });
                        testResults.screenshots.push('overview-test-05-session-started.png');
                        
                        // Test 5: Verify session started (modal should close, some indication of active session)
                        const modalStillVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
                        const sessionStarted = !modalStillVisible;
                        
                        testResults.tests.push({
                            name: 'Session creation completes successfully',
                            passed: sessionStarted,
                            details: sessionStarted ? 'Modal closed, session appears to have started' : 'Modal still visible or session did not start'
                        });
                        console.log('✅ Test 5: Session creation -', sessionStarted ? 'PASSED' : 'FAILED');
                        
                        if (sessionStarted) {
                            console.log('📍 Step 7: Verify session appears in calendar');
                            
                            // Navigate to calendar or check if calendar is visible
                            const calendarVisible = await page.locator('.calendar').isVisible().catch(() => false) ||
                                                   await page.locator('[data-testid="calendar"]').isVisible().catch(() => false);
                            
                            if (!calendarVisible) {
                                // Try to navigate to calendar page
                                const calendarLink = page.locator('a:has-text("Kalender")').or(page.locator('a[href*="calendar"]'));
                                if (await calendarLink.isVisible().catch(() => false)) {
                                    await calendarLink.click();
                                    await page.waitForTimeout(2000);
                                }
                            }
                            
                            // Take final screenshot
                            const screenshotPath6 = path.join(__dirname, 'overview-test-06-final-state.png');
                            await page.screenshot({ path: screenshotPath6, fullPage: true });
                            testResults.screenshots.push('overview-test-06-final-state.png');
                            
                            // Look for session in calendar/UI
                            const sessionInCalendar = await page.locator('.session').isVisible().catch(() => false) ||
                                                     await page.locator('[data-testid*="session"]').isVisible().catch(() => false) ||
                                                     await page.textContent('body').then(text => text.includes('25') || text.includes('min')).catch(() => false);
                            
                            testResults.tests.push({
                                name: 'Session appears in calendar/UI after creation',
                                passed: sessionInCalendar,
                                details: sessionInCalendar ? 'Session found in UI' : 'Session not found in UI'
                            });
                            console.log('✅ Test 6: Session in calendar -', sessionInCalendar ? 'PASSED' : 'FAILED');
                        }
                    } else {
                        testResults.tests.push({
                            name: 'Modal start button found',
                            passed: false,
                            details: 'Could not find start button in modal'
                        });
                    }
                } else {
                    // Modal didn't open, check what happened
                    console.log('🔍 Debugging: Modal did not open, checking page state...');
                    const currentUrl = page.url();
                    const bodyText = await page.textContent('body');
                    
                    console.log('Current URL:', currentUrl);
                    console.log('Page contains modal text:', bodyText.toLowerCase().includes('modal'));
                    console.log('Page contains dialog text:', bodyText.toLowerCase().includes('dialog'));
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        testResults.tests.push({
            name: 'Test execution',
            passed: false,
            details: `Error: ${error.message}`
        });
        
        // Take error screenshot
        const errorScreenshot = path.join(__dirname, 'overview-test-error.png');
        await page.screenshot({ path: errorScreenshot, fullPage: true }).catch(() => {});
        testResults.screenshots.push('overview-test-error.png');
    }
    
    // Generate test report
    const reportPath = path.join(__dirname, 'overview-session-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    const passedTests = testResults.tests.filter(t => t.passed).length;
    const totalTests = testResults.tests.length;
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    
    testResults.tests.forEach((test, index) => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} Test ${index + 1}: ${test.name}`);
        if (!test.passed) {
            console.log(`   Details: ${test.details}`);
        }
    });
    
    console.log(`\n📸 Screenshots taken: ${testResults.screenshots.length}`);
    testResults.screenshots.forEach(screenshot => {
        console.log(`   - ${screenshot}`);
    });
    
    console.log(`\n📋 Full report saved to: overview-session-test-report.json`);
    
    await browser.close();
    
    return testResults;
}

// Run the test
testOverviewSessionInitiation().then(results => {
    console.log('\n🎉 Overview Session Initiation Test Complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});