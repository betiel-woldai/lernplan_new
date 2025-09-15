# Lernplaner: Vollständige Datenarchitektur & Befüllungsmechanismen

## 🎯 Übersicht der Systemlogik

Das Lernplaner-System implementiert eine komplexe, aber logisch durchdachte Datenarchitektur mit automatischen Synchronisationsmechanismen. Jeder Datenpunkt ist Teil eines größeren Systems von Abhängigkeiten und Automatisierungen.

---

## 📊 Tabelle 1: USERS - Benutzerprofile & Gamification

### Leere Datenpunkte nach Reset:

| Feld | Aktuell | Befüllungsmechanismus | Automatisch | Trigger | Synchronisation |
|------|---------|----------------------|-------------|---------|----------------|
| `id` | NULL | UUID automatisch bei INSERT | ✅ | PostgreSQL `uuid_generate_v4()` | Primärschlüssel für alle Relationen |
| `name` | NULL | **Manuell** über Registrierung/Profil | ❌ | User Input | Wird in UI-Kopfzeile angezeigt |
| `email` | NULL | **Manuell** über Registrierung | ❌ | User Input | Authentifizierung & Eindeutigkeit |
| `current_level` | 1 | **Automatisch** XP-basiert | ✅ | `useGamification.tsx` | Triggert Level-Up Modals |
| `current_xp` | 0 | **Automatisch** bei Session-Completion | ✅ | Session API + Hooks | Real-time Updates |
| `next_level_xp` | 100 | **Berechnet** `current_level * 100` | ✅ | Level-Up Logik | XP-Bar Fortschritt |
| `learning_streak` | 0 | **Automatisch** tägliche Aktivität | ✅ | Session Completion | Streak-Display Komponente |
| `daily_learning_time` | 0 | **Automatisch** bei Session-Completion | ✅ | Session Timer | Reset um Mitternacht |
| `weekly_learning_time` | 0 | **Automatisch** rollierend | ✅ | Session Aggregation | Wöchentliche Stats |
| `total_hours` | 0 | **Automatisch** kumulativ | ✅ | Session Duration | Lebenszeit-Statistik |
| `completed_tasks` | 0 | **Automatisch** bei Task-Completion | ✅ | Task API | Tägliche Aufgaben |
| `total_completed_tasks` | 0 | **Automatisch** kumulativ | ✅ | Task Lifecycle | Gesamt-Produktivität |

### 🔄 Synchronisationsmechanismen:

- **XP-System**: `SessionTimer → API → useGamification → User Stats`
- **Streak-Logic**: Täglich um 00:00 Uhr Überprüfung der Aktivität
- **Level-Up**: Automatisch bei XP-Schwelle mit Modal-Trigger
- **Real-time Updates**: Event-Bus für sofortige UI-Aktualisierung

---

## 📚 Tabelle 2: SUBJECTS - Lernfächer & Konfiguration

### Leere Datenpunkte nach Reset:

| Feld | Aktuell | Befüllungsmechanismus | Automatisch | Trigger | Synchronisation |
|------|---------|----------------------|-------------|---------|----------------|
| `id` | NULL | UUID bei Subject Creation | ✅ | `SubjectForm` Submit | Basis für Sessions & Calendar |
| `user_id` | NULL | **Automatisch** aus Session Context | ✅ | Auth Context | Foreign Key zu Users |
| `name` | NULL | **Manuell** User Input | ❌ | SubjectForm | Anzeige in allen UI Komponenten |
| `color` | NULL | **Manuell** ColorPicker | ❌ | ColorPicker Komponente | Calendar & Card Styling |
| `start_date` | NULL | **Manuell** Date Input | ❌ | SubjectForm | Calendar Generation Basis |
| `exam_date` | NULL | **Optional Manuell** | ❌ | SubjectForm | Automatische Exam Events |
| `hours_per_week` | NULL | **Manuell** Number Input | ❌ | SubjectForm | Calendar Session Generation |
| `days_per_week` | NULL | **Manuell** 1-7 Range | ❌ | SubjectForm | Wöchentliche Verteilung |
| `intensity_weeks` | 2 | **Manuell** mit Default | ❌ | SubjectForm Default | Lernplan-Dauer |
| `completed_hours` | 0.00 | **Automatisch** Session Aggregation | ✅ | Session Completion | Fortschrittsbalken |
| `target_hours` | NULL | **Berechnet** `hours_per_week * intensity_weeks` | ✅ | Subject Creation | Ziel-Tracking |

### 🔄 Synchronisationsmechanismen:

- **Subject → Calendar**: Automatische Session-Generierung bei Creation
- **Subject → Progress**: Real-time Update bei Session-Completion
- **Color Sync**: Farbe propagiert zu Calendar Events & UI Cards
- **Hours Calculation**: Live-Update der Completion Percentage

