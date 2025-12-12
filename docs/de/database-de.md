# Datenbank-Integration - Lernplaner

Dieses Dokument beschreibt das PostgreSQL-Datenbank-Setup und die Integration für die Lernplaner-Gamification-Plattform.

---

## Übersicht

Lernplaner nutzt PostgreSQL 15 als primäre Datenbank, deployed via Docker als Teil des DIAS-Ökosystems.

### Architektur

```
┌─────────────────────────────────────────┐
│         Keycloak SSO                     │
│      (Identity Provider)                 │
└──────────┬──────────────┬────────────────┘
           │              │
           ▼              ▼
   ┌──────────────┐   ┌────────────┐
   │ DIAS Frontend│   │ Lernplaner │
   │ (Port 3001)  │   │(Port 3002) │
   └──────┬───────┘   └─────┬──────┘
          │                 │
          ▼                 ▼
   ┌──────────────┐   ┌─────────────────┐
   │ user_postgres│   │lernplaner_postgres│
   │ (user_data)  │   │(lernplaner_data) │
   └──────────────┘   └─────────────────┘
```

**Deployment:**
- Beide Datenbanken laufen in Docker-Containern
- Orchestriert durch eine `docker-compose.yml` in `../diasv31_frontend/my-app/`
- Interne Docker-Netzwerk-Kommunikation
- Persistente Daten via Docker Volumes

---

## Datenbank-Schema

### Kern-Tabellen

#### `users`
- **Zweck:** Benutzerprofile und Gamification-Statistiken
- **Wichtige Felder:**
  - `user_sub` - Keycloak-Benutzer-ID (PRIMARY KEY)
  - `email` - E-Mail-Adresse (UNIQUE)
  - `xp` - Erfahrungspunkte
  - `level` - Aktuelles Level
  - `streak` - Aktuelle Lern-Tagesfolge
  - `longest_streak` - Persönlicher Rekord
  - `total_learning_time` - Gesamtlernzeit in Minuten
- **Indizes:** email, user_sub, xp, level

#### `subjects`
- **Zweck:** Lernfächer mit Prüfungsterminen
- **Wichtige Felder:**
  - `id` - Primärschlüssel
  - `user_sub` - Benutzer-Zuordnung
  - `name` - Fachname
  - `color` - Hex-Farbcode für UI
  - `exam_date` - Prüfungstermin (optional)
  - `hours_per_week` - Geplante Wochenstunden
  - `is_archived` - Archivierungs-Status
- **Indizes:** user_sub, exam_date, is_archived

#### `learning_sessions`
- **Zweck:** Einzelne Lernsitzungen mit Zeiterfassung
- **Wichtige Felder:**
  - `id` - Primärschlüssel
  - `user_sub` - Benutzer-Zuordnung
  - `subject_id` - Fach-Zuordnung
  - `duration` - Dauer in Minuten
  - `xp_earned` - Verdiente XP aus dieser Sitzung
  - `completed` - Abgeschlossen-Status
  - `session_date` - Zeitstempel
- **XP-Berechnung:**
  - Basis: 10 XP/Minute
  - Bonus: +5 XP/Minute bei Prüfungstermin
  - Gesamt: 10-15 XP pro Minute

#### `calendar_sessions`
- **Zweck:** Geplante Lernsitzungen
- **Wichtige Felder:**
  - `id` - Primärschlüssel
  - `user_sub` - Benutzer-Zuordnung
  - `subject_id` - Fach-Zuordnung (nullable)
  - `title` - Sitzungstitel
  - `start_time`, `end_time` - Zeitfenster
  - `session_type` - Typ: study, exam, assignment, break
  - `is_auto_generated` - Automatisch generiert
- **Indizes:** user_sub, subject_id, start_time, session_type

#### `achievements`
- **Zweck:** Gamification-Erfolgs-Definitionen
- **Kategorien:**
  - `streak`: Tagesfolgen-Meilensteine (3, 7, 30, 100 Tage)
  - `time`: Gesamtlernzeit (10h, 50h, 100h, 500h)
  - `tasks`: Sitzungsanzahl (10, 50, 100, 500 Sitzungen)
  - `level`: Level-Meilensteine (10, 25, 50, 100)

#### `user_achievements`
- **Zweck:** Freigeschaltete Erfolge
- **Wichtige Felder:**
  - `user_sub` - Benutzer-Zuordnung
  - `achievement_id` - Erfolgs-Zuordnung
  - `unlocked_at` - Freischaltungs-Zeitstempel

