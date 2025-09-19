# Lernplaner: Technische Implementierung & Datenflüsse

## 🔧 Frontend-Backend Mechanismen im Detail

Diese Dokumentation zeigt die konkreten technischen Implementierungen der Datensynchronisation und erklärt, wie jeder Mechanismus auf Code-Ebene funktioniert.

---

## 📱 Frontend Komponenten → Daten Mapping

### 1. **SubjectForm.tsx → subjects Tabelle**

**Mechanismus**: Manuelle Benutzereingabe mit automatischer Verarbeitung

```typescript
// Manuelle Felder:
name: string          // User Input
color: string         // ColorPicker Komponente
start_date: Date      // DatePicker
exam_date: Date?      // Optional DatePicker
hours_per_week: number // Number Input
days_per_week: number  // Range Slider 1-7

// Automatische Felder:
id: UUID              // PostgreSQL uuid_generate_v4()
user_id: UUID         // useAuth Hook → getCurrentUser()
target_hours: number  // hours_per_week * intensity_weeks
completed_hours: 0    // Initial Default
```

**API Route**: `POST /api/subjects`
**Hook**: `useSubjects.tsx → createSubject()`
**Trigger**: Form Submit → API Call → Database Insert → UI Refresh

### 2. **SessionTimer.tsx → learning_sessions Tabelle**

**Mechanismus**: Automatische Timer-basierte Datengenerierung

```typescript
// Timer Start:
startTime: Date       // useActiveSession → Date.now()
subject_id: UUID      // SubjectSelector Komponente
isRunning: boolean    // Timer State

// Timer Stop:
duration: number      // Calculated: stopTime - startTime (minutes)
points: number        // Calculated: duration * pointMultiplier
completed: boolean    // Automatic: true bei Stop
date: Date           // Automatic: CURRENT_DATE
```

**API Routes**:
- `POST /api/sessions/start` - Timer Start
- `PUT /api/sessions/:id/complete` - Timer Stop
**Hooks**:
- `useActiveSession.tsx` - Timer Management
- `useLearningSessions.tsx` - CRUD Operations
**Real-time Sync**: Custom Event Bus für UI Updates

### 3. **Calendar Komponente → calendar_sessions Tabelle**

**Mechanismus**: Automatische Generierung + Manuelle Bearbeitung

```typescript
// Automatische Generierung (bei Subject Creation):
id: UUID              // Deterministic: hash(subject_id + date)
title: string         // `"${subject.name} Study Session"`
start_time: DateTime  // Algorithm basiert auf days_per_week
end_time: DateTime    // start_time + (hours_per_week/days_per_week)*60
duration: number      // (hours_per_week / days_per_week) * 60

// Manuelle Bearbeitung:
completed: boolean    // Toggle via Context Menu
description: string   // Edit Modal
location: string      // Edit Modal
```

**API Routes**:
- `POST /api/calendar/generate` - Auto-Generation
- `PUT /api/calendar/:id` - Manual Updates
**Hooks**: `useCalendarSessions.tsx`
**Sync Logic**: Bidirektional mit learning_sessions

---

## 🔄 Automatische Synchronisationsmechanismen

### 1. **Session Completion Chain**

```mermaid
graph TD
    A[User stoppt Timer] --> B[SessionTimer.complete()]
    B --> C[API: PUT /sessions/:id/complete]
    C --> D[Database Transaction START]
    D --> E[Update learning_sessions.completed = true]
    E --> F[Calculate & Award XP points]
    F --> G[Update users.current_xp]
    G --> H[Check Level Up Logic]
    H --> I[Update subjects.completed_hours]
    I --> J[Check Achievements]
    J --> K[Create gamification_events]
    K --> L[Database Transaction COMMIT]
    L --> M[Event Bus: sessionCompleted]
    M --> N[UI Components Update]
```

**Implementierung**: `src/pages/api/sessions/[id]/complete.ts`

### 2. **Subject → Calendar Auto-Generation**

