# Nutzungsanleitung - Lernplaner Features

---

## Übersicht

Die Lernplaner-Anwendung beinhaltet ein umfassendes Gamification-System und ein Fach-Management-Interface, das Benutzern hilft, ihr Lernen mit Motivation und Struktur zu organisieren.

**Aktuelle Features:** XP & Leveling-System + Lern-Streaks + Erfolgs-Badges + Kalender-Sitzungsverwaltung + Smart Scheduling

---

## Gamification-Features

### 🎮 XP (Erfahrungspunkte)-System

Benutzer verdienen XP durch abgeschlossene Lernsitzungen:
- **Basisrate:** 10 XP pro Lernminute
- **Prüfungs-Bonus:** +5 XP pro Minute (Fächer mit Prüfungstermin)
- **Gesamt:** 10-15 XP pro Minute je nach Fach

**Beispiele:**
- 30 Min Sitzung (ohne Prüfungstermin): 30 × 10 = 300 XP
- 30 Min Sitzung (mit Prüfungstermin): 30 × 15 = 450 XP
- 60 Min Sitzung (mit Prüfungstermin): 60 × 15 = 900 XP

**XP-Fortschrittsbalken:** Visuelle Fortschrittsanzeige mit aktuellem XP und Fortschritt zum nächsten Level.

### 🏆 Level-System

- **Aktuelles Level:** Prominent mit animiertem Badge angezeigt
- **Level-Berechnung:** Basierend auf quadratischer Formel `Math.floor(Math.sqrt(totalXP / 100)) + 1`
- **Level-Up-Feiern:** Automatische Konfetti-Animation und Modal bei Erreichen eines neuen Levels
- **Visuelles Feedback:** Goldene Gradienten-Badges mit Hover-Animationen

**Level-Titel:**
- Level 1-5: Lernling
- Level 6-10: Wissensjäger
- Level 11-20: Studienkönig
- Level 21-50: Weiser
- Level 51-99: Wissensguru
- Level 100: Lernlegende

### 🎯 Erfolgs-System

**Erfolgs-Kategorien:**
- **Tasks:** Abschluss-basierte Erfolge (🏆)
- **Streak:** Konsistenz-Erfolge (⚡)
- **Time:** Lernzeit-Erfolge (🎓)
- **Level:** Fortschritts-Erfolge (🌟)

**Visuelle Features:**
- Interaktives Badge-System mit Tooltips
- Fortschrittsringe für unvollständige Erfolge
- Neue Erfolgs-Indikatoren mit pulsierenden Animationen
- Erfolgs-Freischaltungs-Feiern

### 🔥 Streak-System

**Streak-Tracking:**
- Tägliche Lern-Streak-Zählung
- Visuelle Intensitätsstufen basierend auf Streak-Länge:
  - 0 Tage: Grau (keine)
  - 1-2 Tage: Orange (schwach)
  - 3-6 Tage: Orange-Flammen (mittel)
  - 7-13 Tage: Rotes Feuer (stark)
  - 14-29 Tage: Dunkelrot (intensiv)
  - 30+ Tage: Lila legendäre Flammen

**Meilenstein-Belohnungen:**
- 7 Tage: "Wochenkämpfer" Erfolg
- 14 Tage: Streak-Feier
- 30 Tage: "Monats-Meister" Erfolg
- 50+ Tage: Elite-Status

### 🎉 Feier-System

**XP-Gewinn-Benachrichtigungen:**
- Schwebende Toast-Nachrichten mit "+XP" Anzeige
- Erfolgs-Freischaltungs-Benachrichtigungen
- Streak-Meilenstein-Feiern

**Level-Up-Feiern:**
- Vollbild-Konfetti-Animation mit canvas-confetti
- Glückwunsch-Modal mit neuer Level-Anzeige
- Auto-Schließen nach 4 Sekunden oder manuelles Schließen

---

## 📚 Fach-Management-Interface

