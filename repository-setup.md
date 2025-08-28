# 🚀 Repository Setup & Initial Configuration Guide

> Complete guide for setting up the Lernplaner repository, development environment, and initial project structure.

## 🎯 Repository Creation Steps

### 1. Create New GitHub Repository

```bash
# Option A: Using GitHub CLI (Recommended)
gh repo create lernplaner --public --description "🎓 Gamified Learning Management Platform with XP, Streaks & Smart Scheduling"

# Option B: Using git commands after creating repo on GitHub
git clone https://github.com/yourusername/lernplaner.git
cd lernplaner
```

### 2. Repository Settings Configuration

#### Branch Protection Rules
```bash
# Set main branch as default and protected
gh api repos/:owner/:repo --method PATCH --field default_branch=main

# Enable branch protection
gh api repos/:owner/:repo/branches/main/protection --method PUT --input protection-rules.json
```

#### Labels for Issues
```bash
# Create custom labels for our workflow
gh label create "frontend" --description "Frontend development tasks" --color "0ea5e9"
gh label create "backend" --description "Backend development tasks" --color "8b5cf6"  
gh label create "ui" --description "User interface components" --color "f59e0b"
gh label create "gamification" --description "Gamification features" --color "10b981"
gh label create "priority-high" --description "High priority tasks" --color "dc2626"
gh label create "priority-medium" --description "Medium priority tasks" --color "f59e0b"
gh label create "priority-low" --description "Low priority tasks" --color "6b7280"
gh label create "enhancement" --description "New feature or request" --color "a855f7"
```

---

## 💻 Initial Project Setup

### 1. Next.js 14 Project Initialization

```bash
# Create Next.js project with Pages Router, TypeScript and Tailwind
npx create-next-app@latest lernplaner \
  --typescript \
  --tailwind \
  --eslint \
  --src-dir \
  --import-alias "@/*"

cd lernplaner
```

### 2. Core Dependencies Installation

```bash
# HTTP Client and State Management
npm install axios react-icons

# Charts and Visualizations
npm install chart.js react-chartjs-2

# Forms and Validation
npm install react-hook-form

# Authentication
npm install next-auth

# Database
npm install pg @types/pg

# File Upload and Email
npm install formidable nodemailer @types/formidable @types/nodemailer

# Internationalization
npm install next-i18next i18next react-i18next

# Utilities
npm install canvas-confetti @types/canvas-confetti date-fns

# CSS Modules support (built into Next.js)
# Tailwind CSS (already included in Next.js setup)

# Development Dependencies
npm install --save-dev @types/node @types/react @types/react-dom
npm install --save-dev prettier prettier-plugin-tailwindcss
npm install --save-dev @playwright/test
```

### 3. Docker Setup

```bash
# Create Docker configuration files
mkdir docker
touch docker/Dockerfile
touch docker-compose.yml

# Docker will be configured for:
# - PostgreSQL (User Data Database)
# - PostgreSQL (Keycloak Database) 
# - Keycloak Server
# - Next.js Application
```

---

## 📁 Initial Project Structure Creation

```bash
# Create main directory structure for Pages Router
mkdir -p pages/{api,auth,dashboard}
mkdir -p pages/api/{auth,subjects,sessions,upload,stats}
mkdir -p src/{components,lib,contexts,types,utils}
mkdir -p src/components/{ui,dashboard,forms,charts}
mkdir -p src/styles/modules
mkdir -p sql/{migrations,seeds}
mkdir -p public/{locales,images}
mkdir -p public/locales/{en,de}
mkdir -p docker
mkdir -p docs
mkdir -p tests/{e2e,unit,integration}

# Create initial files
touch src/lib/{db.ts,auth.ts,utils.ts,email.ts}
touch src/types/{index.ts,database.ts,api.ts}
touch src/contexts/{QuizAppContext.tsx,ChatContext.tsx}
touch sql/{schema.sql,seed.sql}
touch pages/_app.tsx
touch pages/_document.tsx
touch src/styles/globals.css
```

### Initial File Contents

#### `src/lib/utils.ts`
```typescript
import clsx, { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function calculateXP(minutes: number, onTime: boolean, streak: number): number {
  const baseXP = minutes * 2
  const streakBonus = streak * 5
  const punctualityBonus = onTime ? 20 : 0
  return baseXP + streakBonus + punctualityBonus
}

export function getLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1
}
```

#### `src/types/index.ts`
```typescript
export interface User {
  id: string
  email: string
  name: string
  level: number
  xp: number
  streak: number
  totalHours: number
  createdAt: Date
}

export interface Subject {
  id: string
  userId: string
  name: string
  color: string
  startDate: Date
  examDate: Date
  hoursPerWeek: number
  daysPerWeek: number
  intensityWeeks: number
  completedHours: number
  targetHours: number
}

export interface LearningSession {
  id: string
  subjectId: string
  userId: string
  date: Date
  duration: number
  completed: boolean
  points: number
  notes?: string
}

export interface Achievement {
  id: string
  userId: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
}
```

