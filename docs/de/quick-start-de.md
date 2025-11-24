# Lernplaner - Schnellstart-Anleitung

---

## Was ist Lernplaner?

Lernplaner ist ein **gamifiziertes Lernmanagementsystem**, das Teil des DIAS-Ökosystems ist. Es hilft dir, deine Lernziele zu erreichen durch:

- **XP & Leveling:** Verdiene 10-15 XP pro Lernminute und steige durch 100 Level auf
- **Lernstreaks:** Baue tägliche Lerngewohnheiten auf und halte deine Streak am Leben 🔥
- **Smart Scheduling:** Automatische Sitzungsgenerierung basierend auf Prüfungsterminen
- **Gamification:** Erfolge, Abzeichen und Level-Up-Feiern mit Konfetti 🎉

---

## Voraussetzungen

### Option 1: Mit DIAS Frontend (Empfohlen)

Lernplaner läuft zusammen mit DIAS Frontend. Befolge die Anleitung im **DIAS Frontend Repository**:

```bash
# Siehe: diasv31_frontend/my-app/docs/quick-start-de.md
```

**Vorteile:**
- Single Sign-On (einmal anmelden für beide Apps)
- Einfachere Keycloak-Konfiguration
- Einheitliches Deployment

### Option 2: Standalone

Falls du nur Lernplaner nutzen möchtest:

- **Docker** (Version 20.10+) und **Docker Compose** (Version 2.0+)
- **Keycloak-Instanz** (für Authentifizierung)
- **4 GB RAM** mindestens
- **Freie Ports:** 3002, 5432

---

## Installation mit DIAS (Empfohlen)

### Schritt 1: Repositories klonen

```bash
mkdir -p ~/dias-projekt
cd ~/dias-projekt

git clone https://github.com/dias-digital-assistant/diasv31_frontend.git
git clone https://github.com/dias-digital-assistant/lernplan_new.git
```

### Schritt 2: Umgebungsvariablen konfigurieren

```bash
cd lernplan_new

# .env.example als Vorlage
cp .env.example .env

# Bearbeiten
nano .env
```

**Minimale .env Konfiguration:**

```env
# === Datenbank ===
DATABASE_HOST=lernplaner_postgres
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=lernplaner_password

# === Keycloak OAuth2 ===
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=ihr_lernplaner_client_secret
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# === NextAuth.js ===
NEXTAUTH_URL=http://localhost:3002/api/auth
NEXTAUTH_SECRET=ihr_nextauth_secret

# === Optional: Feedback-Admin ===
FEEDBACK_ADMIN_USERNAME=admin
FEEDBACK_ADMIN_PASSKEY=ihr_admin_passwort
```

### Schritt 3: Docker starten

```bash
cd ../diasv31_frontend/my-app

# Docker-Netzwerk erstellen (falls noch nicht vorhanden)
docker network create app_network

# Alle Services starten
docker-compose up -d --build

# Lernplaner-Logs beobachten
docker-compose logs -f lernplaner_frontend
```

### Schritt 4: Keycloak konfigurieren

**Wichtig:** Lernplaner benötigt einen Keycloak-Client!

Siehe: **[../diasv31_frontend/my-app/docs/keycloak-setup-de.md](../../diasv31_frontend/my-app/docs/keycloak-setup-de.md)**

**Kurzversion:**
1. Keycloak Admin Console: `http://localhost:8180/keycloak/admin`
2. Realm `dias` erstellen (falls noch nicht vorhanden)
3. Client `lernplaner-client` erstellen
4. Client Secret in .env eintragen
5. Redirect URI: `http://localhost:3002/api/auth/callback/keycloak`

### Schritt 5: Lernplaner öffnen

```bash
open http://localhost:3002
```

**Erwartung:**
- Lernplaner Startseite mit "Sign In" Button
- Nach Login: Dashboard mit XP, Level und Streak

---

## Standalone-Installation (ohne DIAS)

Falls du Lernplaner unabhängig von DIAS betreiben möchtest:

### Schritt 1: Repository klonen