### Übersicht
Das Fach-Management-Interface ermöglicht es dir, Lernfächer mit personalisierten Einstellungen, Farbcodierung und Fortschritts-Tracking zu erstellen, zu organisieren und zu verfolgen.

### 🎯 Hauptfunktionen

#### **Fach-Erstellung**
- **Fach-Hinzufügen-Button:** Prominent platziert für einfachen Zugriff
- **Umfassendes Formular:** Alle erforderlichen Felder mit Validierung
- **Farb-Anpassung:** Vollständiger Farbwähler mit voreingestellten Optionen optimiert für Hell-Modus
- **Datums-Verwaltung:** Startdatum und Prüfungsdatum mit Validierung
- **Lernplanung:** Wochenstunden, Tage pro Woche und Intensitätswochen

#### **Fach-Karten**
- **Farbcodiertes Design:** Linker Rand und Fortschrittsbalken passen zur Fachfarbe
- **Fortschritts-Tracking:** Visuelle Fortschrittsbalken zeigen abgeschlossene vs. Zielstunden
- **Lernmetriken:** Wochenstunden, Tage pro Woche, Intensitätswochen-Anzeige
- **Prüfungs-Countdown:** Zeigt verbleibende Zeit bis zum Prüfungsdatum
- **Hover-Aktionen:** Bearbeiten- und Löschen-Buttons erscheinen beim Hover über Karte

#### **Formular-Validierung**
- **Pflichtfelder:** Fachname, Farbe, Daten und numerische Werte
- **Datums-Validierung:** Prüfungsdatum muss nach Startdatum liegen
- **Numerische Einschränkungen:** Wochenstunden (1-40), Tage pro Woche (1-7), Intensitätswochen (1-20)
- **Echtzeit-Feedback:** Fehlermeldungen werden sofort angezeigt

#### **Suchen & Filtern**
- **Suche nach Name:** Fächer durch Eingabe von Fachnamen filtern
- **Suche nach Farbe:** Fächer nach Farbcodes filtern
- **Echtzeit-Ergebnisse:** Sofortiges Filtern beim Tippen
- **Leer-Zustand:** Hilfreiche Nachrichten, wenn keine Ergebnisse gefunden wurden

### 💾 Datenspeicherung
- **PostgreSQL:** Fächer und Sitzungen werden in der gemeinsamen PostgreSQL-Instanz gespeichert
- **Seed-Reset:** `npm run db:setup` ausführen, um Standard-Benutzer, Fächer und Lernplan neu zu erstellen
- **Persistenz:** Daten bleiben über Browser-Sitzungen und Server-Neustarts erhalten

---

## 📅 Interaktive Kalender-Komponente

### Übersicht
Die Interaktive Kalender-Komponente bietet ein umfassendes Scheduling- und Sitzungsverwaltungs-System mit mehreren Ansichtsmodi und responsivem Design.

### 🗓️ Hauptfunktionen

#### **Kalender-Ansichten**
- **Monatsansicht:** Vollständiger Monatskalender mit CSS-Grid-Layout
- **Wochenansicht:** Wöchentlicher Zeitplan mit Echtzeit-Abschluss-Indikatoren
- **Tagesansicht:** Fokussierte Agenda für das ausgewählte Datum
- **Ansicht-Umschaltung:** Einfacher Wechsel zwischen Monats-/Wochen-/Tagesansichten

#### **Interaktive Features**
- **Datumsauswahl:** Klicke auf ein beliebiges Datum zum Auswählen und Hervorheben
- **Sitzungs-Anzeige:** Farbcodierte Sitzungen erscheinen auf Kalenderdaten
- **Navigation:** Vorherige/Nächste Monatspfeile und "Heute"-Button
- **Sitzungs-Erstellung:** "Session"-Button wird aktiviert, wenn Datum ausgewählt ist

