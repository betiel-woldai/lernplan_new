# Terminplan All-Day Events Implementation Plan

## Problem Analysis

### Initial Issue
Der Benutzer hatte das Anliegen: "stelle es als ganztägig ein" - Terminplan-Termine sollten als ganztägige Events ohne Uhrzeitangaben dargestellt werden, mit weißem Hintergrund (nicht schraffiert).

### Spezifische Anforderungen
1. **Ganztägige Darstellung**: Terminplan-Termine sollen keine spezifischen Uhrzeiten anzeigen
2. **Weißer Hintergrund**: Keine Schraffierung oder farbige Hintergründe für Terminplan-Events
3. **Fixierte Termine**: Terminplan-Einträge bleiben unveränderbar und nicht verschiebbar
4. **Filterung ungültiger Daten**: Einträge ohne feste Daten (z.B. "2025-11-? (noch offen)") ignorieren

## Technische Probleme

### 1. Datenbank-Schema
- **Problem**: Fehlende `is_all_day` Spalte in `calendar_sessions` Tabelle
- **Auswirkung**: Keine Möglichkeit, ganztägige Events zu kennzeichnen

### 2. API-Rückgaben
- **Problem**: `isAllDay` Feld wurde nicht in API-Responses inkludiert
- **Auswirkung**: Frontend konnte ganztägige Events nicht erkennen

### 3. Terminplan-Import-Logik
- **Problem**: Events wurden mit spezifischen Uhrzeiten (09:00-10:00) erstellt
- **Auswirkung**: Terminplan-Events erschienen als zeitspezifische Termine

### 4. Frontend-Darstellung
- **Problem**: Alle Events zeigten Uhrzeiten in Tooltips und verwendeten farbige Hintergründe
- **Auswirkung**: Terminplan-Events waren nicht als ganztägige Events erkennbar

### 5. Fehlerhafte Datums-Verarbeitung
- **Problem**: Invalid dates wie "2025-11-? (noch offen)" verursachten "NaN" Timestamps
- **Auswirkung**: Database errors und fehlgeschlagene Terminplan-Imports

## Implementierte Lösungen

### 1. Datenbank-Migration (007_add_all_day_events.sql)
```sql
-- Neue Spalte für ganztägige Events
ALTER TABLE calendar_sessions
ADD COLUMN is_all_day BOOLEAN DEFAULT FALSE;

-- Bestehende Terminplan-Einträge als ganztägig markieren
UPDATE calendar_sessions
SET is_all_day = TRUE
WHERE is_fixed = TRUE AND fixed_source = 'terminplan';
```

### 2. TypeScript Interface Update (src/types/calendar.ts)
```typescript
export interface CalendarSession {
  // ... existing fields
  // All-day events (no specific time, shown as full-day blocks)
  isAllDay?: boolean;
}
```

### 3. API-Erweiterung (src/pages/api/calendar/index.ts)
```typescript
// Beide UNION-Query-Teile erweitert um isAllDay Feld
COALESCE(cs.is_all_day, false) as "isAllDay",
// ...
false as "isAllDay", // für learning_sessions
```

### 4. Terminplan-Import-Optimierung (src/pages/api/cron/terminplan.ts)

#### A. Ganztägige Zeitfenster
```typescript
// Geändert von spezifischen Zeiten zu ganztägigen Events
const startISO = new Date(`${d}T00:00:00+01:00`);
const endISO = new Date(`${d}T23:59:59+01:00`);
```

#### B. Verbesserte Datumsvalidierung
```typescript
// Striktere Regex-Validierung für Datumsformat
if (!d.match(/^\d{4}-\d{2}-\d{2}$/)) {
  console.log(`Skipping entry with unfixed date: "${d}"`);
  return null;
}

// Zusätzliche NaN-Checks vor Database-Operationen
if (!w || !w.startISO || !w.endISO || isNaN(w.startISO.getTime()) || isNaN(w.endISO.getTime())) {
  console.log(`Skipping entry with invalid dates: ${e.title} (${e.source_key})`);
  continue;
}
```

#### C. All-Day Flag in Database
```typescript
// INSERT/UPDATE Queries erweitert um is_all_day = TRUE
is_all_day = TRUE, updated_at = NOW()
```

