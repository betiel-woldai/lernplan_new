# 🎓 Lernplaner - Gamifizierte Lernmanagement-Plattform

[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Version](https://img.shields.io/badge/version-1.8.0-blue.svg)](CHANGELOG.md)

Eine gamifizierte Lernmanagement-Plattform mit XP-System, Lernstreaks und intelligentem Scheduling. Teil des DIAS-Ökosystems an der Hochschule Ansbach.

🇬🇧 **[English Version](README.md)** | 📖 **[Detaillierte Dokumentation](docs/)**

---

## 🌟 Überblick

Lernplaner ist ein **gamifiziertes Lernmanagementsystem**, das Studierende motiviert durch:
- **XP & Leveling:** 10-15 XP pro Lernminute, Fortschritt durch 100 Stufen
- **Lernstreaks:** Aufbau täglicher Gewohnheiten mit Streak-Tracking
- **Smart Scheduling:** Automatische Sitzungsgenerierung basierend auf Prüfungsterminen
- **Visueller Fortschritt:** Diagramme, Statistiken und Erfolgsabzeichen

**Institution:** Hochschule Ansbach
**Lizenz:** MIT
**Version:** 1.8.0

---

## 🔗 Integration mit DIAS

Lernplaner ist Teil des **DIAS-Ökosystems** und integriert sich nahtlos mit dem DIAS Frontend.

### Architektur

```
       Keycloak SSO (OAuth2)
              │
    ┌─────────┴──────────┐
    │                    │
DIAS Frontend      Lernplaner
(Port 3001)        (Port 3002)
    │                    │
user_postgres    lernplaner_postgres
```

**Wichtig:** Lernplaner wird zusammen mit DIAS Frontend über die `docker-compose.yml` Datei in `../diasv31_frontend/my-app/` bereitgestellt.

**Integrationspunkte:**
- **Single Sign-On:** Einmalige Anmeldung über Keycloak für beide Apps
- **Gemeinsame Authentifizierung:** Gleicher Keycloak-Realm (`dias`)
- **Nahtlose Navigation:** Direkte Links zwischen DIAS und Lernplaner
- **Einheitliches Deployment:** Beide Apps laufen von einer docker-compose.yml

---

## ✨ Hauptfunktionen

### 🎮 Gamification-System

- **XP & Level:** 10-15 XP pro Minute (10 XP Basis + 5 XP Bonus bei Prüfungstermin)
- **100 Level-System:** Mit deutschen Lerntiteln ("Lernling" → "Lernlegende")
- **Lernstreaks:** Tägliche Konsistenz mit Feuer-Emoji-Anzeige
- **Erfolge & Abzeichen:** Kategorien für Streak, Zeit, Aufgaben, Level
- **Level-Up-Feier:** Konfetti-Animation bei Stufenaufstieg

### 📅 Intelligente Planung

- **Fachverwaltung:** Fächer mit Farbcodierung erstellen
- **Prüfungstermin-Tracking:** Deadline-orientierte Planung
- **Automatische Sitzungsgenerierung:** Basierend auf Prüfungsterminen und Wochenstunden
- **Kalenderansichten:** Monat, Woche, Tag mit Drag & Drop
- **Terminplan-Integration:** Import von festen Terminen aus DIAS

### ⏱️ Kompakter Timer

- **Always-Visible:** Timer im Header auf allen Seiten
- **Ein-Klick-Start:** Schnelle Lernsitzungen starten
- **Session-Tracking:** Automatische Zeiterfassung
- **XP-Vergabe:** Automatisch nach Sitzungsende

### 📊 Analysen

- **XP-Fortschritt:** Line-Charts mit wöchentlichen/monatlichen Breakdowns
- **Fach-Performance:** Zeitvergleiche zwischen Fächern
- **Streak-Monitoring:** Aktueller und längster Streak
- **Feedback-System:** Tägliche Reflexion mit 5-Punkte-Skala

---

## 🚀 Schnellstart

### Option 1: Docker mit DIAS (Empfohlen)

```bash
# 1. Beide Repositories klonen
mkdir dias-projekt && cd dias-projekt
git clone https://github.com/dias-digitial-assistant/diasv31_frontend.git
git clone https://github.com/dias-digitial-assistant/lernplaner.git

# 2. Zu docker-compose navigieren
cd diasv31_frontend/my-app

# 3. Umgebung konfigurieren
cp .env.example .env
# .env mit Ihren Einstellungen bearbeiten

# 4. Docker-Netzwerk erstellen
docker network create app_network

# 5. Alle Services starten
docker-compose up -d --build

# 6. Auf Lernplaner zugreifen
# http://localhost:3002
```

### Option 2: Lokale Entwicklung

```bash
git clone https://github.com/dias-digitial-assistant/lernplaner.git
cd lernplaner
npm install

# PostgreSQL-Datenbank einrichten
createdb lernplaner_data
# Migrationen ausführen

cp .env.example .env
# .env bearbeiten

npm run dev
# → http://localhost:3000
```

**Hinweis:** Lokaler Modus erfordert manuelle Keycloak-Einrichtung.

---

## 🐳 Docker Setup

Lernplaner ist Teil des DIAS docker-compose Setups in `../diasv31_frontend/my-app/docker-compose.yml`.

### Services

| Service | Zweck | Port |
|---------|-------|------|
| **lernplaner_frontend** | Lernplaner Next.js App | 3002:3000 |
| **lernplaner_postgres** | Lernplaner-Datenbank | 5432 (intern) |
| **web_test** | DIAS Frontend | 3001:3000 |
| **user_postgres** | DIAS-Datenbank | 5432 (intern) |
| **postgres** | Keycloak-Datenbank | 5432 (intern) |

### Docker-Befehle

```bash
# Nur Lernplaner starten
cd diasv31_frontend/my-app
docker-compose up -d lernplaner_frontend lernplaner_postgres

# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f lernplaner_frontend

# Nach Code-Änderungen neu erstellen
docker-compose up -d --build lernplaner_frontend

# Auf Datenbank zugreifen
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data
```

---

## 🔐 Keycloak SSO

Lernplaner nutzt Keycloak für Authentifizierung und teilt SSO mit DIAS Frontend.

### Konfiguration (Kurzversion)

1. **Keycloak-Client erstellen:** `dias` oder `lernplaner-client`
2. **Redirect-URIs konfigurieren:**
   - `http://localhost:3002/api/auth/callback/keycloak`
   - `https://ihre-domain.de/dias_test/lernplaner/api/auth/callback/keycloak`
3. **Client-Secret in .env eintragen**

**Detaillierte Anleitung:** [English README](README.md#-keycloak-sso-integration) oder [diasv31_frontend README](../diasv31_frontend/my-app/README.md#-keycloak-setup)

---

## ⚙️ Umgebungskonfiguration

`.env` Datei in `lernplaner/` erstellen:

```env
# Datenbank
DATABASE_HOST=localhost  # oder dias_lernplaner_postgres (Docker)
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=ihr_sicheres_passwort

# Keycloak OAuth2
KEYCLOAK_CLIENT_ID=dias
KEYCLOAK_CLIENT_SECRET=ihr_client_secret
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# NextAuth (generieren mit: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000/api/auth
NEXTAUTH_SECRET=ihr_generiertes_secret

# Optional: Feedback-Admin
FEEDBACK_ADMIN_USERNAME=admin
FEEDBACK_ADMIN_PASSKEY=ihr_admin_passwort
```

**Secrets generieren:**
```bash
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -base64 24  # DATABASE_PASSWORD
```

---

## 💻 Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development-Server starten
npm run dev

# Production-Build
npm run build
npm start

# Tests ausführen
npm run test

# Datenbank-Operationen
npm run db:migrate  # Migrationen ausführen
npm run db:seed     # Datenbank seeden
npm run db:reset    # Datenbank zurücksetzen
```

### Projekt-Struktur

```
lernplaner/
├── src/
│   ├── pages/          # Next.js Seiten & API-Routen
│   ├── components/     # React-Komponenten (38 Komponenten)
│   ├── hooks/          # Custom React Hooks (14 Hooks)
│   ├── lib/            # Utilities (db.ts, apiClient.ts)
│   ├── types/          # TypeScript-Typen
│   └── utils/          # Hilfsfunktionen (XP, Streak, etc.)
├── db/migrations/      # SQL-Migrationsdateien (001-009)
├── docs/               # Dokumentation
└── tests/              # Playwright E2E Tests
```

---

## 🎮 Gamification-Details

### XP-Berechnung

```
XP verdient = Minuten * Basisrate + Bonus
wobei:
  Basisrate = 10 XP/Min
  Bonus = 5 XP/Min (wenn Fach Prüfungstermin hat)

Beispiel:
  30 Min Lernsitzung (kein Prüfungstermin): 30 * 10 = 300 XP
  30 Min Lernsitzung (mit Prüfungstermin): 30 * 15 = 450 XP
```

### Level-System

- **Level 1:** 0-100 XP
- **Level 2:** 100-500 XP
- **Level 3:** 500-1000 XP
- **Level 4+:** +500 XP pro Level
- **Level 100:** 49.500 XP

**Level-Titel (Deutsch):**
- Level 1-5: Lernling
- Level 6-10: Wissensjäger
- Level 11-20: Studienkönig
- Level 21-50: Weiser
- Level 51-99: Wissensguru
- Level 100: Lernlegende

---

## 🗄️ Datenbank-Schema

### Wichtige Tabellen

- **users:** Benutzerprofile (XP, Level, Streak)
- **subjects:** Lernfächer mit Farbcodierung
- **learning_sessions:** Sitzungsaufzeichnungen
- **calendar_sessions:** Geplante Sitzungen
- **achievements:** Erfolgs-Definitionen
- **user_achievements:** Freigeschaltete Erfolge
- **gamification_events:** XP/Level-Up-Ereignisprotokoll
- **lernplan_feedback:** Benutzer-Feedback (1-5 Skala)

**40+ Indizes** für Performance-Optimierung

**Detailliertes Schema:** [English README](README.md#-database-schema)

---

## 🔧 Fehlerbehebung

### Container startet nicht
```bash
# lernplaner korrekt geklont?
ls -la ../lernplaner

# Logs prüfen
docker-compose logs lernplaner_frontend

# Neu erstellen
docker-compose up -d --build lernplaner_frontend
```

### Datenbankverbindung fehlgeschlagen
```bash
# Datenbank läuft?
docker-compose ps lernplaner_postgres

# Verbindung testen
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "SELECT 1;"
```

### Keycloak-Authentifizierung fehlgeschlagen
```bash
# Keycloak erreichbar?
curl http://localhost:8180/keycloak/realms/dias/.well-known/openid-configuration

# Redirect-URIs in Keycloak prüfen
# Admin Console → Clients → dias → Valid redirect URIs
```

**Detaillierte Fehlerbehebung:** [English README](README.md#-troubleshooting)

---

## 📖 Weiterführende Dokumentation

### Für Endbenutzer
- **Schnellstart-Guide:** [docs/quick-start-de.md](docs/quick-start-de.md)
- **Benutzerhandbuch:** [docs/user-guide-de.md](docs/user-guide-de.md)

### Für Entwickler
- **API-Dokumentation:** [README.md#API-Documentation](README.md#-api-documentation)
- **Datenbank-Schema:** [README.md#Database-Schema](README.md#-database-schema)
- **Gamification-System:** [README.md#Gamification-System](README.md#-gamification-system)

### Technische Details
- **Docker-Setup:** [README.md#Docker-Setup](README.md#-docker-setup-recommended)
- **Keycloak-Integration:** [README.md#Keycloak-SSO](README.md#-keycloak-sso-integration)
- **Authentifizierungs-Flow:** [README.md#Authentication-Flow](README.md#-keycloak-sso-integration)

---

## 🤝 Mitwirken

Wir freuen uns über Beiträge!

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/neues-feature`)
3. Änderungen committen (`git commit -m 'feat: neues feature'`)
4. Zum Fork pushen (`git push origin feature/neues-feature`)
5. Pull Request öffnen

**Commit-Konvention:**
```
feat: Neues Feature hinzufügen
fix: Bug beheben
docs: Dokumentation aktualisieren
style: Code formatieren
refactor: Code refactorn
test: Tests hinzufügen
chore: Build-Skripte aktualisieren
```

Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

---

## 📄 Lizenz

MIT-Lizenz - siehe [LICENSE](LICENSE)-Datei.

---

## 🙏 Danksagungen

- **Hochschule Ansbach** - Institution
- **Next.js & React** - Framework
- **PostgreSQL** - Datenbank
- **Keycloak** - Authentifizierung
- **Chart.js** - Datenvisualisierung

---

## 📞 Support

- **GitHub Issues:** [Fehler melden](https://github.com/dias-digitial-assistant/lernplaner/issues)
- **E-Mail:** dias@hs-ansbach.de
- **Dokumentation:** [docs/](docs/)

---

## 🗺️ Roadmap

- [ ] Mobile App (React Native)
- [ ] Lerngruppen & Kollaboration
- [ ] KI-gestützte Lernempfehlungen
- [ ] Integration mit mehr Universitätssystemen
- [ ] Offline-Modus mit Sync
- [ ] Erweiterte Analysen-Dashboard

---

**Vollständige technische Details und API-Dokumentation finden Sie in der [englischen README](README.md).**

**Für vollständige DIAS-Ökosystem-Dokumentation siehe [diasv31_frontend README](../diasv31_frontend/my-app/README.md)**

**Mit ❤️ erstellt vom DIAS-Team an der Hochschule Ansbach**
