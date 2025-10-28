# 🎓 Lernplaner - Gamified Learning Management Platform

> Gamifizierte Lernplattform mit XP-System, Streaks und intelligentem Scheduling für strukturiertes und motivierendes Lernen.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📝 Recent Updates

### 2025-10-27 - Feedback System Integration (Session 3)
**Implemented comprehensive feedback system for learning reflection:**

**UPDATE:** Fixed basePath issue for production deployment
- Added basePath prefix (`/dias_test/lernplaner`) to all fetch() calls
- Pattern: `const basePath = process.env.NODE_ENV === 'production' ? '/dias_test/lernplaner' : '';`
- Fixed files: `useFeedbackCooldown.tsx`, `LernplanFeedbackModal.tsx`, `feedback-dashboard-lernplaner.tsx`
- **UPDATE 2:** Fixed NextAuth basePath configuration in `_app.tsx`
- Added `basePath={authBasePath}` prop to SessionProvider to fix `/api/auth/session` 502 errors
- **Status:** Ready for production testing (rebuild required)

**New Feature: Lernreflexion Feedback**
- Question: "DIAS unterstützt mich meinen Lernfortschritt zu reflektieren" (5-point Likert scale)
- Triggers after successful subject creation and session save
- Once-per-day cooldown to prevent feedback fatigue
- Optional anonymous feedback with comment field
- Tracks trigger action (subject_created vs session_saved)
- **New files:**
  - `/db/migrations/009_create_feedback_table.sql` - Database schema
  - `/src/components/LernplanFeedbackModal.tsx` - Feedback modal component
  - `/src/hooks/useFeedbackCooldown.tsx` - Cooldown logic hook
  - `/src/pages/api/feedback/submit.ts` - Feedback submission endpoint
  - `/src/pages/api/feedback/check-submission.ts` - Cooldown check endpoint
  - `/src/pages/api/admin/lernplan-auth.ts` - Admin authentication
  - `/src/pages/api/admin/lernplan-feedback.ts` - Admin data management
  - `/src/pages/admin/feedback-dashboard-lernplaner.tsx` - Admin dashboard
- **Modified files:**
  - `/src/components/SubjectsList.tsx` - Added feedback trigger after subject creation
  - `/src/components/CompactTimer.tsx` - Added feedback trigger after session save
  - `/.env.local` - Added admin credentials

**Admin Dashboard Features:**
- URL: `/admin/feedback-dashboard-lernplaner`
- Authentication: Username/passkey protection (1-hour session)
- Real-time summary statistics (total submissions, avg rating, comments count, anonymous count)
- Filtering by trigger action, comment presence, date range
- Pagination support (50 items per page)
- Delete functionality with confirmation modal
- Responsive design with Tailwind CSS

**Technical Implementation:**
- Database: `lernplan_feedback` table with UNIQUE constraint on (user_sub, session_id)
- Cooldown: 24-hour limit per user (checked via API before showing modal)
- Anonymous: Optional flag to exclude user email from storage
- Authentication: Cookie-based admin session (httpOnly, secure, 1-hour expiry)
- Integration: React Portal for proper modal rendering above all content

**Impact:** Provides valuable user feedback about DIAS's effectiveness in supporting learning reflection, enabling data-driven improvements to the learning experience.

---

### 2025-10-27 - Bug Fixes (Session 1 & 2)
**Fixed thirteen critical bugs and improvements reported by users:**