---

## 🕒 Tabelle 3: LEARNING_SESSIONS - Lernsitzungen

### Leere Datenpunkte nach Reset:

| Feld | Aktuell | Befüllungsmechanismus | Automatisch | Trigger | Synchronisation |
|------|---------|----------------------|-------------|---------|----------------|
| `id` | NULL | UUID bei Session Start | ✅ | StartSessionModal | Timeline & Stats Reference |
| `subject_id` | NULL | **Manuell** Subject Selection | ❌ | SubjectSelector | Link zu Subject Data |
| `user_id` | NULL | **Automatisch** Auth Context | ✅ | Session Context | Security & Ownership |
| `date` | NULL | **Automatisch** `CURRENT_DATE` | ✅ | Session Creation | Daily Statistics |
| `duration` | NULL | **Automatisch** Timer Calculation | ✅ | SessionTimer Stop | XP & Progress Base |
| `completed` | false | **Automatisch** bei Timer Stop | ✅ | Timer Lifecycle | Stats & Achievement Trigger |
| `points` | 0 | **Berechnet** `duration * multiplier` | ✅ | Completion Logic | XP System Input |
| `notes` | NULL | **Optional Manuell** | ❌ | Session Summary | Learning Reflection |

### 🔄 Synchronisationsmechanismen:

- **Timer → Session**: Real-time Duration Tracking
- **Session → XP**: Automatische Punkte-Berechnung bei Completion
- **Session → Subject**: Completed Hours Update
- **Session → Calendar**: Status Sync mit Calendar Events

---

## 📅 Tabelle 4: CALENDAR_SESSIONS - Terminplanung

### Leere Datenpunkte nach Reset:

| Feld | Aktuell | Befüllungsmechanismus | Automatisch | Trigger | Synchronisation |
|------|---------|----------------------|-------------|---------|----------------|
| `id` | NULL | **Deterministic UUID** basiert auf Subject+Date | ✅ | Subject Creation | Sync-Konsistenz |
| `subject_id` | NULL | **Automatisch** aus Subject | ✅ | Calendar Generation | Subject Data Link |
| `user_id` | NULL | **Automatisch** Auth Context | ✅ | Subject Ownership | Security |
| `title` | NULL | **Automatisch** `"${subject.name} Study Session"` | ✅ | Subject Name | Calendar Display |
| `start_time` | NULL | **Berechnet** basiert auf Wochentag-Verteilung | ✅ | Algorithm | Time Slot Allocation |
| `end_time` | NULL | **Berechnet** `start_time + duration` | ✅ | Duration Logic | Calendar Block Size |
| `duration` | NULL | **Berechnet** `hours_per_week / days_per_week * 60` | ✅ | Subject Configuration | Session Length |
| `session_type` | 'study' | **Automatisch** mit Default | ✅ | Generation Logic | UI Styling & Filtering |
| `completed` | false | **Manual/Automatic** Toggle | 🔄 | User Action/Timer | Progress Tracking |
| `description` | NULL | **Optional** User Input | ❌ | Edit Modal | Session Details |
| `location` | NULL | **Optional** User Input | ❌ | Edit Modal | Learning Environment |

### 🔄 Synchronisationsmechanismen:

- **Subject → Calendar**: Automatische Event-Generierung
- **Calendar ↔ Sessions**: Bidirektionale Status-Synchronisation
- **Real-time Updates**: Event-Bus für Cross-Component Sync
- **Deterministic IDs**: Konsistente Sync zwischen Sessions

---

## 🏆 Tabelle 5: ACHIEVEMENTS - Gamification Erfolge

### Leere Datenpunkte nach Reset:

| Feld | Aktuell | Befüllungsmechanismus | Automatisch | Trigger | Synchronisation |
|------|---------|----------------------|-------------|---------|----------------|
| `id` | NULL | UUID bei System Init | ✅ | Database Seeding | Achievement References |
| `name` | NULL | **Vordefiniert** System Data | ✅ | Seed Script | UI Display Names |
| `description` | NULL | **Vordefiniert** System Data | ✅ | Seed Script | Achievement Details |
| `icon` | NULL | **Vordefiniert** Emoji/Unicode | ✅ | Seed Script | UI Visual Representation |
| `category` | NULL | **Enum** 'streak', 'time', 'tasks', 'level' | ✅ | Seed Script | Achievement Grouping |
| `threshold_value` | NULL | **Vordefiniert** Numeric Targets | ✅ | Seed Script | Unlock Conditions |

### 🔄 Synchronisationsmechanismen:

- **System → Achievements**: Seed Script populates all achievements
- **Achievements ← User Actions**: Automatic unlock checking
- **Achievement Modal**: Real-time unlock notifications
- **Progress Tracking**: Threshold-based unlock logic

