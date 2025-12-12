# 🎓 Lernplaner - Gamified Learning Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Version](https://img.shields.io/badge/version-1.8.0-blue.svg)](CHANGELOG.md)

A gamified learning management platform with XP system, learning streaks, and intelligent scheduling. Part of the DIAS (Digital Assistant) ecosystem at Hochschule Ansbach.

🇩🇪 **[Deutsche Version](README.de.md)**

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Integration with DIAS](#-integration-with-dias)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Docker Setup](#-docker-setup-recommended)
- [Keycloak SSO](#-keycloak-sso-integration)
- [Environment Configuration](#-environment-configuration)
- [Development Guide](#-development-guide)
- [Gamification System](#-gamification-system)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🌟 Overview

Lernplaner is a **gamified learning management system** that motivates students through:
- **XP & Leveling:** Earn 10-15 XP per minute of studying, progress through 100 levels
- **Learning Streaks:** Build daily habits with consecutive study day tracking
- **Smart Scheduling:** Automatic session generation based on exam dates
- **Visual Progress:** Charts, statistics, and achievement badges

**Institution:** Hochschule Ansbach
**License:** MIT
**Version:** 1.8.0

---

## 🔗 Integration with DIAS

Lernplaner is part of the **DIAS ecosystem** and integrates seamlessly with the main DIAS frontend.

### How They Work Together

```
┌─────────────────────────────────────────┐
│         Keycloak SSO                     │
│      (Single Sign-On)                    │
└──────────┬──────────────┬────────────────┘
           │              │
           ▼              ▼
   ┌──────────────┐   ┌────────────┐
   │ DIAS Frontend│   │ Lernplaner │
   │ (Port 3001)  │   │(Port 3002) │
   └──────┬───────┘   └─────┬──────┘
          │                 │
          ▼                 ▼
   ┌──────────────┐   ┌────────────┐
   │ User Database│   │Lernplaner  │
   │  (Timer,     │   │  Database  │
   │  Lernplattf) │   │(XP,Calendar)│
   └──────────────┘   └────────────┘
```

**Key Integration Points:**
- **Single Sign-On:** Users log in once via Keycloak and access both apps
- **Shared Authentication:** Same Keycloak realm (`dias`) for unified user identity
- **Cross-Navigation:** Direct links between DIAS overview and Lernplaner
- **Unified Deployment:** Both apps run from single `docker-compose.yml` in diasv31_frontend

**Important:** Lernplaner is deployed alongside DIAS Frontend using the docker-compose.yml file located in `../diasv31_frontend/my-app/`. See [Docker Setup](#-docker-setup-recommended) below.

---

## ✨ Features

### 🎮 Gamification System

**XP & Levels:**
- Earn **10-15 XP per minute** of learning (base 10 XP + 5 XP bonus for subjects with exam dates)
- Progress through **100 levels** with German learning titles ("Lernling" → "Wissensguru" → "Lernlegende")
- Level requirements increase progressively (Level 4+ = 500 XP increments)
- Real-time XP notifications with floating toasts
- Level-up celebrations with confetti animation

**Learning Streaks:**
- Track consecutive days with at least one learning session
- Streak resets if a day is skipped
- Fire emoji display with current streak count
- Milestone achievements for streak milestones (7, 30, 100, 365 days)
- Berlin timezone (UTC+1/+2) for accurate day calculations

**Achievements & Badges:**
- **Categories:** Streak, Time, Tasks, Level
- **Unlocking System:** Threshold-based (e.g., "7-Day Streak", "100 Hours Studied")
- **Badge Display:** Emoji-based badges with unlock notifications
- **Event Logging:** All achievements logged in `gamification_events` table

### 📅 Smart Calendar & Planning

**Subject Management:**
- Create subjects with custom names and color coding (16 colors available)
- Set exam dates for deadline-driven planning
- Configure weekly hours target and study intensity
- Track completed vs. target hours per subject
- Archive or delete subjects when finished

**Intelligent Scheduling:**
- **Automatic Session Generation:** Creates study sessions based on:
  - Exam date proximity
  - Weekly hour goals
  - Study days per week
  - Session duration preferences
- **Calendar Views:** Month, week, and day views
- **Session Types:** Study, Exam, Break, Assignment
- **Drag & Drop:** Reschedule sessions visually
- **Conflict Detection:** Warns about overlapping sessions

**Terminplan Integration:**
- Import fixed appointments from DIAS terminplan (school calendar)
- Read-only terminplan events (protected by database trigger)
- User-specific terminplan sync with unique stable UUIDs
- Multi-user support (each user gets independent terminplan copy)

### ⏱️ Compact Timer

**Always-Visible Header Timer:**
- Sticky timer in header available on all pages
- One-click start for quick study sessions
- Subject selection during or after session
- Pause/resume functionality
- Session completion modal with:
  - Duration adjustment
  - Notes field
  - Subject assignment
  - XP calculation display

**Session Tracking:**
- Automatic time tracking in background
- Manual duration corrections with audit log (`manual_adjustment_reason`)
- Session types: Study, Exam, Break, Assignment
- Auto-save to calendar
- Integration with gamification (auto-awards XP)

### 📊 Analytics & Insights

**XP Progress:**
- Line charts showing XP growth over time
- Weekly/monthly/yearly breakdowns
- Progress to next level visualization
- XP bar with percentage complete

**Session Statistics:**
- Total hours studied (all-time and period-specific)
- Session count and averages
- Subject-wise time distribution
- Completion rates for planned vs. actual sessions

**Subject Performance:**
- Time spent per subject comparison (bar charts)
- Progress toward subject hour goals
- Exam date proximity indicators
- Subject completion percentages

**Streak Monitoring:**
- Current streak display
- Longest streak record
- Streak history calendar heatmap
- Daily activity patterns

### 🎨 User Experience

**Design & Interface:**
- **Responsive:** Fully functional on desktop, tablet, and mobile
- **Dark Mode:** Built-in dark mode support
- **German Language:** Native German interface with i18n support
- **Smooth Animations:** Canvas confetti, slide transitions, fade effects
- **Color Picker:** Intuitive color selection for subjects
- **Context Menus:** Right-click actions for quick operations

**Feedback System:**
- Daily reflection modal: "DIAS unterstützt mich beim Selbstmanagement" (1-5 Likert scale)
- Optional comments with anonymous submission option
- 24-hour cooldown per user
- Admin dashboard for feedback review with filters and statistics

---

## 🚀 Quick Start

### Option 1: Docker Setup with DIAS (Recommended)

Lernplaner is designed to run alongside DIAS Frontend. Follow these steps:

```bash
# 1. Clone both repositories
mkdir dias-project && cd dias-project
git clone https://github.com/dias-digitial-assistant/diasv31_frontend.git
git clone https://github.com/dias-digitial-assistant/lernplaner.git

# 2. Navigate to docker-compose location
cd diasv31_frontend/my-app

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Create Docker network
docker network create app_network

# 5. Start all services (DIAS + Lernplaner + Databases)
docker-compose up -d --build

# 6. Access Lernplaner
# http://localhost:3002
```

**See full Docker setup instructions in [Docker Setup](#-docker-setup-recommended) section.**

### Option 2: Standalone Local Development

```bash
# 1. Clone repository
git clone https://github.com/dias-digitial-assistant/lernplaner.git
cd lernplaner

# 2. Install dependencies
npm install

# 3. Set up PostgreSQL database
createdb lernplaner_data
# Run migrations (see Database Setup section)

# 4. Configure environment
cp .env.example .env
# Edit .env with database and Keycloak credentials

# 5. Start development server
npm run dev
# → http://localhost:3000
```

**Note:** Standalone mode requires manual Keycloak setup for authentication.

---

## 🐳 Docker Setup (Recommended)

### Architecture

Lernplaner is part of the DIAS docker-compose setup located in `../diasv31_frontend/my-app/docker-compose.yml`.

**Services in docker-compose.yml:**

| Service | Purpose | Port |
|---------|---------|------|
| **lernplaner_frontend** | Lernplaner Next.js app | 3002:3000 |
| **lernplaner_postgres** | Lernplaner database | 5432 (internal) |
| **web_test** | DIAS Frontend | 3001:3000 |
| **user_postgres** | DIAS user database | 5432 (internal) |
| **postgres** | Keycloak database | 5432 (internal) |

### Docker Configuration

**lernplaner_frontend service:**
```yaml
lernplaner_frontend:
  container_name: dias_lernplaner_frontend
  build:
    context: ../../lernplaner  # Builds from lernplaner directory
    dockerfile: Dockerfile.prod
  ports:
    - '3002:3000'
  depends_on:
    - lernplaner_postgres
  environment:
    - DATABASE_HOST=dias_lernplaner_postgres
    - DATABASE_NAME=lernplaner_data
    - DATABASE_USER=lernplaner_user
    - DATABASE_PASSWORD=${LERNPLANER_DB_PASSWORD}
    - KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID}
    - KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET}
    - KEYCLOAK_ISSUER=${KEYCLOAK_ISSUER}
    - NEXTAUTH_URL=https://your-domain.com/lernplaner
    - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
  networks:
    - app_network
```

**lernplaner_postgres service:**
```yaml
lernplaner_postgres:
  image: postgres:15
  container_name: dias_lernplaner_postgres
  environment:
    POSTGRES_DB: lernplaner_data
    POSTGRES_USER: lernplaner_user
    POSTGRES_PASSWORD: ${LERNPLANER_DB_PASSWORD}
  volumes:
    - lernplaner_postgres_data:/var/lib/postgresql/data
    - ./init-lernplaner-db.sql:/docker-entrypoint-initdb.d/init-lernplaner-db.sql
  networks:
    - app_network
```

### Docker Commands

```bash
# Start Lernplaner only
cd diasv31_frontend/my-app
docker-compose up -d lernplaner_frontend lernplaner_postgres

# Start all services (DIAS + Lernplaner)
docker-compose up -d

# View Lernplaner logs
docker-compose logs -f lernplaner_frontend

# Restart Lernplaner
docker-compose restart lernplaner_frontend

# Rebuild after code changes
docker-compose up -d --build lernplaner_frontend

# Access database
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data

# Stop all services
docker-compose down
```

---

## 🔐 Keycloak SSO Integration

Lernplaner uses Keycloak for authentication and shares SSO with DIAS Frontend.

### Why Keycloak?

- **Single Sign-On:** Users log in once and access both DIAS and Lernplaner
- **Centralized Users:** User management in one place
- **Security:** Industry-standard OAuth2/OpenID Connect
- **User Isolation:** Data separated by Keycloak user ID (`user_sub`)

### Keycloak Configuration

**Prerequisites:**
- Keycloak instance running (e.g., at `https://your-domain.com/keycloak`)
- Realm created (e.g., `dias`)
- OAuth2 client configured

**Client Setup:**
1. Create client in Keycloak admin console
2. **Client ID:** `dias` (can be shared with DIAS Frontend) or `lernplaner-client`
3. **Client Type:** OpenID Connect
4. **Client Authentication:** ON
5. **Valid Redirect URIs:**
   - `http://localhost:3002/api/auth/callback/keycloak`
   - `https://your-domain.com/dias_test/lernplaner/api/auth/callback/keycloak`
6. **Web Origins:** `http://localhost:3002` or your production domain

**Environment Variables:**
```env
KEYCLOAK_CLIENT_ID=dias
KEYCLOAK_CLIENT_SECRET=<from_keycloak_credentials_tab>
KEYCLOAK_ISSUER=https://your-domain.com/keycloak/realms/your-realm
```

### Authentication Flow

1. User navigates to Lernplaner (`http://localhost:3002`)
2. NextAuth.js checks for existing session
3. If no session, redirects to Keycloak login
4. User authenticates with Keycloak
5. Keycloak redirects back with authorization code
6. NextAuth exchanges code for JWT token
7. User profile created/updated in `users` table (auto-initialization)
8. Session stored with `user_sub` as primary identifier

**Session Management:**
- JWT-based sessions (maxAge: 1 hour)
- Secure cookies with `httpOnly` and `sameSite` flags
- Session scoped to `/dias_test/lernplaner` path
- Automatic user initialization on first login

**Detailed Keycloak setup:** See [diasv31_frontend README](../diasv31_frontend/my-app/README.md#-keycloak-setup)

---

## ⚙️ Environment Configuration

Create `.env` file in `lernplaner/` root:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_HOST=localhost            # or dias_lernplaner_postgres (Docker)
DATABASE_PORT=5432
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=your_secure_password

# ============================================
# NEXTAUTH CONFIGURATION
# ============================================
# NextAuth URL (must match deployment)
NEXTAUTH_URL=http://localhost:3000/api/auth  # Development
# NEXTAUTH_URL=https://your-domain.com/lernplaner  # Production

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_generated_secret_key

# ============================================
# KEYCLOAK OAUTH2/OIDC
# ============================================
KEYCLOAK_CLIENT_ID=dias               # or lernplaner-client
KEYCLOAK_CLIENT_SECRET=your_client_secret
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# ============================================
# OPTIONAL: FEEDBACK ADMIN DASHBOARD
# ============================================
FEEDBACK_ADMIN_USERNAME=admin
FEEDBACK_ADMIN_PASSKEY=your_admin_password

# ============================================
# DEVELOPMENT ONLY (optional)
# ============================================
NEXT_PUBLIC_DEFAULT_USER_ID=demo-user-123
DEFAULT_USER_ID=demo-user-123
```

### Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_HOST` | Yes | localhost | PostgreSQL host |
| `DATABASE_PASSWORD` | Yes | - | Database password |
| `NEXTAUTH_URL` | Yes | - | NextAuth callback URL |
| `NEXTAUTH_SECRET` | Yes | - | Secret for JWT encryption |
| `KEYCLOAK_CLIENT_ID` | Yes | - | OAuth2 client ID |
| `KEYCLOAK_CLIENT_SECRET` | Yes | - | OAuth2 client secret |
| `KEYCLOAK_ISSUER` | Yes | - | Keycloak realm URL |
| `FEEDBACK_ADMIN_USERNAME` | No | admin | Admin dashboard username |
| `FEEDBACK_ADMIN_PASSKEY` | No | - | Admin dashboard password |

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate DATABASE_PASSWORD
openssl rand -base64 24

# Generate FEEDBACK_ADMIN_PASSKEY
openssl rand -base64 20
```

---

## 💻 Development Guide

### Local Development Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL (via Docker or local instance)
docker-compose -f docker-compose.dev.yml up -d postgres

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
# → http://localhost:3000
```

### Project Structure

```
lernplaner/
├── src/
│   ├── pages/              # Next.js pages and API routes
│   │   ├── index.tsx       # Main dashboard
│   │   ├── subjects.tsx    # Subject management
│   │   ├── analytics.tsx   # Analytics page
│   │   └── api/            # Backend API endpoints
│   ├── components/         # React components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── Calendar/       # Calendar components
│   │   ├── CompactTimer.tsx  # Header timer
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useActiveSession.tsx
│   │   ├── useGamification.tsx
│   │   └── ...
│   ├── lib/                # Utility libraries
│   │   ├── db.ts           # PostgreSQL connection pool
│   │   ├── apiClient.ts    # API request wrapper
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── contexts/           # React Context providers
├── db/
│   └── migrations/         # SQL migration files (001-009)
├── docs/                   # Documentation
├── tests/                  # Playwright E2E tests
└── scripts/                # Database management scripts
```

### Key Files

- **`src/pages/api/auth/[...nextauth].ts`** - NextAuth.js configuration
- **`src/lib/db.ts`** - PostgreSQL connection pool (max 10 connections)
- **`src/utils/formatters.ts`** - XP/level calculations
- **`src/utils/streakCalculator.ts`** - Streak logic
- **`db/migrations/`** - Database schema migrations (9 files)

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run watch:dev

# Run E2E tests
npm run test
npm run test:session  # Session/calendar tests specifically

# Database operations
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:reset      # Reset database
```

---

## 🎮 Gamification System

### XP Calculation

**Formula:**
```
XP earned = minutes * base_rate + bonus
where:
  base_rate = 10 XP/min
  bonus = 5 XP/min (if subject has exam date)

Example:
  30 min study session (no exam date): 30 * 10 = 300 XP
  30 min study session (with exam date): 30 * 15 = 450 XP
```

**Implementation:** `src/utils/formatters.ts`

### Level System

**Level Progression:**
- **Level 1:** 0-100 XP
- **Level 2:** 100-500 XP (400 XP needed)
- **Level 3:** 500-1000 XP (500 XP needed)
- **Level 4+:** +500 XP per level

**Examples:**
- Level 5: 2000 XP
- Level 10: 4500 XP
- Level 20: 9500 XP
- Level 50: 24,500 XP
- Level 100: 49,500 XP

**Level Titles (German):**
```
Level 1-5: Lernling (Learner)
Level 6-10: Wissensjäger (Knowledge Hunter)
Level 11-20: Studienkönig (Study King)
Level 21-50: Weiser (Sage)
Level 51-99: Wissensguru (Knowledge Guru)
Level 100: Lernlegende (Learning Legend)
```

### Streak Calculation

**Algorithm:**
1. Fetch all completed learning sessions for user
2. Extract unique session dates (multiple sessions same day = 1 streak day)
3. Sort dates in descending order
4. Check if today or yesterday has a session (otherwise streak = 0)
5. Count consecutive days backward from today

**Timezone:** Berlin (UTC+1 standard, UTC+2 daylight saving)

**Implementation:** `src/utils/streakCalculator.ts`

### Achievement System

**Categories:**
- **Streak:** Daily consistency (7, 30, 100, 365 days)
- **Time:** Total hours (10h, 50h, 100h, 500h)
- **Level:** Progression (Level 10, 25, 50, 100)
- **Tasks:** Completion count (50, 100, 500, 1000 sessions)

**Unlocking:**
- Automatic checks after XP award or session completion
- Threshold-based (e.g., "First Session" unlocks on session 1)
- Event logging in `gamification_events` table
- UI notification with "New" badge

---

## 📖 API Documentation

### Authentication

All API routes require authentication:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.sub; // Keycloak user ID
  // ... handle request
}
```

### Key Endpoints

#### Sessions

```bash
# List sessions
GET /api/sessions?limit=10&offset=0

# Create session
POST /api/sessions
Body: { subject_id: "uuid", duration: 60, completed: true, notes: "..." }

# Update session
PUT /api/sessions/[id]
Body: { duration: 90, notes: "Updated notes" }

# Delete sessions
DELETE /api/sessions/bulk-delete
Body: { session_ids: ["uuid1", "uuid2"] }
```

#### Subjects

```bash
# List subjects
GET /api/subjects

# Create subject
POST /api/subjects
Body: { name: "Math", color: "#FF6B6B", exam_date: "2024-06-15", hours_per_week: 10 }

# Update subject
PUT /api/subjects/[id]
Body: { name: "Mathematics", color: "#4ECDC4" }

# Delete subject
DELETE /api/subjects/[id]
```

#### Calendar

```bash
# Get calendar sessions
GET /api/calendar?start=2024-01-01&end=2024-12-31

# Create calendar session
POST /api/calendar
Body: { subject_id: "uuid", start_time: "2024-06-01T10:00", end_time: "2024-06-01T11:00", session_type: "study" }

# Update calendar session
PUT /api/calendar/[id]

# Delete calendar session
DELETE /api/calendar/[id]
```

#### Gamification

```bash
# Award XP
POST /api/gamification/xp
Body: { xpGain: 300 }
Response: { newLevel, leveledUp, currentXP, nextLevelXP, achievements }

# Recalculate all stats (admin)
POST /api/gamification/recalculate
```

#### Analytics

```bash
# Get analytics
GET /api/analytics?period=week
Query params: period (week|month|year), start_date, end_date

Response: {
  progress: { totalXP, currentLevel, streak, totalHours },
  subjects: [ { name, time_spent, completed_hours, target_hours } ],
  streaks: { current, longest, dates },
  goals: { weekly_target, actual_hours }
}
```

#### Feedback

```bash
# Submit feedback
POST /api/feedback/submit
Body: { self_management_support: 5, comment: "Great!", trigger_action: "session_saved" }

# Check submission status
GET /api/feedback/check-submission
Response: { canSubmit: boolean, lastSubmission: date }

# Admin: Get all feedback
GET /api/admin/lernplan-feedback?page=1&limit=20&filter=all
```

---

## 🗄️ Database Schema

### Core Tables

**users**
```sql
- id (UUID, PK) - Keycloak user ID
- email (VARCHAR, UNIQUE)
- current_level (INT, default 1)
- current_xp (INT, default 0)
- next_level_xp (INT, default 100)
- learning_streak (INT, default 0)
- daily_learning_time (INT, default 0) - minutes
- total_hours (NUMERIC, default 0)
- last_active_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

**subjects**
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- name (VARCHAR)
- color (VARCHAR) - #hex format
- start_date, exam_date (DATE)
- hours_per_week, days_per_week (INT)
- intensity_weeks (INT)
- completed_hours, target_hours (NUMERIC)
- created_at, updated_at (TIMESTAMP)
```

**learning_sessions**
```sql
- id (UUID, PK)
- subject_id (UUID, FK → subjects)
- user_id (UUID, FK → users)
- date (DATE)
- duration (INT) - minutes
- completed (BOOLEAN)
- points (INT) - XP earned
- notes, manual_adjustment_reason (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**calendar_sessions**
```sql
- id (UUID, PK)
- subject_id (UUID, FK → subjects)
- user_id (UUID, FK → users)
- title (VARCHAR)
- start_time, end_time (TIMESTAMP)
- session_type (ENUM: study|exam|break|assignment)
- completed (BOOLEAN)
- description, location (TEXT)
- is_fixed (BOOLEAN) - for terminplan
- fixed_source, fixed_source_key (VARCHAR)
- planned_duration, actual_duration (INT)
- created_at, updated_at (TIMESTAMP)
```

**achievements**
```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- icon (VARCHAR) - emoji
- category (ENUM: streak|time|tasks|level)
- threshold_value (INT, nullable)
- created_at (TIMESTAMP)
```

**user_achievements**
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- achievement_id (UUID, FK → achievements)
- unlocked_at (TIMESTAMP)
- is_new (BOOLEAN, default true)
- UNIQUE(user_id, achievement_id)
```

**gamification_events**
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- event_type (ENUM: xp_gain|level_up|achievement_unlock|streak_milestone|session_complete)
- event_data (JSONB)
- xp_awarded (INT)
- created_at (TIMESTAMP)
```

**lernplan_feedback**
```sql
- id (UUID, PK)
- user_sub (VARCHAR)
- user_email (VARCHAR)
- user_role (VARCHAR)
- self_management_support (INT) - 1-5 Likert scale
- comment (TEXT)
- is_anonymous (BOOLEAN)
- trigger_action (VARCHAR)
- session_id (UUID, nullable)
- created_at (TIMESTAMP)
- UNIQUE(user_sub, session_id) per 24 hours
```

### Indexes

40+ indexes for performance optimization on:
- user_id columns (all tables)
- date/timestamp columns
- completed flags
- Fixed appointment queries
- Composite indexes for calendar date ranges

---

## 🔧 Troubleshooting

### Issue: Container won't start

```bash
# Check if lernplaner is cloned in correct location
ls -la ../lernplaner

# Check docker-compose logs
cd ../diasv31_frontend/my-app
docker-compose logs lernplaner_frontend

# Rebuild container
docker-compose up -d --build lernplaner_frontend
```

### Issue: Database connection failed

```bash
# Check if database is running
docker-compose ps lernplaner_postgres

# Test connection
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "SELECT 1;"

# Check environment variables
docker-compose exec lernplaner_frontend env | grep DATABASE
```

### Issue: Keycloak authentication fails

```bash
# Verify Keycloak is accessible
curl http://localhost:8180/keycloak/realms/dias/.well-known/openid-configuration

# Check redirect URIs in Keycloak
# Admin Console → Clients → dias → Valid redirect URIs
# Should include: http://localhost:3002/api/auth/callback/keycloak

# Check logs
docker-compose logs -f lernplaner_frontend | grep "nextauth"
```

### Issue: XP not awarded

```bash
# Check gamification API
curl -X POST http://localhost:3002/api/gamification/xp \
  -H "Content-Type: application/json" \
  -d '{"xpGain": 100}'

# Check user XP in database
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data \
  -c "SELECT current_xp, current_level FROM users WHERE email = 'user@example.com';"
```

### Issue: Streak not updating

```bash
# Check streak calculator
# Verify Berlin timezone is correctly handled
# Check last session date matches current date

# Manually recalculate
# Call POST /api/gamification/recalculate
```

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test
4. Commit (`git commit -m 'feat: add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open Pull Request

**Commit Convention:**
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update build scripts
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

- **Hochschule Ansbach** - Institution
- **Next.js & React** - Framework
- **PostgreSQL** - Database
- **Keycloak** - Authentication
- **Chart.js** - Data visualization

---

## 📞 Support

- **GitHub Issues:** [Report bugs](https://github.com/dias-digitial-assistant/lernplaner/issues)
- **Email:** dias@hs-ansbach.de
- **Documentation:** [docs/](docs/)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Study groups & collaboration
- [ ] AI-powered study recommendations
- [ ] Integration with more university systems
- [ ] Offline mode with sync
- [ ] Advanced analytics dashboard

---

**For complete DIAS ecosystem documentation, see [diasv31_frontend README](../diasv31_frontend/my-app/README.md)**

**Made with ❤️ by the DIAS team at Hochschule Ansbach**