#### **Sitzungsverwaltung**
- **Farbcodierung:** Sitzungen erben Fachfarben (Blau=Mathe, Grün=Physik, Orange=Chemie)
- **Sitzungs-Details:** Klicke auf Sitzungen, um Titel, Zeit, Fach, Beschreibung anzuzeigen
- **Visueller Status:** Abgeschlossene Sitzungen mit reduzierter Deckkraft angezeigt
- **Sitzungs-Typen:** Unterstützung für Lern-, Prüfungs-, Aufgaben- und Pausen-Sitzungen

---

## 📊 Sitzungs-Tracking-System

### Übersicht
Das Sitzungs-Tracking-System bietet umfassendes Lernsitzungs-Management mit Echtzeit-Tracking, Statistiken und nahtloser Gamification-Integration.

### 🚀 Hauptfunktionen

#### **Sitzungsverwaltung**
- **Sitzung-Starten-Modal:** Fach wählen, Dauer (Pomodoro 25Min Standard) und optionale Notizen
- **Sitzungs-Timer:** Echtzeit-Fortschrittskreis mit Pause/Fortsetzen-Funktionalität
- **Sitzungs-Historie:** Vollständige Historie mit Suche, Filterung und Statistiken
- **Schnellstart:** Sitzungen direkt von Fach-Karten mit Hover-Aktionen starten

#### **Statistik-Dashboard**
- **Gesamtzeit:** Akkumulierte Lernzeit über alle Sitzungen
- **Gesamt-XP:** Erfahrungspunkte aus abgeschlossenen Sitzungen verdient
- **Sitzungs-Anzahl:** Anzahl abgeschlossener Lernsitzungen
- **Durchschnittliche Dauer:** Durchschnittliche Sitzungslänge für Produktivitäts-Einblicke

#### **API-Integration**
- **Lernsitzungen-API:** Vollständige CRUD-Operationen (`/api/sessions/` und `/api/sessions/[id]`)
- **PostgreSQL-Integration:** Persistente Sitzungsdaten mit ordnungsgemäßen Beziehungen
- **Gamification-Integration:** Automatische XP-Berechnung und Benutzerstatistik-Updates
- **Echtzeit-Statistiken:** Live-Updates von Fortschritt und Erfolgen

### 🎯 Verwendung

#### **Lernsitzung starten**
1. Navigiere zur **Fächer**-Seite
2. Klicke auf **"Sitzung starten"**-Button (grüner Play-Button)
3. Wähle dein Fach aus der Liste
4. Wähle Dauer (15Min bis 2 Stunden, Standard 25Min Pomodoro)
5. Füge optionale Sitzungsnotizen hinzu (500 Zeichen Limit)
6. Klicke **"Sitzung starten"** zum Beginnen

#### **Von Fach-Karten starten**
1. Fahre über eine beliebige Fach-Karte
2. Klicke auf den **Play-Button**, der erscheint
3. Sitzungs-Modal öffnet sich mit vorausgewähltem Fach
4. Setze Dauer und Notizen, dann starten

#### **Sitzungs-Historie ansehen**
1. Klicke **"Sitzungs-Historie"**-Button (grauer Verlaufs-Button)
2. Zeige Statistik-Karten an: Gesamtzeit, XP, Sitzungen, Durchschnitt
3. Verwende **Suchleiste** zum Finden spezifischer Sitzungen
4. Wende **Datums-Filter** an: Alle Zeit, Heute, Diese Woche, Dieser Monat
5. **Mehr laden**-Button für Pagination durch Sitzungs-Historie

#### **XP-Berechnung**
- **Basisrate:** 10 XP pro Minute Lernen
- **Prüfungs-Bonus:** +5 XP pro Minute wenn Fach Prüfungstermin hat
- **Gesamt:** 10-15 XP pro Minute je nach Fach
- **Benutzerstatistik-Update:** Automatische tägliche/wöchentliche Zeit- und XP-Summen
- **Erfolgs-Integration:** Sitzungs-Meilensteine lösen Erfolge aus