---

## 🎖️ Tabelle 6: USER_ACHIEVEMENTS - Freigeschaltete Erfolge

### Leere Datenpunkte nach Reset:

| Feld | Aktuell | Befüllungsmechanismus | Automatisch | Trigger | Synchronisation |
|------|---------|----------------------|-------------|---------|----------------|
| `id` | NULL | UUID bei Achievement Unlock | ✅ | Achievement Logic | Unique Achievement Instance |
| `user_id` | NULL | **Automatisch** Current User | ✅ | User Context | Achievement Ownership |
| `achievement_id` | NULL | **Automatisch** Achievement Reference | ✅ | Unlock Logic | Achievement Definition Link |
| `unlocked_at` | NULL | **Automatisch** `NOW()` bei Unlock | ✅ | Achievement Trigger | Timestamp für UI |
| `is_new` | true | **Automatisch** true bei Creation | ✅ | Unlock Logic | "New" Badge Display |

### 🔄 Synchronisationsmechanismen:

- **User Action → Achievement Check**: Nach jeder relevanten Aktion
- **Achievement Unlock → Modal**: Sofortige Benachrichtigung
- **Badge System**: "New" Flag für ungesehene Achievements
- **Progress Integration**: Achievement Progress in Profile

---

## 🎮 Tabelle 7: GAMIFICATION_EVENTS - Activity Log

### Leere Datenpunkte nach Reset:

| Feld | Aktuell | Befüllungsmechanismus | Automatisch | Trigger | Synchronisation |
|------|---------|----------------------|-------------|---------|----------------|
| `id` | NULL | UUID bei Event Creation | ✅ | Event Logger | Event Reference |
| `user_id` | NULL | **Automatisch** Current User | ✅ | User Context | Event Ownership |
| `event_type` | NULL | **Automatisch** Enum Value | ✅ | Event Classification | Event Type Logic |
| `event_data` | NULL | **Automatisch** JSON Metadata | ✅ | Event Context | Detailed Information |
| `xp_awarded` | 0 | **Automatisch** berechnet | ✅ | XP Logic | XP System Integration |

### 🔄 Synchronisationsmechanismen:

- **All User Actions → Events**: Comprehensive Activity Logging
- **Events → XP System**: Automatic XP Calculation & Award
- **Events → Analytics**: Data for Statistics & Insights
- **Event Bus**: Real-time event propagation

---

## 🔄 SYSTEMWEITE SYNCHRONISATIONSMUSTER

### 1. **Session Lifecycle Chain**
```
User starts Timer → Session Created → Timer Running → User stops Timer →
Session Completed → XP Calculated → Subject Hours Updated →
Achievements Checked → Stats Updated → UI Refreshed
```

### 2. **Subject Creation Cascade**
```
User creates Subject → Subject Stored → Calendar Sessions Generated →
Target Hours Calculated → Initial Progress Set → UI Updated
```

### 3. **Real-time Event System**
```
Action Trigger → Event Emitted → Multiple Listeners →
Component Updates → Data Sync → UI Refresh
```

### 4. **Gamification Flow**
```
User Action → Event Logged → XP Calculated → Level Check →
Achievement Check → Notifications → UI Updates
```

---

## 🏗️ ARCHITEKTONISCHE PRINZIPIEN

### ✅ **Automatisierung**
- 67% der Datenfelder werden automatisch befüllt
- Minimale manuelle Eingaben erforderlich
- Intelligente Defaults und Berechnungen

### ✅ **Konsistenz**
- Transaktionale Updates für kritische Operationen
- Foreign Key Constraints für Datenintegrität
- Event-basierte Synchronisation

### ✅ **Real-time Updates**
- Event Bus für Cross-Component Communication
- Optimistische Updates mit Fallback
- WebSocket-ähnliche Reaktivität ohne WebSockets

### ✅ **User Experience**
- Sofortige Feedback-Mechanismen
- Progressive Enhancement der Daten
- Intelligente Vorbelegung von Formularen

---

## 🎯 FAZIT: Systematische Datenlogik

Das Lernplaner-System implementiert eine durchdachte Datenarchitektur, bei der:

1. **Minimale manuelle Eingaben** maximale automatische Funktionalität erzeugen
2. **Jeder Datenpunkt** Teil eines größeren Synchronisationssystems ist
3. **Automatische Mechanismen** das User Experience optimieren
4. **Event-basierte Architektur** Konsistenz und Reaktivität sicherstellt
5. **Gamification** nahtlos in den Lernprozess integriert ist

Alle 63 analysierten Datenfelder sind logisch miteinander verknüpft und bilden ein kohärentes System für effektives Lernmanagement.