```bash
git clone https://github.com/dias-digital-assistant/lernplan_new.git
cd lernplan_new
```

### Schritt 2: .env konfigurieren

```bash
cp .env.example .env
nano .env
```

```env
# Lokale PostgreSQL-Datenbank
DATABASE_HOST=localhost
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=ihr_sicheres_passwort

# Keycloak (benötigt eigene Instanz!)
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=ihr_client_secret
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# NextAuth
NEXTAUTH_URL=http://localhost:3000/api/auth
NEXTAUTH_SECRET=<generieren_mit_openssl_rand_base64_32>
```

### Schritt 3: PostgreSQL-Datenbank einrichten

```bash
# Datenbank erstellen
createdb lernplaner_data

# Oder via psql:
psql -U postgres
CREATE DATABASE lernplaner_data;
CREATE USER lernplaner_user WITH PASSWORD 'ihr_passwort';
GRANT ALL PRIVILEGES ON DATABASE lernplaner_data TO lernplaner_user;
\q
```

### Schritt 4: Migrationen ausführen

```bash
# Dependencies installieren
npm install

# Datenbank-Migrationen ausführen
npm run db:migrate

# Optional: Testdaten laden
npm run db:seed
```

### Schritt 5: Development-Server starten

```bash
npm run dev

# → http://localhost:3000
```

---

## Erste Schritte

### 1. Dashboard verstehen

Nach der Anmeldung siehst du das **Dashboard**:

```
┌─────────────────────────────────────────────┐
│  Level 5: Lernling                  XP: 420 │
│  ████████░░░░░░░░░░░░░░░░  420/1000 XP     │
│                                             │
│  🔥 Streak: 3 Tage                          │
│  🏆 Erfolge: 2/15                           │
│  📊 Letzte 7 Tage: 180 Min                  │
└─────────────────────────────────────────────┘
```

**Dashboard-Elemente:**
- **Level & XP:** Aktueller Fortschritt und Level-Titel
- **XP-Fortschrittsbalken:** Wie viel XP bis zum nächsten Level fehlt
- **Streak:** Wie viele Tage du hintereinander gelernt hast
- **Erfolge:** Freigeschaltete Gamification-Badges
- **Wochenstatistik:** Lernzeit der letzten 7 Tage

### 2. Erstes Fach anlegen

Klicke auf **"Fächer"** in der Navigation:

1. **"Neues Fach"** Button klicken
2. **Fachname eingeben:** z.B. "Mathematik 1"
3. **Farbe wählen:** z.B. Blau (für visuelle Unterscheidung)
4. **Prüfungstermin setzen (optional):** z.B. "2024-02-15"
   - **Wichtig:** Mit Prüfungstermin gibt's 5 XP Bonus pro Minute! (15 XP/Min statt 10 XP/Min)
5. **Wochenstunden (optional):** z.B. "4 Stunden"
6. **"Speichern"**

### 3. Erste Lernsitzung starten

**Manuelle Sitzung:**

1. Navigiere zu **"Kalender"** → **"Neue Sitzung"**
2. **Fach auswählen:** "Mathematik 1"
3. **Dauer eingeben:** z.B. "30 Minuten"
4. **"Sitzung starten"**
5. Timer läuft → Nach Ablauf: XP wird automatisch gutgeschrieben!

**Timer im Header:**

1. **Timer-Symbol** im Header klicken
2. **Fach auswählen**
3. **"Start"** klicken
4. **Pause/Stop** nach Bedarf
5. **"Beenden"** → XP-Gutschrift

### 4. XP und Level verstehen

**XP-Berechnung:**

```
XP verdient = Minuten * Basisrate + Bonus

Basisrate: 10 XP/Min
Bonus: +5 XP/Min (wenn Fach Prüfungstermin hat)

Beispiele:
  30 Min ohne Prüfungstermin: 30 * 10 = 300 XP
  30 Min mit Prüfungstermin: 30 * 15 = 450 XP
  60 Min mit Prüfungstermin: 60 * 15 = 900 XP
```

**Level-System:**