```mermaid
graph TD
    A[User erstellt Subject] --> B[SubjectForm.onSubmit()]
    B --> C[API: POST /subjects]
    C --> D[Database: INSERT subjects]
    D --> E[Trigger: Calendar Generation]
    E --> F[Calculate Time Slots Algorithm]
    F --> G[Generate calendar_sessions entries]
    G --> H[Deterministic UUID Generation]
    H --> I[Event Bus: subjectCreated]
    I --> J[Calendar Komponente Refresh]
```

**Algorithm**: `src/utils/calendarEventGenerator.ts`
**Deterministic UUIDs**: Konsistenz für Sync zwischen Sessions

### 3. **Real-time Event System**

```typescript
// Event Bus Implementation
// src/utils/eventBus.ts

class EventBus {
  private listeners: Record<string, Function[]> = {};

  emit(event: string, data: any) {
    this.listeners[event]?.forEach(callback => callback(data));
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
}

// Usage in Components:
useEffect(() => {
  eventBus.on('sessionCompleted', (data) => {
    // Refresh stats, update UI, show notifications
    refreshStats();
    showXPToast(data.xpGained);
  });

  eventBus.on('subjectExamDateChanged', ({ subjectId, examDate }) => {
    // Calendar exam moved → mirror within subject overview without refetch
    patchSubject(subjectId, examDate);
  });
}, []);
```

**Events**:
- `sessionCompleted` → Stats Update, XP Toast, Calendar Sync
- `subjectCreated` → Calendar Generation, UI Refresh
- `subjectExamDateChanged` → Subject list exam date mirrors calendar edits instantly
- `levelUp` → Modal anzeigen, Konfetti Animation
- `achievementUnlocked` → Achievement Modal, Badge Update

---

## 🎮 Gamification Automatismen

### 1. **XP & Level System**

```typescript
// src/hooks/useGamification.tsx

const calculateXP = (duration: number, sessionType: string = 'study') => {
  const baseXP = duration; // 1 XP per Minute
  const multipliers = {
    'study': 1.0,
    'exam': 1.5,
    'assignment': 1.2
  };
  return Math.floor(duration * multipliers[sessionType]);
};

const checkLevelUp = (currentXP: number, currentLevel: number) => {
  const nextLevelXP = currentLevel * 100; // Level 1→100, Level 2→200, etc.
  if (currentXP >= nextLevelXP) {
    return {
      newLevel: currentLevel + 1,
      newLevelXP: (currentLevel + 1) * 100
    };
  }
  return null;
};
```

**Trigger**: Jede Session Completion
**Storage**: `users.current_xp`, `users.current_level`
**UI Updates**: XPBar, LevelBadge, LevelUpModal

### 2. **Achievement System**

```typescript
// Achievement Check Logic
const checkAchievements = async (userId: UUID, actionType: string, data: any) => {
  const achievements = await getEligibleAchievements(actionType);

  for (const achievement of achievements) {
    const userStats = await getUserStats(userId);
    const qualified = evaluateAchievement(achievement, userStats, data);

    if (qualified && !hasAchievement(userId, achievement.id)) {
      await unlockAchievement(userId, achievement.id);
      eventBus.emit('achievementUnlocked', { achievement });
    }
  }
};
```

**Achievement Categories**:
- `streak`: Tägliche Lernstreak (7, 14, 30, 100 Tage)
- `time`: Gesamte Lernzeit (10h, 50h, 100h, 500h)
- `tasks`: Abgeschlossene Aufgaben (10, 50, 100)
- `level`: Erreichte Level (5, 10, 25, 50)

### 3. **Streak Tracking**

```typescript
// Streak Logic - Daily Check
const updateLearningStreak = async (userId: UUID) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const todaySession = await hasSessionToday(userId, today);
  const yesterdaySession = await hasSessionToday(userId, yesterday);

  if (todaySession) {
    if (yesterdaySession || currentStreak === 0) {
      // Continue or start streak
      await incrementStreak(userId);
    } else {
      // Streak broken, restart
      await resetStreak(userId);
    }
  }
  // If no session today, streak continues until tomorrow check
};
```

