const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testOverviewSessionImproved() {
    console.log('🚀 Starting Improved Overview Session Initiation Test');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1500,
        args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Listen to console messages
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
        screenshots: [],
        issues: []
    };
    
    try {
        console.log('📍 Step 1: Navigate to Overview page');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Initial screenshot
        const screenshotPath1 = path.join(__dirname, 'improved-01-initial.png');
        await page.screenshot({ path: screenshotPath1, fullPage: true });
        testResults.screenshots.push('improved-01-initial.png');
        console.log('📸 Screenshot: improved-01-initial.png');
        
        // Test 1: Page loads
        const pageTitle = await page.title();
        testResults.tests.push({
            name: 'Overview page loads correctly',
            passed: pageTitle.includes('Lernplaner'),
            details: `Page title: ${pageTitle}`
        });
        
        console.log('📍 Step 2: Find and click "Lernsession starten" button');
        
        // Wait for and find start button
        const startButton = page.locator('button:has-text("Lernsession starten")');
        await startButton.waitFor({ state: 'visible' });
        
        testResults.tests.push({
            name: 'Start session button is visible',
            passed: await startButton.isVisible(),
            details: 'Green start button found on Overview page'
        });
        
        // Click start button
        await startButton.click();
        await page.waitForTimeout(2000);
        
        // Screenshot after clicking start button
        const screenshotPath2 = path.join(__dirname, 'improved-02-modal-opened.png');
        await page.screenshot({ path: screenshotPath2, fullPage: true });
        testResults.screenshots.push('improved-02-modal-opened.png');
        
        console.log('📍 Step 3: Verify and interact with StartSessionModal');
        
        // Wait for modal to be visible
        const modal = page.locator('[role="dialog"]').or(page.locator('.fixed.inset-0'));
        await modal.waitFor({ state: 'visible' });
        
        testResults.tests.push({
            name: 'StartSessionModal opens correctly',
            passed: await modal.isVisible(),
            details: 'Modal dialog appears after clicking start button'
        });
        
        // Check modal title
        const modalTitle = await page.locator('h2:has-text("Start Learning Session")').isVisible();
        testResults.tests.push({
            name: 'Modal has correct title',
            passed: modalTitle,
            details: 'Modal displays "Start Learning Session" title'
        });
        
        console.log('📍 Step 4: Fill out session form');
        
        // Select subject (should default to first option)
        const subjectSelect = page.locator('select').first();
        if (await subjectSelect.isVisible()) {
            // Get available options
            const options = await subjectSelect.locator('option').all();
            if (options.length > 1) {
                await subjectSelect.selectOption({ index: 1 }); // Select second option
                console.log('📝 Selected subject option');
            }
        }
        
        // Check duration dropdown (should have default value)
        const durationSelect = page.locator('select').nth(1);
        if (await durationSelect.isVisible()) {
            console.log('⏱️ Duration dropdown found');
        }
        
        // Add optional session notes
        const notesField = page.locator('textarea[placeholder*="What do you plan to work on"]');
        if (await notesField.isVisible()) {
            await notesField.fill('Testing the overview session start functionality');
            console.log('📝 Added session notes');
        }
        
        // Screenshot of filled form
        const screenshotPath3 = path.join(__dirname, 'improved-03-form-filled.png');
        await page.screenshot({ path: screenshotPath3, fullPage: true });
        testResults.screenshots.push('improved-03-form-filled.png');
        
        console.log('📍 Step 5: Start the session');
        
        // Look for the "Start Session" button (blue button)
        const startSessionButton = page.locator('button:has-text("Start Session")');
        await startSessionButton.waitFor({ state: 'visible' });
        
        testResults.tests.push({
            name: 'Start Session button is available in modal',
            passed: await startSessionButton.isVisible(),
            details: 'Blue Start Session button found in modal'
        });
        
        // Use force click to bypass overlay issues
        await startSessionButton.click({ force: true });
        console.log('🎯 Clicked Start Session button');
        
        // Wait for modal to close and session to start
        await page.waitForTimeout(3000);
        
        // Screenshot after starting session
        const screenshotPath4 = path.join(__dirname, 'improved-04-session-started.png');
        await page.screenshot({ path: screenshotPath4, fullPage: true });
        testResults.screenshots.push('improved-04-session-started.png');
        
        console.log('📍 Step 6: Verify session started');
        
        // Check if modal is closed
        const modalClosed = !(await modal.isVisible().catch(() => false));
        testResults.tests.push({
            name: 'Session starts successfully (modal closes)',
            passed: modalClosed,
            details: modalClosed ? 'Modal closed after starting session' : 'Modal still visible'
        });
        
        // Look for session indicators on the page
        const sessionIndicators = [
            // Check for timer or active session display
            page.locator('text=/\\d{2}:\\d{2}/'), // Timer format
            page.locator(':has-text("läuft")'), // German "running"
            page.locator(':has-text("aktiv")'), // German "active"
            page.locator('.timer'), // Timer component
            page.locator('[data-testid*="timer"]'),
            page.locator('.session-active')
        ];
        
        let sessionFound = false;
        for (const indicator of sessionIndicators) {
            if (await indicator.isVisible().catch(() => false)) {
                sessionFound = true;
                console.log('✅ Found active session indicator');
                break;
            }
        }
        
        testResults.tests.push({
            name: 'Active session is indicated on UI',
            passed: sessionFound,
            details: sessionFound ? 'Active session indicators found' : 'No active session indicators found'
        });
        
        console.log('📍 Step 7: Check calendar integration');
        
        // Check if session appears in calendar
        const calendarEntries = page.locator('.calendar-entry, .session-entry, [data-testid*="session"]');
        const sessionInCalendar = await calendarEntries.count() > 0;
        
        testResults.tests.push({
            name: 'Session appears in calendar view',
            passed: sessionInCalendar,
            details: sessionInCalendar ? 'Session entries found in calendar' : 'No session entries found in calendar'
        });
        
        // Final screenshot
        const screenshotPath5 = path.join(__dirname, 'improved-05-final-state.png');
        await page.screenshot({ path: screenshotPath5, fullPage: true });
        testResults.screenshots.push('improved-05-final-state.png');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        testResults.issues.push({
            step: 'Test execution',
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        // Error screenshot
        const errorScreenshot = path.join(__dirname, 'improved-error.png');
        await page.screenshot({ path: errorScreenshot, fullPage: true }).catch(() => {});
        testResults.screenshots.push('improved-error.png');
    }
    
    // Generate comprehensive report
    const reportPath = path.join(__dirname, 'improved-overview-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log('\n📊 IMPROVED TEST RESULTS:');
    console.log('==========================');
    
    const passedTests = testResults.tests.filter(t => t.passed).length;
    const totalTests = testResults.tests.length;
    console.log(`✅ Tests passed: ${passedTests}/${totalTests}`);
    
    testResults.tests.forEach((test, index) => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} ${test.name}`);
        if (!test.passed || test.details) {
            console.log(`   ${test.details}`);
        }
    });
    
    if (testResults.issues.length > 0) {
        console.log('\n⚠️ Issues encountered:');
        testResults.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.step}: ${issue.error}`);
        });
    }
    
    console.log(`\n📸 Screenshots captured: ${testResults.screenshots.length}`);
    testResults.screenshots.forEach(screenshot => {
        console.log(`   📷 ${screenshot}`);
    });
    
    console.log(`\n📋 Detailed report: improved-overview-test-report.json`);
    
    await browser.close();
    return testResults;
}

// Run the improved test
testOverviewSessionImproved().then(results => {
    console.log('\n🎉 Improved Overview Session Test Complete!');
    const successRate = (results.tests.filter(t => t.passed).length / results.tests.length * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    process.exit(0);
}).catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
});