- **Level 1:** 0-100 XP (Lernling)
- **Level 2:** 100-500 XP (Lernling)
- **Level 3:** 500-1000 XP (Lernling)
- **Level 4+:** +500 XP pro Level
- **Level 100:** 49.500 XP (Lernlegende 🏆)

**Level-Titel:**
- Level 1-5: **Lernling**
- Level 6-10: **Wissensjäger**
- Level 11-20: **Studienkönig**
- Level 21-50: **Weiser**
- Level 51-99: **Wissensguru**
- Level 100: **Lernlegende** 🎉

### 5. Streak aufbauen

**Was ist ein Streak?**
Ein Streak zählt die Anzahl aufeinanderfolgender Tage, an denen du mindestens eine Lernsitzung abgeschlossen hast.

**Streak-Mechanik:**
- ✅ **+1 Tag:** Mindestens 1 Sitzung pro Tag
- 🔥 **Streak bleibt:** Lerne jeden Tag
- ❌ **Streak bricht:** Kein Lernen an einem Tag → Streak zurück auf 0

**Tipps:**
- Setze dir ein tägliches Lernziel (z.B. 30 Min)
- Nutze Erinnerungen (Browser-Benachrichtigungen)
- Auch kurze Sessions zählen (10 Min reichen!)

### 6. Erfolge freischalten

Navigiere zu **"Erfolge"**:

**Kategorien:**
- **🔥 Streak-Erfolge:** 3 Tage, 7 Tage, 30 Tage, 100 Tage
- **⏱️ Zeit-Erfolge:** 10h, 50h, 100h, 500h insgesamt gelernt
- **📝 Aufgaben-Erfolge:** 10, 50, 100 Sitzungen abgeschlossen
- **⭐ Level-Erfolge:** Level 10, 25, 50, 100 erreicht

**Beispiel-Erfolge:**
```
🔥 Feuerstart (3 Tage Streak)
⏱️ Erste Schritte (10h Lernzeit)
📝 Gewohnheitstier (10 Sitzungen)
⭐ Wissensjäger (Level 10)
```

### 7. Kalender nutzen

**Kalenderansichten:**
- **Monat:** Übersicht aller geplanten Sitzungen
- **Woche:** Wochenplan mit Zeitslots
- **Tag:** Detaillierte Tagesansicht

**Sitzungen planen:**
1. **Kalender öffnen** → **"Neue Sitzung"**
2. **Datum & Uhrzeit wählen**
3. **Fach auswählen**
4. **Dauer festlegen**
5. **"Speichern"**

**Automatische Sitzungsgenerierung:**
1. **Fach mit Prüfungstermin anlegen**
2. **"Sitzungen generieren"** Button klicken
3. **Wochenstunden angeben:** z.B. "5 Stunden"
4. **Zeitfenster wählen:** z.B. Mo-Fr, 14:00-18:00
5. **"Generieren"** → Sitzungen werden automatisch bis zum Prüfungstermin verteilt!

---

## Häufige Fragen

### Wie maximiere ich meine XP?

1. **Prüfungstermine setzen:** +5 XP Bonus pro Minute (50% mehr!)
2. **Längere Sitzungen:** Mehr Minuten = mehr XP
3. **Täglich lernen:** Streak aufbauen (zusätzliche Erfolge)
4. **Mehrere Fächer:** Verschiedene Fächer mit Prüfungsterminen

### Was passiert bei Level-Up?

Bei jedem Level-Aufstieg:
- 🎉 **Konfetti-Animation**
- 🏆 **Neuer Level-Titel** (z.B. "Wissensjäger")
- 📊 **Fortschrittsanzeige** aktualisiert sich
- ✅ **Level-Erfolge** werden freigeschaltet (z.B. Level 10, 25)

### Kann ich Sitzungen nachträglich hinzufügen?

Ja! Navigiere zu **"Sitzungen"** → **"Neue Sitzung"**:
- **Datum in der Vergangenheit** wählen
- **Dauer eingeben**
- **Fach auswählen**
- **"Speichern"** → XP werden rückwirkend gutgeschrieben

### Was ist der Unterschied zwischen Sitzungen und Kalender?