---

## 🔄 Komplettes Daten-Reset-System

### Übersicht
Das Komplette Daten-Reset-System bietet sichere und umfassende Datenbank-Lösch-Funktionalität, die die Anwendung in ihren Ausgangszustand zurückversetzt, während alle Datenbankstrukturen und Funktionalitäten erhalten bleiben.

### 🎯 Hauptfunktionen

#### **Sicheres Daten-Löschen**
- **Umfassendes Reset:** Löscht alle Benutzerdaten, Fächer, Sitzungen, Erfolge und Statistiken
- **Struktur-Erhaltung:** Behält Datenbankschema, Indizes und Beziehungen bei
- **Transaktions-Sicherheit:** ACID-konforme Operationen mit Rollback-Schutz
- **Fremdschlüssel-Behandlung:** Ordnungsgemäße Lösch-Reihenfolge unter Beachtung von Datenbankbeschränkungen

### 🚀 Verwendung

#### **Daten-Reset ausführen**
1. **Reset-Script ausführen:** `node scripts/clear-all-data.js --force`
2. **Sicherheits-Check:** Script erfordert `--force` Flag zur Vermeidung versehentlicher Ausführung
3. **Verifizierung:** `node scripts/verify-data-reset.js` ausführen zur Bestätigung der Vollständigkeit
4. **Frontend-Check:** Anwendung ansehen, um sauberen Ausgangszustand zu sehen

#### **Was wird zurückgesetzt**
- ✅ **Alle Benutzer:** Benutzerprofile und Authentifizierungsdaten
- ✅ **Alle Fächer:** Lernfächer und Konfigurationen
- ✅ **Alle Sitzungen:** Lernsitzungen und Tracking-Daten
- ✅ **Alle Kalender-Ereignisse:** Geplante Lernsitzungen
- ✅ **Alle Erfolge:** Verdiente Erfolge und Fortschritt
- ✅ **Alle Statistiken:** XP, Level, Streaks und Lernmetriken
- ✅ **Alle Aktivitäts-Logs:** Gamification-Events und System-Logs

#### **Was wird bewahrt**
- ✅ **Datenbankschema:** Alle Tabellen, Spalten und Datentypen
- ✅ **Beziehungen:** Fremdschlüssel und referentielle Integrität
- ✅ **Indizes:** Performance-Optimierungs-Indizes
- ✅ **Funktionen:** Datenbank-Trigger und Stored Procedures
- ✅ **Anwendungscode:** Frontend- und Backend-Funktionalität

### ⚠️ Wichtige Warnungen

#### **Datenverlust-Prävention**
- ⚠️ **Irreversibler Vorgang:** Daten können nach Reset nicht wiederhergestellt werden
- ⚠️ **Kein automatisches Backup:** Script erstellt nicht automatisch Backup der Daten
- ⚠️ **Produktions-Nutzung:** Äußerste Vorsicht in Produktionsumgebungen walten lassen
- ⚠️ **Benutzer-Auswirkung:** Gesamter Benutzerfortschritt und Daten gehen dauerhaft verloren

---

## Komponenten-Architektur

### Kern-Komponenten

1. **`XPBar`:** Animierter Fortschrittsbalken mit Level-Anzeige
2. **`LevelBadge`:** Kreisförmiger Level-Indikator mit Animationen
3. **`AchievementBadge`:** Interaktive Erfolgsanzeige mit Tooltips
4. **`StreakDisplay`:** Flammen-animierter Streak-Zähler
5. **`XPToast`:** Schwebendes Benachrichtigungssystem
6. **`LevelUpModal`:** Vollbild-Feier-Modal

### Hooks

**`useGamification`:** Zentraler State-Management-Hook, der bereitstellt:
- XP-Verwaltung (`addXP`, `currentXP`, `currentLevel`)
- Erfolgs-System (`unlockAchievement`, `achievements`)
- Streak-Tracking (`updateStreak`, `streak`)
- Event-System (`getRecentEvents`)
- Demo-Utilities (`simulateLearningActivity`, `resetGamification`)

