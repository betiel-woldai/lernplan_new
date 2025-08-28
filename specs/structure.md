## Entwicklungsanleitung: Gamifizierte Multi-Fächer Lernplattform

> 📁 **Hinweis:** Diese Datei befindet sich jetzt in `specs/structure.md` für bessere Organisation.

Entwicklung einer interaktiven Lernplattform mit Gamification-Elementen, automatischer Lernplan-Generierung und intelligentem Tracking-System. Die Plattform ermöglicht das Management mehrerer Fächer mit automatischer Intensitätssteigerung vor Prüfungen.

### Core Architecture

**Dashboard System**
- **Statistics Module**: Real-time Lernzeit-Tracking, erledigte Aufgaben, Streak-Counter, Level-Progress (XP-System)
- **Calendar Integration**: Monats-/Wochenansicht mit farbcodierten Fächern und automatischem Import fester Termine
- **Daily Learning Plan**: Zeitgeblockte Sessions mit Fortschrittsbalken und Check-In System
- **Gamification Engine**: Punkte, Badges, Level 1-99, Achievement-System

### Feature Specifications

**Fächer-Management**
- **CRUD Operations**: Fächer anlegen/bearbeiten/löschen
- **Fach-Attribute**: 
  - Name, Farbcode, Start-/Prüfungsdatum
  - Wochenstunden, Lerntage, Intensitätssteigerung (letzte X Wochen)
- **Auto-Scheduling**: Automatische Kalender-Population basierend auf Fach-Einstellungen
- **Catch-Up Mode**: Intelligente Neuplanung bei verpassten Sessions

**Tracking & Analytics**
- **Self-Tracking**: Tages-Checkliste mit Punktevergabe
- **Progress Charts**: Geplante vs. absolvierte Stunden, Fächerverteilung
- **Statistics**: Wochen-/Monatsanalysen mit Diagrammen
- **Achievement System**: Badges für Serien, Marathon-Sessions, Meilensteine

### Technology Stack

**Frontend**
```
Framework: Next.js 14 (App Router)
UI: shadcn-ui + Tailwind CSS + Glassmorphism Design
State: Zustand + React Query
Calendar: FullCalendar or react-big-calendar
Charts: Recharts or Chart.js
Animations: Framer Motion
Push: Web Push API + Service Worker
Auth: NextAuth.js
Icons: Lucide React
```

**Backend**
```
API: Next.js API Routes + tRPC
Database: PostgreSQL + Prisma ORM
Caching: Redis (Upstash)
Push Service: Web Push Protocol
File Storage: Vercel Blob (für PDFs/ICS)
Scheduler: Vercel Cron Jobs
Real-time: Server-Sent Events
```

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  level         Int       @default(1)
  xp            Int       @default(0)
  streak        Int       @default(0)
  subjects      Subject[]
  sessions      Session[]
  achievements  Achievement[]
}

model Subject {
  id               String    @id @default(cuid())
  userId           String
  name             String
  color            String
  startDate        DateTime
  examDate         DateTime
  hoursPerWeek     Int
  daysPerWeek      Int
  intensityWeeks   Int       @default(2)
  user             User      @relation()
  sessions         Session[]
  schedules        Schedule[]
}

model Session {
  id          String    @id @default(cuid())
  subjectId   String
  userId      String
  date        DateTime
  duration    Int
  completed   Boolean   @default(false)
  points      Int       @default(0)
  subject     Subject   @relation()
  user        User      @relation()
}

model Schedule {
  id          String    @id @default(cuid())
  subjectId   String
  dayOfWeek   Int
  startTime   String
  endTime     String
  subject     Subject   @relation()
}
```

### Implementation Roadmap

**Phase 1: Core Setup**
```bash
# Initialize project
npx create-next-app@latest lernplaner --typescript --tailwind --app
cd lernplaner

# Install dependencies
npm install @prisma/client prisma @tanstack/react-query zustand
npm install @radix-ui/react-* lucide-react framer-motion
npm install fullcalendar recharts date-fns
npm install next-auth @auth/prisma-adapter
npm install web-push workbox-webpack-plugin
```

**Phase 2: Component Structure**
```
/app
  /(auth)
    /login
    /register
  /(dashboard)
    /dashboard
      /page.tsx         # Main dashboard with stats cards
    /faecher
      /page.tsx         # Subject management
    /fortschritt
      /page.tsx         # Progress analytics
    /kalender
      /page.tsx         # Calendar view with scheduler
  /api
    /trpc/[trpc]
    /push
    /schedule
```

**Phase 3: Key Features Implementation**

**Gamification System**
```typescript
// XP calculation and level progression
const calculateXP = (minutes: number, onTime: boolean, streak: number) => {
  const baseXP = minutes * 2;
  const streakBonus = streak * 5;
  const punctualityBonus = onTime ? 20 : 0;
  return baseXP + streakBonus + punctualityBonus;
};

const getLevel = (totalXP: number) => {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};
```

**Push Notifications**
```typescript
// Service Worker registration
if ('serviceWorker' in navigator && 'PushManager' in window) {
  const registration = await navigator.serviceWorker.register('/sw.js');
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
}
```

**Auto-Scheduling Algorithm**
```typescript
const generateSchedule = (subject: Subject) => {
  const weeks = differenceInWeeks(subject.examDate, new Date());
  const intensityMultiplier = weeks <= subject.intensityWeeks ? 1.5 : 1;
  const hoursPerSession = (subject.hoursPerWeek * intensityMultiplier) / subject.daysPerWeek;
  
  // Distribute sessions across preferred days
  return distributeSessionsOptimally(hoursPerSession, subject.daysPerWeek);
};
```

### UX & Microinteractions

**Glassmorphism Components**
```css
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20 rounded-xl;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

**Motivational Triggers**
- Streak animations on check-in
- Confetti on level-up
- Progress ring animations
- Tooltip hints on first interaction
- Empty state illustrations with actionable CTAs

**Real-time Updates**
- Live XP counter animation
- Session countdown timer
- Auto-save on input changes
- Optimistic UI updates with rollback

### Deployment

```bash
# Environment variables
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
REDIS_URL=

# Deploy to Vercel
vercel deploy --prod
```

### Critical Success Factors
- **Data Synchronization**: All components (Dashboard, Kalender, Fortschritt) share unified state
- **Performance**: Lazy loading, virtualization for calendar, debounced API calls
- **Motivation Loop**: Daily notifications → Check-in → Points → Badges → Level-up
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Analytics**: Track user engagement, completion rates, optimal learning times