- **Sitzungen:** Abgeschlossene Lernsitzungen (Vergangenheit) → zählen für XP
- **Kalender:** Geplante Sitzungen (Zukunft) → noch keine XP

### Wie funktioniert das Feedback-System?

Nach jeder Sitzung:
- **5-Punkte-Skala:** Wie produktiv war die Sitzung?
- **Optional:** Kommentar hinzufügen
- **Statistiken:** Durchschnittliche Produktivität pro Fach

---

## Tipps & Tricks

### Produktivitäts-Tipps

1. **Pomodoro-Technik nutzen:** 25 Min lernen, 5 Min Pause
2. **Prüfungstermine setzen:** Motivation + 50% mehr XP
3. **Tägliche Routine:** Streak aufbauen für konstanten Fortschritt
4. **Realistische Ziele:** Lieber 30 Min täglich als 3h einmal pro Woche

### Gamification optimal nutzen

1. **Erfolge als Ziele:** Fokussiere dich auf nächste Erfolge (z.B. 7-Tage-Streak)
2. **Level-Titel als Motivation:** "Wissensguru" klingt besser als "Level 51"
3. **XP-Boost nutzen:** Prüfungstermine setzen für 15 XP/Min
4. **Vergleich mit Freunden:** Teile deinen Level-Fortschritt (optional)

### Organisation

1. **Farbcodierung:** Jedes Fach eine andere Farbe im Kalender
2. **Wochenstunden planen:** Automatische Sitzungsgenerierung spart Zeit
3. **Feedback nutzen:** Reflektiere, welche Fächer dir schwerfallen
4. **Statistiken beobachten:** Dashboard zeigt schwache Tage/Zeiten

---

## Fehlerbehebung

### Sitzung wurde nicht gespeichert

**Lösung:**
```bash
# Logs prüfen
docker-compose logs -f lernplaner_frontend

# Datenbankverbindung testen
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "SELECT COUNT(*) FROM learning_sessions;"
```

### XP wurden nicht gutgeschrieben

**Mögliche Ursachen:**
1. **Sitzung nicht beendet:** Klicke auf "Beenden" Button
2. **Datenbankfehler:** Siehe Logs
3. **Fach nicht ausgewählt:** Sitzungen benötigen ein Fach

**Lösung:**
```sql
-- Manuelle XP-Gutschrift (via psql)
UPDATE users SET xp = xp + 300 WHERE email = 'deine@email.de';
```

### Streak ist falsch

**Streak-Logik:**
- Zählt nur Tage mit abgeschlossenen Sitzungen
- Zeitzone: Berlin (UTC+1/UTC+2)
- Tageswechsel: 00:00 Uhr

**Lösung:**
```bash
# Gamification-Events prüfen
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data

SELECT * FROM gamification_events WHERE user_id = 'deine_user_id' ORDER BY created_at DESC LIMIT 10;
```

---

## Weiterführende Dokumentation

### Für Benutzer
- **User Guide:** [user-guide-de.md](user-guide-de.md)
- **DIAS Integration:** [../diasv31_frontend/my-app/README.de.md](../../diasv31_frontend/my-app/README.de.md)

### Für Entwickler
- **API-Dokumentation:** [../README.md#API-Documentation](../README.md#-api-documentation)
- **Datenbank-Schema:** [../README.md#Database-Schema](../README.md#-database-schema)
- **Gamification-System:** [../README.md#Gamification-System](../README.md#-gamification-system)

### Technische Details
- **Docker-Setup:** [../README.md#Docker-Setup](../README.md#-docker-setup-recommended)
- **Keycloak-Integration:** [../../diasv31_frontend/my-app/docs/keycloak-setup-de.md](../../diasv31_frontend/my-app/docs/keycloak-setup-de.md)

---

## Support

- **GitHub Issues:** https://github.com/dias-digital-assistant/lernplan_new/issues
- **E-Mail:** dias@hs-ansbach.de
- **Dokumentation:** [README.md](../README.md)

---

**Viel Erfolg beim Lernen!** 🎓🚀