#### `sql/schema.sql`
```sql
-- User Data Database Schema
CREATE DATABASE lernplaner;

-- Users table (linked to Keycloak)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  keycloak_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  start_date DATE NOT NULL,
  exam_date DATE NOT NULL,
  hours_per_week INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL,
  intensity_weeks INTEGER DEFAULT 2,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule templates table
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

-- Achievements table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_subject_id ON sessions(subject_id);
CREATE INDEX idx_sessions_date ON sessions(date);
```

---

## 🔧 Environment Configuration

### 1. Environment Variables Setup

#### `.env.local` (Development)
```env
# User Data Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lernplaner
DB_USER=postgres
DB_PASSWORD=postgres

# Keycloak Database 
KEYCLOAK_DB_HOST=localhost
KEYCLOAK_DB_PORT=5433
KEYCLOAK_DB_NAME=keycloak
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=keycloak

# Keycloak Configuration
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_ISSUER=http://localhost:8080/realms/lernplaner

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Development flags
NODE_ENV=development
```

#### `.env.example`
```env
# Copy this file to .env.local and fill in your values

# User Data Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lernplaner
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Keycloak Database Configuration
KEYCLOAK_DB_HOST=localhost
KEYCLOAK_DB_PORT=5433
KEYCLOAK_DB_NAME=keycloak
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=keycloak-password

# Keycloak Authentication
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=your-client-secret
KEYCLOAK_ISSUER=http://localhost:8080/realms/lernplaner

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-string

# Email Configuration (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@example.com
SMTP_PASS=smtp-password

# File Upload Settings
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 2. Configuration Files

#### `next.config.js`
```javascript
const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    domains: [],
  },
  // API routes configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
  // CSS Modules configuration
  cssModules: true,
  // Webpack configuration for file uploads
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
}

module.exports = nextConfig
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color scheme for gamification
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Gamification specific colors
        xp: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        streak: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
        }
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        },
        'pulse-xp': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-xp': 'pulse-xp 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
```

#### `package.json` Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up -d",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up -d",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test"
  }
}
```

---

## 🛠 Development Tools Setup

### 1. Code Quality Tools

#### `.eslintrc.json`
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

#### `.prettierrc`
```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 2. Testing Configuration

#### `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 🚀 Initial Deployment Setup

### 1. Vercel Configuration

#### `vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### 2. GitHub Actions for CI/CD

#### `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
```

---

## 📝 Development Workflow Commands

### Initial Setup Commands (Run Once)

```bash
# 1. Clone and setup project
git clone https://github.com/yourusername/lernplaner.git
cd lernplaner

# 2. Install all dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your database and Keycloak configuration

# 4. Start Docker services (PostgreSQL + Keycloak)
docker-compose up -d

# 5. Setup database
npm run db:migrate
npm run db:seed

# 6. Run development server
npm run dev
```

### Daily Development Commands

```bash
# Start development server
npm run dev

# Docker operations
npm run docker:dev        # Start development services
docker-compose logs -f    # View service logs

# Database operations
npm run db:migrate        # Run database migrations
npm run db:seed           # Seed database with sample data

# Code quality
npm run lint              # Run ESLint
npm run type-check        # TypeScript checking
npm run test              # Unit tests
npm run test:e2e          # E2E tests
```

### Production Commands

```bash
# Build for production
npm run build
npm start

# Database migrations (production)
npx prisma migrate deploy
```

---

## ✅ Setup Verification Checklist

### Repository Setup
- [ ] Repository created on GitHub with correct name and description
- [ ] Branch protection rules configured for main branch
- [ ] Issue labels created for project workflow
- [ ] README.md and documentation files added

### Development Environment
- [ ] Next.js 14 project initialized successfully
- [ ] All required dependencies installed without errors
- [ ] TypeScript configuration working correctly
- [ ] Tailwind CSS and shadcn-ui components available

### Database & Authentication
- [ ] PostgreSQL database connected successfully
- [ ] Prisma schema generated and synced
- [ ] NextAuth.js configuration complete
- [ ] Environment variables configured correctly

### Development Tools
- [ ] ESLint and Prettier working correctly
- [ ] Storybook running and accessible
- [ ] Playwright E2E tests configured
- [ ] Git hooks setup for code quality

### Deployment Ready
- [ ] Vercel configuration files present
- [ ] CI/CD pipeline configured
- [ ] Environment variables documented
- [ ] Build process working without errors

---

## 🎯 Next Steps After Setup

1. **Create Issues**: Use the GitHub issues templates from `github-issues.md`
2. **Start Development**: Follow the frontend-first roadmap from `frontend-first-roadmap.md`
3. **Setup Monitoring**: Configure error tracking and analytics
4. **Team Onboarding**: Share setup documentation with team members

---

*Your Lernplaner repository is now ready for development! 🚀*