#### `gamification_events`
- **Zweck:** Aktivitäts-Tracking und Event-Log
- **Event-Typen:** xp_gain, level_up, achievement_unlock, streak_update
- **Speicherung:** JSONB für flexible Event-Metadaten

#### `lernplan_feedback`
- **Zweck:** Benutzer-Feedback zu Lernsitzungen
- **Wichtige Felder:**
  - `rating` - 1-5 Sterne-Bewertung
  - `comment` - Optionaler Feedback-Text

**Detailliertes Schema:** Siehe [English Version](../database.md#database-schema)

---

## Umgebungskonfiguration

### Docker-Umgebung (.env in diasv31_frontend/my-app/)

Die Haupt-`.env`-Datei im DIAS-Frontend-Verzeichnis enthält die Datenbank-Zugangsdaten:

```env
# Lernplaner PostgreSQL-Datenbank
LERNPLANER_DB_PASSWORD=lernplaner_password

# Verwendet von docker-compose.yml um zu erstellen:
# - Container: lernplaner_postgres
# - Datenbank: lernplaner_data
# - Benutzer: lernplaner_user
```

### Lernplaner-Anwendung (.env in lernplaner/)

Die `.env`-Datei der Lernplaner-App referenziert die Docker-Datenbank:

```env
# Datenbankverbindung
DATABASE_HOST=lernplaner_postgres  # Docker Service-Name
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=lernplaner_password  # Muss mit LERNPLANER_DB_PASSWORD übereinstimmen

# Keycloak OAuth2 (SSO mit DIAS)
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=ihr_client_secret_hier
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# NextAuth.js
NEXTAUTH_URL=http://localhost:3002/api/auth
NEXTAUTH_SECRET=ihr_nextauth_secret_hier
```

**Wichtig:**
- `DATABASE_HOST` verwendet Docker Service-Namen (`lernplaner_postgres`), nicht `localhost`
- Datenbankname ist `lernplaner_data` (nicht `lernplaner`)
- Passwort muss in beiden `.env`-Dateien übereinstimmen

---

## Docker-Setup

### Voraussetzungen

- Docker & Docker Compose installiert
- Beide Repositories `diasv31_frontend` und `lernplaner` geklont

### Datenbank starten

Die Datenbank wird automatisch mit dem gesamten DIAS-Stack gestartet:

```bash
# Navigiere zum DIAS-Frontend docker-compose Verzeichnis
cd diasv31_frontend/my-app

# Docker-Netzwerk erstellen (falls nicht vorhanden)
docker network create app_network

# Alle Services inkl. Lernplaner-Datenbank starten
docker-compose up -d

# Datenbank-Status prüfen
docker-compose ps lernplaner_postgres
```

### Datenbank-Zugriff

```bash
# PostgreSQL-Shell öffnen
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data

# In psql:
\dt                    # Alle Tabellen auflisten
\d users               # users-Tabelle beschreiben
SELECT * FROM users;   # Benutzer abfragen
\q                     # Beenden
```

### Datenbank-Operationen

```bash
# Logs anzeigen
docker-compose logs -f lernplaner_postgres

# Datenbank neu starten
docker-compose restart lernplaner_postgres

# Datenbank stoppen
docker-compose stop lernplaner_postgres

# Datenbank und Volumes entfernen (WARNUNG: Datenverlust!)
docker-compose down -v
```

---

## Datenbank-Migrationen

### Migrations-System

Lernplaner nutzt SQL-Migrationsdateien in `db/migrations/`:

- `001_initial_schema.sql` - Kern-Tabellen und Beziehungen
- `002_add_indexes.sql` - Performance-Indizes
- `003_achievements_system.sql` - Erfolgs-Tabellen
- `004_calendar_sessions.sql` - Kalender-Integration
- `005_gamification_events.sql` - Event-Tracking
- `006_feedback_system.sql` - Benutzer-Feedback
- `007_add_user_achievements_columns.sql` - Erfolgs-Erweiterungen
- `008_add_subjects_archived.sql` - Fach-Archivierung
- `009_add_calendar_metadata.sql` - Kalender-Metadaten

### Migrationen ausführen

**Via Docker:**
```bash
# Migrationen laufen automatisch beim Container-Start

# Oder manuell ausführen:
docker-compose exec lernplaner_frontend npm run db:migrate
```

**Lokale Entwicklung:**
```bash
cd lernplaner

# Alle ausstehenden Migrationen ausführen
npm run db:migrate

# Migrations-Status prüfen
npx tsx src/scripts/migrate.ts status

# Letzte Migration rückgängig machen
npx tsx src/scripts/migrate.ts rollback
```

### Daten seeden

```bash
# Datenbank mit Beispieldaten füllen
npm run db:seed

# Setup (migrate + seed)
npm run db:setup

# Datenbank komplett zurücksetzen
npm run db:reset

# Alle Daten löschen (Schema bleibt erhalten)
npx tsx src/scripts/seed.ts clear
```

---

## Performance-Optimierungen

### Indizes

Die Migration `002_add_indexes.sql` fügt **40+ Performance-Indizes** hinzu:

**Benutzer-Abfragen:**
- `idx_users_email` - E-Mail-basierte Abfragen
- `idx_users_xp`, `idx_users_level` - Bestenlisten-Abfragen
- `idx_users_streak` - Streak-Tracking

**Fach-Abfragen:**
- `idx_subjects_user_sub` - Benutzerfächer
- `idx_subjects_exam_date` - Anstehende Prüfungen
- `idx_subjects_archived` - Aktive Fächer filtern

**Sitzungs-Abfragen:**
- `idx_learning_sessions_user_sub` - Benutzersitzungen
- `idx_learning_sessions_subject_id` - Fach-Historie
- `idx_learning_sessions_date` - Zeitbasierte Abfragen
- `idx_learning_sessions_completed` - Abschluss-Status

**Gamification:**
- `idx_user_achievements_user_sub` - Benutzer-Erfolge
- `idx_gamification_events_user_sub` - Event-Historie
- `idx_gamification_events_type` - Event-Typ-Filterung

### Connection Pooling

Datenbankverbindung verwaltet in `src/lib/db.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  max: 10,                    // Maximale Verbindungen
  idleTimeoutMillis: 30000,   // 30s Leerlauf-Timeout
  connectionTimeoutMillis: 5000, // 5s Verbindungs-Timeout
});
```

---

## Beispieldaten

Das Seed-Script (`npm run db:seed`) erstellt:

- **2 Beispiel-Benutzer** mit unterschiedlichen XP-Levels und Streaks
- **4 Fächer** (Mathematik, Physik, Chemie, Geschichte) mit verschiedenen Konfigurationen
- **30+ Lernsitzungen** verteilt über die letzten 30 Tage
- **25+ Kalender-Sitzungen** geplant für die nächsten 14 Tage
- **11 Erfolge** über verschiedene Kategorien (streak, time, tasks, level)
- **10+ Benutzer-Erfolge** mit verschiedenen Freischaltungs-Daten
- **60+ Gamification-Events** für Aktivitäts-Historie

---

## Produktionsüberlegungen

### Sicherheit

- ✅ **Starke Passwörter:** 32+ Zeichen zufällige Passwörter verwenden
- ✅ **SSL-Verbindungen:** SSL für Produktions-Datenbanken aktivieren
- ✅ **Eingeschränkter Zugang:** Firewall-Regeln, keine öffentliche Exposition
- ✅ **Regelmäßige Updates:** PostgreSQL auf aktuellem Stand halten
- ✅ **Backup-Verschlüsselung:** Datenbank-Backups verschlüsseln

### Backup-Strategie

```bash
# Manuelles Backup
docker-compose exec lernplaner_postgres pg_dump -U lernplaner_user lernplaner_data > backup.sql

# Aus Backup wiederherstellen
cat backup.sql | docker-compose exec -T lernplaner_postgres psql -U lernplaner_user -d lernplaner_data

# Automatisierte tägliche Backups (cron job)
0 2 * * * cd /pfad/zu/diasv31_frontend/my-app && docker-compose exec -T lernplaner_postgres pg_dump -U lernplaner_user lernplaner_data | gzip > /backups/lernplaner_$(date +\%Y\%m\%d).sql.gz
```

### Monitoring

- **Connection Pool:** Aktive/Leerlauf-Verbindungen überwachen
- **Langsame Abfragen:** Abfragen > 1 Sekunde protokollieren
- **Festplattenspeicher:** Alarm bei niedrigem Speicherplatz
- **Replikations-Verzögerung:** Bei Verwendung von Read Replicas

### Skalierung

- **Read Replicas:** Für Analysen und Reporting
- **Connection Pooling:** PgBouncer für Verbindungsverwaltung
- **Query-Optimierung:** Langsame Abfragen mit `EXPLAIN` analysieren
- **Partitionierung:** Für große Tabellen (sessions, events)

---

## Fehlerbehebung

### Häufige Probleme

#### 1. Verbindung abgelehnt

**Symptom:** `ECONNREFUSED` Fehler

**Lösung:**
```bash
# Prüfen ob Datenbank-Container läuft
docker-compose ps lernplaner_postgres

# Logs prüfen
docker-compose logs lernplaner_postgres

# Container neu starten
docker-compose restart lernplaner_postgres
```

#### 2. Authentifizierung fehlgeschlagen

**Symptom:** `password authentication failed`

**Lösung:**
```bash
# Zugangsdaten in beiden .env-Dateien prüfen
grep DATABASE_PASSWORD lernplaner/.env
grep LERNPLANER_DB_PASSWORD diasv31_frontend/my-app/.env

# Datenbank mit korrektem Passwort neu erstellen
docker-compose down lernplaner_postgres
docker-compose up -d lernplaner_postgres
```

#### 3. Datenbank existiert nicht

**Symptom:** `database "lernplaner_data" does not exist`

**Lösung:**
```bash
# Prüfen ob docker-compose.yml korrektes POSTGRES_DB hat
# Container neu erstellen
docker-compose down lernplaner_postgres
docker-compose up -d lernplaner_postgres

# Verifizieren dass Datenbank erstellt wurde
docker-compose exec lernplaner_postgres psql -U lernplaner_user -l
```

#### 4. Migrations-Fehler

**Symptom:** Migrationen schlagen fehl oder hängen

**Lösung:**
```bash
# Migrations-Status prüfen
docker-compose exec lernplaner_frontend npm run db:migrate status

# Datenbank zurücksetzen (WARNUNG: Datenverlust!)
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Migrationen erneut ausführen
docker-compose exec lernplaner_frontend npm run db:migrate
```

#### 5. Hostname-Auflösung

**Symptom:** `getaddrinfo ENOTFOUND lernplaner_postgres`

**Lösung:**
```bash
# Verifizieren dass Docker-Netzwerk existiert
docker network ls | grep app_network

# Netzwerk neu erstellen falls fehlend
docker network create app_network

# Services neu starten
docker-compose down
docker-compose up -d
```

### Verbindung testen

```bash
# Von Host-Maschine
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "SELECT 1;"

# Vom Lernplaner-Container
docker-compose exec lernplaner_frontend npx tsx src/scripts/test-db.ts
```

Erwartete Ausgabe:
```
✅ Datenbankverbindung erfolgreich
📊 PostgreSQL Version: 15.x
📋 Gefundene Tabellen: 8
   - users
   - subjects
   - learning_sessions
   - calendar_sessions
   - achievements
   - user_achievements
   - gamification_events
   - lernplan_feedback
```

---

## Datenbank-Verbindungs-API

### Query-Ausführung

```typescript
import { query, withTransaction, healthCheck } from '../lib/db';

// Basis-Abfrage
const result = await query(
  'SELECT * FROM users WHERE email = $1',
  ['benutzer@beispiel.de']
);

// Parametrisiertes Insert
const neuesFach = await query(
  'INSERT INTO subjects (user_sub, name, color) VALUES ($1, $2, $3) RETURNING *',
  [userSub, 'Mathematik', '#3B82F6']
);
```

### Transaktions-Unterstützung

```typescript
// Transaktion mit automatischem Rollback bei Fehler
await withTransaction(async (client) => {
  // XP vergeben
  await client.query(
    'UPDATE users SET xp = xp + $1 WHERE user_sub = $2',
    [points, userId]
  );

  // Event protokollieren
  await client.query(
    'INSERT INTO gamification_events (user_sub, event_type, event_data) VALUES ($1, $2, $3)',
    [userId, 'xp_gain', JSON.stringify({ xp: points })]
  );

  // Falls eine Abfrage fehlschlägt, wird die gesamte Transaktion zurückgerollt
});
```

### Health Check

```typescript
// Datenbankverbindung prüfen
const health = await healthCheck();

if (health.status === 'healthy') {
  console.log('Datenbank OK');
} else {
  console.error('Datenbankverbindung fehlgeschlagen:', health.error);
}
```

---

## Zukünftige Erweiterungen

1. **Read Replicas** - Separate Analyse-Datenbank für schwere Abfragen
2. **Partitionierung** - Zeitbasierte Partitionierung für sessions und events Tabellen
3. **Volltextsuche** - PostgreSQL FTS für Fach/Sitzungs-Suche
4. **Materialisierte Views** - Vorberechnete Statistiken für Dashboard
5. **Daten-Archivierung** - Automatische Archivierung alter Sitzungen
6. **Multi-Tenancy** - Unterstützung für mehrere Organisationen/Schulen
7. **CDC (Change Data Capture)** - Echtzeit-Datensynchronisation für Analysen

---

**🇬🇧 English version:** [../database.md](../database.md)