---

## Testen deiner Implementierung

### Manuelle Test-Schritte

1. **Dashboard öffnen:** Navigiere zu http://localhost:3002
2. **XP-Gewinn testen:** Klicke "Lernsession starten" um XP zu verdienen
3. **Animationen verifizieren:** Achte auf XP-Balken-Updates und Toast-Benachrichtigungen
4. **Level-Up testen:** Klicke "Großer XP Boost" mehrmals um Level-Up auszulösen
5. **Konfetti prüfen:** Verifiziere dass Konfetti-Animation bei Level-Up erscheint
6. **Erfolge testen:** Klicke "Achievement freischalten" um neues Badge freizuschalten
7. **Streaks testen:** Klicke "Streak erhöhen" um Streak-Zähler zu erhöhen
8. **Mobile-Tests:** Verifiziere responsives Design auf mobilen Geräten

### Erwartete Verhaltensweisen

- ✅ XP-Toasts erscheinen bei XP-Gewinn
- ✅ XP-Balken animieren sanft
- ✅ Level-Badge aktualisiert bei Level-Up
- ✅ Konfetti löst bei Level-Up aus
- ✅ Erfolgs-Badges zeigen mit Hover-Effekten
- ✅ Streak-Flammen intensivieren mit höheren Streaks
- ✅ Alle Animationen vervollständigen sanft
- ✅ Responsives Design funktioniert auf allen Bildschirmgrößen

---

## Technische Implementierung

### Verwendete Dependencies

- **canvas-confetti:** Level-Up-Feier-Effekte
- **react-icons/fa6:** Feuer- und Flammen-Icons für Streaks
- **tailwindcss:** Styling und Animationen
- **TypeScript:** Type-Safety durchweg

### Benutzerdefinierte Animationen

Hinzugefügte Tailwind-Animationen:
- `animate-spin-slow`: Langsame Rotation für legendäre Streaks
- `animate-float`: Schwebender Effekt für spezielle Elemente
- `animate-glow`: Pulsierende Glow-Effekte

### Performance-Überlegungen

- Animationen verwenden CSS-Transformationen für sanfte 60fps-Performance
- Toast-Benachrichtigungen werden in Warteschlange gestellt zur Vermeidung von Überlappungen
- Event-System verhindert Memory-Leaks mit ordnungsgemäßem Cleanup
- Bilder und schwere Effekte sind für Mobile optimiert

---

## Fehlerbehebung

### Häufige Probleme

**XP wird nicht aktualisiert:** Konsole auf JavaScript-Fehler prüfen, Hook-Integration verifizieren

**Animationen nicht sanft:** Sicherstellen dass Hardware-Beschleunigung im Browser aktiviert ist

**Konfetti erscheint nicht:** canvas-confetti Dependency-Installation verifizieren

**Mobile-Layout-Probleme:** Responsive Breakpoints testen, Tailwind-Klassen prüfen

### Entwicklungs-Notizen

- `npm run build` ausführen um TypeScript-Fehler zu prüfen
- Browser-DevTools verwenden um Animations-Performance zu überwachen
- Auf mehreren Geräten und Browsern testen
- Konsole auf React-Warnungen prüfen

---

## Zukünftige Erweiterungen

Potenzielle Verbesserungen für zukünftige Versionen:
- Sound-Effekte für Erfolge und Level-Ups
- Animierte Partikelsysteme für spezielle Events
- Benutzer-anpassbare Feier-Präferenzen
- Erfolgs-Teilen auf Social Media
- Bestenlisten und Wettbewerbs-Features

---

**🇬🇧 English version (vollständige Details):** [../usage.md](../usage.md)

*Letzte Aktualisierung: Version 1.8.0 - XP & Leveling-System, Learning Streaks, Achievement Badges*