1. **Streak Display UI Update (Bug #1)**
   - Added automatic streak calculation when sessions are saved
   - Created new `streakCalculator.ts` utility for consistent streak logic
   - Streak now updates immediately when a session is completed
   - Database properly tracks consecutive learning days
   - **Files modified:** `/src/utils/streakCalculator.ts` (new), `/src/pages/api/sessions/index.ts`

2. **Start Button Information Tooltip (Bug #2)**
   - Added info icon with German tooltip next to Start button
   - Tooltip text: "Schnellstart: Klicke auf den grünen 'Start'-Button, um direkt eine Lernsession zu beginnen und zu tracken. Der Tracker erscheint in der Kopfzeile und Sessions werden automatisch in deinem Kalender gespeichert, wenn sie abgeschlossen sind."
   - Hover and click interactions for better user guidance
   - **Files modified:** `/src/components/CompactTimer.tsx`

3. **Session Completion Modal Improvements (Bug #3)**
   - Fixed white text visibility issue by explicitly setting dark text colors
   - Added `text-gray-900` class to input and textarea fields
   - Improved placeholder text contrast with `placeholder-gray-400`
   - Removed Deep Work option - users must now create subjects before starting sessions
   - Added helpful message when no subjects are available
   - **Files modified:** `/src/components/SessionCompletionModal.tsx`, `/src/components/SubjectSelector.tsx`

4. **Session Toggle Authentication Fix (Bug #4)**
   - Fixed 404 error when toggling session completion checkbox in calendar
   - Replaced `getActiveUserId()` with proper NextAuth session authentication
   - All users now can toggle their own sessions correctly
   - **Files modified:** `/src/pages/api/sessions/[id].ts`

5. **Streak Not Updating on Toggle Fix (Bug #5)**
   - Fixed streak staying at 0 when toggling session checkbox
   - Replaced old `updateUserStreak()` function (calendar-based) with new `calculateStreak()` (session-based)
   - Streak now correctly recalculates when marking sessions complete/incomplete
   - **Files modified:** `/src/pages/api/sessions/[id].ts`

6. **Real-time UI Refresh After Session Save (Bug #6)**
   - UI now updates automatically without manual page refresh
   - Added event dispatching after session save (`sessionCompleted`, `statsUpdated`)
   - Added event listeners in `useUserStats` hook to refresh data automatically
   - Streak and session count update immediately in UI
   - **Files modified:** `/src/hooks/useActiveSession.tsx`, `/src/hooks/useUserStats.tsx`

7. **Statistics Tab Not Showing Tracked Sessions (Bug #7)**
   - Fixed architecture mismatch between `learning_sessions` and `calendar_sessions` tables
   - Implemented automatic calendar sync when saving tracked sessions
   - Tracked sessions now appear in both Übersicht (calendar) and Statistiken (statistics) tabs
   - Session details properly stored with start/end times for calendar display
   - **Files modified:** `/src/pages/api/sessions/index.ts`

8. **Streak Not Recalculating After Session Deletion (Bug #8)**
   - Fixed streak counter not updating when deleting all sessions
   - Added streak recalculation to DELETE endpoint
   - Streak now correctly updates to 0 when all sessions are removed
   - Consistent streak calculation across create, update, and delete operations
   - **Files modified:** `/src/pages/api/sessions/[id].ts`

9. **Duplicate Calendar Entries After Session Save (Bug #9)**
   - Fixed duplicate sessions appearing in calendar after completing tracked session
   - Removed `learning_sessions` from calendar UNION query since tracked sessions now sync to `calendar_sessions`
   - Calendar now displays only `calendar_sessions` table (includes both planned and tracked sessions)
   - Clean single-source display without duplicates
   - **Files modified:** `/src/pages/api/calendar/index.ts`

10. **Subject Selector Modal Not Scrollable (CSS Issue)**
    - Fixed modal overflow issue preventing scrolling when many subjects exist
    - Changed modal to responsive height (`max-h-[90vh]`) with proper flexbox layout
    - Subject list area now scrolls smoothly when content exceeds available space
    - Improved UX for users with many subjects
    - **Files modified:** `/src/components/SubjectSelector.tsx`

11. **Tab Navigation While Timer Running (UX Improvement)**
    - Implemented navigation blocking when active timer is running
    - Added warning modal before leaving page with active session
    - Users now see confirmation dialog with multilingual support (German/English)
    - German: "Timer läuft noch - Möchtest du wirklich fortfahren?"
    - English: "Timer still running - Do you really want to continue?"
    - Prevents accidental session loss when switching to Fächer or Statistiken tabs
    - Session data is protected until user explicitly confirms navigation
    - **Files modified:** `/src/components/Layout.tsx`, `/src/contexts/LanguageContext.tsx`

12. **XP Discrepancy Between Übersicht and Statistiken (Bug #12)**
    - Fixed XP calculation in Analytics tab to match Dashboard
    - Analytics was using simplified formula (`minutes * 2`) instead of actual XP values
    - Changed progress query to use `xp_awarded` column from `calendar_sessions`
    - Analytics "Total XP" now fetches from `users.current_xp` (authoritative source)
    - Both tabs now display consistent XP values (e.g., 1285 XP for User1)
    - **Files modified:** `/src/pages/api/analytics/index.ts`

13. **Session Completion Modal Positioning (CSS Issue)**
    - Fixed modal appearing hidden behind header/page content instead of as overlay
    - Root cause: Modal was trapped in header's DOM tree stacking context
    - Implemented React Portal (`createPortal`) to render modal at document.body level
    - Modal now appears as full-screen overlay above all page content
    - Proper centering with `min-h-screen flex items-center justify-center`
    - Dark backdrop covers entire page with modal centered in middle
    - **Files modified:** `/src/components/SessionCompletionModal.tsx`

**Impact:** These fixes ensure correct multi-user session handling, accurate streak tracking across all actions (create, update, delete), seamless real-time UI updates, proper data sync between calendar and statistics, improved user experience with scrollable and properly positioned modals, protection against accidental session loss during navigation, and consistent XP display across all tabs.

---

## 📁 Projektstruktur (Beginner-freundlich)

```
lernplan_new/
├── README.md              # Diese Datei - Projektübersicht
├── CLAUDE.md             # Anweisungen für Claude Code
│
├── docs/                 # 📚 DOKUMENTATION
│   ├── README.md         # Ausführliche Projektdokumentation  
│   ├── frontend-first-roadmap.md  # 10-Sprint Entwicklungsplan
│   └── github-issues.md  # Alle geplanten GitHub Issues
│
├── setup/               # ⚙️ SETUP & INSTALLATION
│   ├── repository-setup.md      # Komplette Setup-Anleitung
│   ├── docker-compose.yml       # Docker Services (DB + Keycloak)
│   └── docker/                  # Docker Konfigurationen
│       └── Dockerfile.dev       # Development Container
│
├── config/              # 🔧 KONFIGURATION
│   └── next-i18next.config.js  # Internationalisierung (DE/EN)
│
└── specs/               # 📋 SPEZIFIKATIONEN
    ├── idea.md          # Original Projektidee
    └── structure.md     # Technische Spezifikationen
```

## 🚀 Schnellstart

### 1. Repository klonen
```bash
git clone https://github.com/betiel-woldai/lernplan_new.git
cd lernplan_new
```

### 2. Dokumentation lesen
- **[docs/README.md](docs/README.md)** - Vollständige Projektdokumentation
- **[setup/repository-setup.md](setup/repository-setup.md)** - Detaillierte Setup-Anleitung
- **[docs/frontend-first-roadmap.md](docs/frontend-first-roadmap.md)** - Entwicklungsroadmap

### 3. Setup starten
```bash
# Alle Dependencies installieren
npm install

# Docker Services starten (PostgreSQL + Keycloak)
docker-compose -f setup/docker-compose.yml up -d

# Development Server starten
npm run dev
```

## 🎯 Nächste Schritte

1. **Setup durchführen:** Folge der Anleitung in `setup/repository-setup.md`
2. **Issues bearbeiten:** Beginne mit [Issue #1](https://github.com/betiel-woldai/lernplan_new/issues/1) (Dashboard UI)
3. **Roadmap folgen:** Nutze `docs/frontend-first-roadmap.md` für Sprint-Planung

## 🛠 Technologie-Stack

- **Frontend:** Next.js 14 (Pages Router), React 18, TypeScript, Tailwind CSS
- **Backend:** PostgreSQL, Keycloak Auth, Node.js API Routes
- **Infrastructure:** Docker Compose, Multi-Service Setup
- **Gamification:** XP-System, Levels, Badges, Streaks

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/betiel-woldai/lernplan_new/issues)
- **Dokumentation:** [docs/README.md](docs/README.md)
- **Setup-Hilfe:** [setup/repository-setup.md](setup/repository-setup.md)

---

**🎓 Für besseres Lernen - Mit Gamification zum Erfolg!**