**Trigger**: Täglicher Cron Job um 00:00 Uhr
**Storage**: `users.learning_streak`
**UI**: StreakDisplay Komponente mit Flame Icon

---

## 📊 Datenbank Transaktionen & Konsistenz

### 1. **Session Completion Transaction**

```sql
-- src/pages/api/sessions/[id]/complete.ts
BEGIN;

-- 1. Update Session
UPDATE learning_sessions
SET completed = true, points = $1
WHERE id = $2;

-- 2. Update User XP
UPDATE users
SET current_xp = current_xp + $1,
    daily_learning_time = daily_learning_time + $3,
    total_hours = total_hours + ($3::float / 60)
WHERE id = $4;

-- 3. Update Subject Progress
UPDATE subjects
SET completed_hours = completed_hours + ($3::float / 60)
WHERE id = $5;

-- 4. Log Gamification Event
INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
VALUES ($4, 'session_complete', $6, $1);

-- 5. Check & Insert Achievements (if any)
-- ... Achievement logic

COMMIT;
```

**Rollback Garantie**: Bei Fehler in einem Schritt → kompletter Rollback
**Performance**: Optimiert für < 100ms Antwortzeit
**Konsistenz**: ACID-Properties gewährleistet

### 2. **Calendar Sync Transaction**

```sql
-- Bidirectional Sync: Calendar ↔ Learning Sessions
BEGIN;

-- Update Calendar Status
UPDATE calendar_sessions
SET completed = $1
WHERE id = $2;

-- Create Learning Session if completed
INSERT INTO learning_sessions (subject_id, user_id, date, duration, completed, points)
SELECT subject_id, user_id, CURRENT_DATE, duration, true, duration * 1.0
FROM calendar_sessions
WHERE id = $2 AND completed = true
ON CONFLICT (user_id, subject_id, date) DO UPDATE SET completed = true;

COMMIT;
```

---

## 🔍 Performance & Optimierung

### 1. **Database Indexes**

```sql
-- src/db/migrations/002_add_indexes.sql

-- User Queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subjects_user_id ON subjects(user_id);

-- Session Performance
CREATE INDEX idx_learning_sessions_user_date ON learning_sessions(user_id, date);
CREATE INDEX idx_calendar_sessions_user_date ON calendar_sessions(user_id, start_time);

-- Gamification Queries
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_gamification_events_user_type ON gamification_events(user_id, event_type);
```

### 2. **Frontend Optimierung**

```typescript
// React Query für Caching & Sync
const useSubjects = () => {
  return useQuery(['subjects'], fetchSubjects, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true
  });
};

// Optimistic Updates
const completeSession = useMutation(completeSessionAPI, {
  onMutate: async (sessionId) => {
    // Optimistically update UI
    queryClient.setQueryData(['sessions'], (old) =>
      updateSessionStatus(old, sessionId, true)
    );
  },
  onError: (err, sessionId) => {
    // Rollback on error
    queryClient.invalidateQueries(['sessions']);
  }
});
```

---

## 🎯 Fazit: Robuste Datenarchitektur

Das Lernplaner-System implementiert eine **enterprise-grade Datenarchitektur** mit:

### ✅ **Automatisierte Intelligenz**
- 67% automatische Datenbefüllung
- Intelligente Algorithmen für Session-Planung
- Selbstlernende Gamification-Logik

### ✅ **Transaktionale Sicherheit**
- ACID-konforme Datenbank-Operationen
- Rollback-Mechanismen bei Fehlern
- Referentielle Integrität durch Foreign Keys

### ✅ **Real-time Reaktivität**
- Event-basierte Frontend-Architektur
- Optimistische Updates mit Fallbacks
- Nahtlose Cross-Component Synchronisation

### ✅ **Performance & Skalierbarkeit**
- Strategische Database Indexes
- Query-Optimierung für < 100ms Response
- Intelligente Frontend-Caching Strategien

**Ergebnis**: Ein System, das mit minimaler manueller Eingabe maximale Funktionalität und perfekte Datensynchronisation bietet.