### 5. Frontend-Darstellung (src/components/Calendar/CalendarGrid.tsx)

#### A. Bedingte Zeitanzeige
```typescript
// Uhrzeiten nur für Nicht-ganztägige Events anzeigen
title={`${session.title}${!session.isAllDay ? ` - ${session.startTime.toLocaleTimeString('de-DE', {
  hour: '2-digit',
  minute: '2-digit'
})}` : ''} - ${sessionStatus}`}
```

#### B. Styling für All-Day Events
```typescript
style={{
  backgroundColor: session.isAllDay
    ? '#ffffff'  // Weißer Hintergrund für ganztägige Events
    : /* andere Farben für normale Events */,
  borderLeftColor: session.isAllDay
    ? '#6B7280'  // Grauer Rand für ganztägige Events
    : /* andere Farben */,
  color: session.isAllDay
    ? '#374151'  // Dunkelgrauer Text für ganztägige Events
    : /* andere Farben */,
}}
```

## Implementierungsschritte

### ✅ Schritt 1: Datenbank-Schema
- Migration 007 erstellt und ausgeführt
- `is_all_day` Spalte zu `calendar_sessions` hinzugefügt
- Bestehende Terminplan-Einträge als ganztägig markiert

### ✅ Schritt 2: Backend-Updates
- TypeScript Interface `CalendarSession` um `isAllDay` erweitert
- API-Endpunkt `/api/calendar` um `isAllDay` Feld ergänzt
- Terminplan-Import-Logik für ganztägige Events angepasst

### ✅ Schritt 3: Verbesserte Validierung
- Regex-Validierung für Datumsformat implementiert
- NaN-Checks vor Database-Operationen hinzugefügt
- Fehlerhafte Einträge werden übersprungen

### ✅ Schritt 4: Frontend-Anpassungen
- CalendarGrid-Komponente für bedingte Zeitanzeige modifiziert
- Styling für weiße Hintergründe bei ganztägigen Events implementiert
- Tooltips ohne Uhrzeiten für All-Day Events

### ✅ Schritt 5: Terminplan-Anwendung
- POST-Request an `/api/cron/terminplan` ausgeführt
- 15 Terminplan-Einträge erfolgreich als ganztägige Events aktualisiert

## Ergebnis

### Erfolgreiche Implementation
- **15 Terminplan-Events** wurden erfolgreich als ganztägige Events konfiguriert
- **1 ungültiger Eintrag** ("2025-11-? (noch offen)") wird korrekt ignoriert
- **Weiße Hintergründe** für Terminplan-Events implementiert
- **Keine Uhrzeiten** werden für ganztägige Events angezeigt
- **Fixierte Termine** bleiben unveränderbar

### API-Status
```json
{
  "checksum": "1eysnz4",
  "applied": {
    "added": 0,
    "updated": 15,
    "removed": 0
  }
}
```

## Insights

`★ Insight ─────────────────────────────────────`
1. **All-Day Event Architecture**: Die Implementierung nutzt ein dreischichtiges System - Database-Flag (`is_all_day`), API-Transport (`isAllDay`) und Frontend-Conditional-Rendering für saubere Trennung der Verantwortlichkeiten.

2. **Defensive Programming**: Mehrfache Validierungsebenen (Regex → Date-Parsing → NaN-Checks) verhindern fehlerhafte Datenbank-Einträge durch ungültige Terminplan-Daten.

3. **Styling Conditional Logic**: React-Styling verwendet explizite Bedingungen statt CSS-Klassen für ganztägige Events, um präzise Kontrolle über Hintergrundfarben und Textdarstellung zu gewährleisten.
`─────────────────────────────────────────────────`

## Testing-Empfehlung

Zur Verifikation der Implementierung:

1. **Kalender öffnen** unter `http://localhost:3000`
2. **Oktober 2025 navigieren** um Terminplan-Events zu sehen
3. **Weiße Hintergründe** und **fehlende Uhrzeiten** bei Terminplan-Events bestätigen
4. **Fixed-Status** durch Versuch der Bearbeitung testen (sollte blockiert sein)

Die Implementierung erfüllt alle Benutzeranforderungen für ganztägige Terminplan-Events mit weißem Hintergrund und ohne Uhrzeitangaben.