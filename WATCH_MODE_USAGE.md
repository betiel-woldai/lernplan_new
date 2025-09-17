# Watch Mode for Continuous Testing - Lernplaner

This project is configured with file watching capabilities for continuous testing and development feedback using `chokidar-cli`.

## 🚀 Quick Start

The most useful command for daily development:

```bash
npm run watch:dev
```

This watches all TypeScript/React files and runs type checking when they change.

## 📋 Available Watch Commands

### Development Workflows

```bash
# Watch TypeScript files + run type checking (recommended for daily dev)
npm run watch:dev

# Watch all files + run type checking + session tests (comprehensive)
npm run watch:full

# Watch source files + run type checking + quick session validation
npm run test:watch
```

### Specific Component Watching

```bash
# Watch only React components and hooks
npm run test:watch:components

# Watch only API routes and database files
npm run test:watch:api

# Watch only test files and run related E2E tests
npm run test:watch:e2e
```

### Manual Test Commands

```bash
# Run all tests once
npm test

# Run tests with UI (visual debugging)
npm run test:ui

# Run session-specific tests
npm run test:session

# Run quick validation test
npm run test:quick
```

## 🎯 What Each Watcher Does

### `watch:dev` - Development Mode (Recommended)
- **Watches:** All TypeScript/React files in `src/`
- **Runs:** Type checking
- **When to use:** Daily development, fastest feedback
- **Benefits:** Immediate type safety feedback

### `watch:full` - Complete Test Suite
- **Watches:** All source files + test files
- **Runs:** Type checking + session integration tests
- **When to use:** Before commits, thorough validation
- **Benefits:** Complete confidence in changes

### `test:watch` - Quick Validation
- **Watches:** Source files + tests
- **Runs:** Type checking + quick session test
- **When to use:** Active feature development
- **Benefits:** Fast validation of session functionality

### Component-Specific Watchers
- **Components:** Watches `src/components/` and `src/hooks/`
- **API:** Watches `src/pages/api/` and `src/lib/`
- **E2E:** Watches test files and runs Playwright tests

## 🔧 Customizing Watch Behavior

### Modify Watch Patterns

Edit `package.json` to change what files are watched:

```json
{
  "scripts": {
    "custom:watch": "chokidar 'your/pattern/**/*.ts' -c 'your-command'"
  }
}
```

### Common Patterns
- `'src/**/*.{ts,tsx}'` - All TypeScript React files
- `'src/components/**/*.tsx'` - Only React components
- `'src/pages/api/**/*.ts'` - Only API routes
- `'tests/**/*.spec.ts'` - Only test files

### Chokidar Options
- `--initial` - Run command on startup
- `--debounce 2000` - Wait 2 seconds after changes before running
- `--verbose` - Show detailed file change information

## 🚀 Example Development Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **In a second terminal, start file watching:**
   ```bash
   npm run watch:dev
   ```

3. **Edit files** - Get immediate feedback:
   - Edit `src/components/SessionTimer.tsx` → Type checking runs automatically
   - Edit `src/hooks/useActiveSession.tsx` → Type checking validates hook changes
   - Edit test file → Relevant tests run automatically (with `watch:full`)

## 🎛️ Advanced Usage

### Watch Multiple Patterns
```bash
chokidar 'src/**/*.{ts,tsx}' 'db/**/*.sql' -c 'npm run type-check && npm run db:check'
```

### Custom Commands
```bash
chokidar 'src/components/**/*.tsx' -c 'npm run type-check && npm run test:components && echo "✅ Components validated"'
```

### Ignore Patterns
```bash
chokidar 'src/**/*.ts' --ignore 'src/**/*.test.ts' -c 'npm run type-check'
```

## 🔍 Troubleshooting

### Watch Mode Not Starting
- Ensure chokidar-cli is installed: `npm install --save-dev chokidar-cli`
- Check file patterns exist: `ls src/components/`

### Tests Not Running
- Verify Playwright is installed: `npx playwright install`
- Check development server is running: `npm run dev`
- Ensure database is set up: `npm run db:setup`

### Type Checking Fails
- Run once manually to see detailed errors: `npm run type-check`
- Check TypeScript configuration: `cat tsconfig.json`

## 💡 Tips for Effective Watch Mode Usage

1. **Use `watch:dev` for regular development** - fastest feedback
2. **Use `watch:full` before pushing code** - comprehensive validation
3. **Keep terminals organized** - one for dev server, one for watch mode
4. **Combine with IDE**: Watch mode complements your editor's type checking
5. **Use `--verbose` flag** to debug watch patterns: `chokidar 'src/**/*.ts' -c 'echo "changed"' --verbose`

The watch mode setup provides continuous feedback and helps maintain code quality throughout development!