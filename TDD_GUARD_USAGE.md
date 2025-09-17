# TDD Guard Configuration for Lernplaner

TDD Guard is set up to automatically run tests when your code changes, supporting continuous test-driven development workflow.

## Quick Start

```bash
# Start TDD Guard with development preset (recommended)
npm run test:watch:dev

# Or use specific presets
npm run test:watch:quick    # Only type-check and lint
npm run test:watch:full     # Full test suite including Playwright
npm run test:watch          # Default configuration
```

## Available Test Commands

```bash
# Playwright tests
npm test                    # Run all Playwright tests
npm run test:ui            # Run with Playwright UI
npm run test:headed        # Run tests with browser visible
npm run test:session       # Run session-related tests only

# Quick validation
npm run test:quick         # Run simple session flow test

# Code quality
npm run type-check         # TypeScript type checking
npm run lint              # ESLint checks
```

## TDD Guard Watchers

### 1. Frontend Components Watcher
**Watches:** `src/components/`, `src/hooks/`, `src/pages/`, `src/utils/`, `src/lib/`
**Runs:** Type checking and linting
**Use case:** Real-time feedback while developing React components

### 2. API Routes Watcher
**Watches:** `src/pages/api/`, `src/lib/db.ts`, migration files
**Runs:** Type checking for API code
**Use case:** Validate API changes immediately

### 3. Playwright Tests Watcher
**Watches:** `tests/*.spec.ts`, `test-*.js` files
**Runs:** Specific test files that changed, plus related tests
**Use case:** Run affected tests when test files are modified

### 4. Integration Tests Watcher
**Watches:** Core session management files (useActiveSession, useCalendarSessions, etc.)
**Runs:** Session-related integration tests and quick validation
**Use case:** Validate critical functionality when core files change

### 5. Database Changes Watcher
**Watches:** Migration files, database utilities
**Runs:** Database-related tests and migration notifications
**Use case:** Validate database changes don't break existing functionality

## Presets Explained

### Development Preset (Recommended)
- Watches: Frontend components + integration tests
- Commands: Type checking + quick session validation
- Fast feedback loop for daily development

### Quick Preset
- Watches: Frontend components only
- Commands: Type checking + linting only
- Fastest feedback, no test execution

### Full Preset
- Watches: All watchers active
- Commands: Complete test suite
- Comprehensive but slower feedback

## Example Workflow

1. **Start TDD Guard:**
   ```bash
   npm run test:watch:dev
   ```

2. **Edit a component** (e.g., `src/components/SessionTimer.tsx`)
   - TDD Guard automatically runs type checking
   - If core session functionality changed, runs quick validation test

3. **Edit a test file** (e.g., `tests/session-extension-test.spec.ts`)
   - TDD Guard runs the specific test file
   - Provides immediate feedback on test changes

4. **Edit API route** (e.g., `src/pages/api/sessions/index.ts`)
   - Runs type checking for API consistency
   - Notifies about potential database impact

## Customizing Configuration

Edit `.tdd-guard.json` to:
- Add new file patterns to watch
- Modify commands that run on changes
- Adjust debounce timing and parallel execution
- Create custom presets for your workflow

## Troubleshooting

If tdd-guard doesn't start:
1. Ensure it's installed globally: `npm install -g tdd-guard`
2. Check that `.tdd-guard.json` has valid JSON syntax
3. Verify file paths in patterns match your project structure

For test failures:
- Check that Playwright is properly installed: `npx playwright install`
- Ensure development server is running: `npm run dev`
- Verify database is set up: `npm run db:setup`