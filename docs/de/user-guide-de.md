# Lernplaner - Benutzerhandbuch

---

## Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Dashboard](#dashboard)
3. [Fächer verwalten](#fächer-verwalten)
4. [Lernsitzungen](#lernsitzungen)
5. [Kalender & Planung](#kalender--planung)
6. [XP & Leveling](#xp--leveling)
7. [Streaks](#streaks)
8. [Erfolge & Badges](#erfolge--badges)
9. [Statistiken & Analysen](#statistiken--analysen)
10. [Feedback-System](#feedback-system)
11. [Tipps & Best Practices](#tipps--best-practices)

---

## Einführung

### Was ist Lernplaner?

Lernplaner ist ein **gamifiziertes Lernmanagementsystem**, das dich motiviert, regelmäßig und effektiv zu lernen. Durch ein XP- und Level-System, tägliche Streaks und Erfolge wird Lernen zu einem spielerischen Erlebnis.

### Kernfeatures

- **🎮 Gamification:** XP, Level, Erfolge, Streaks
- **📅 Smart Scheduling:** Automatische Sitzungsplanung
- **⏱️ Timer:** Integrierter Lerntimer im Header
- **📊 Analysen:** Detaillierte Statistiken über dein Lernverhalten
- **🎯 Zielverfolgung:** Prüfungstermine und Lernziele

### Erste Anmeldung

1. **Lernplaner öffnen:** `http://localhost:3002` (Entwicklung) oder `https://your-domain.com/lernplaner` (Produktion)
2. **"Sign In" klicken:** Weiterleitung zu Keycloak
3. **Mit Hochschul-Account anmelden:** E-Mail & Passwort
4. **Dashboard erscheint:** Du startest bei Level 1 mit 0 XP

---

## Dashboard

### Übersicht

Das Dashboard ist deine **Zentrale** im Lernplaner. Hier siehst du:

```
┌─────────────────────────────────────────────────────────────┐
│ 🎓 Dashboard                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Level 12: Studienkönig                      XP: 5.420     │
│  ████████████████░░░░░░░░░░░░░░  5.420/6.000 XP           │
│                                                             │
│  🔥 Aktueller Streak: 12 Tage                               │
│  🏆 Längster Streak: 28 Tage                                │
│  📊 Erfolge: 8/15                                           │
│                                                             │
│  📈 Letzte 7 Tage                                           │
│  ┌───────────────────────────────────────────┐             │
│  │ Mo Di Mi Do Fr Sa So                      │             │
│  │ 45 60 30 45 90 0  120   = 390 Min         │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  🎯 Heute gelernt: 45 Minuten                               │
│  📚 Fächer: 5 aktiv                                         │
│  📅 Nächste Prüfung: Mathematik 1 (in 12 Tagen)            │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard-Elemente erklärt

#### 1. Level & XP-Anzeige

**Level-Titel:** Dynamisch basierend auf deinem Level
- Level 1-5: Lernling
- Level 6-10: Wissensjäger
- Level 11-20: Studienkönig
- Level 21-50: Weiser
- Level 51-99: Wissensguru
- Level 100: Lernlegende

**XP-Fortschrittsbalken:**
- Grün gefüllt: bereits verdiente XP im aktuellen Level
- Grau: fehlende XP bis zum nächsten Level
- Beispiel: 5.420/6.000 XP → noch 580 XP bis Level 13

#### 2. Streak-Anzeige

**Aktueller Streak:** Anzahl aufeinanderfolgender Tage mit mindestens einer Lernsitzung

**Längster Streak:** Dein persönlicher Rekord

**Visualisierung:**
```
🔥 3 Tage    (klein, orange)
🔥 7 Tage    (mittel, rot)
🔥 30 Tage   (groß, feuerrot)
🔥 100 Tage  (riesig, gold)
```

#### 3. Erfolge-Übersicht

**Fortschritt:** Z.B. "8/15" → 8 von 15 Erfolgen freigeschaltet

**Kategorien:**
- Streak-Erfolge (3, 7, 30, 100 Tage)
- Zeit-Erfolge (10h, 50h, 100h, 500h)
- Aufgaben-Erfolge (10, 50, 100, 500 Sitzungen)
- Level-Erfolge (Level 10, 25, 50, 100)

#### 4. Wochenstatistik

**Balkendiagramm:** Lernzeit der letzten 7 Tage

**Interpretation:**
- Hohe Balken (dunkelgrün): Produktive Tage
- Niedrige Balken (hellgrün): Wenig gelernt
- Keine Balken (grau): Kein Lernen → Streak gefährdet!

#### 5. Schnellzugriff

**Heute gelernt:** Summe aller heutigen Sitzungen

**Fächer aktiv:** Anzahl der Fächer mit aktuellem Semester/Prüfungstermin

**Nächste Prüfung:** Countdown zum nächsten Prüfungstermin

---

## Fächer verwalten

### Neues Fach anlegen

1. **Navigation:** Sidebar → **"Fächer"**
2. **"Neues Fach" Button** klicken
3. **Formular ausfüllen:**

```
┌─────────────────────────────────────────┐
│ Neues Fach erstellen                    │
├─────────────────────────────────────────┤
│ Fachname: [Mathematik 1            ]    │
│                                         │
│ Farbe: [🔵 Blau ▼]                      │
│                                         │
│ Prüfungstermin: [2024-02-15      ]     │
│                                         │
│ Wochenstunden: [4                 ]     │
│                                         │
│ Beschreibung (optional):                │
│ [Lineare Algebra, Analysis I       ]    │
│                                         │
│ [ Abbrechen ]  [ Speichern ]            │
└─────────────────────────────────────────┘
```

#### Feld-Erklärungen

**Fachname (Pflichtfeld):**
- Eindeutiger Name
- Beispiele: "Mathematik 1", "Programmieren in Java", "BWL Grundlagen"

**Farbe (Pflichtfeld):**
- Visuelle Unterscheidung im Kalender
- Verfügbare Farben: Blau, Grün, Rot, Gelb, Lila, Orange, Pink
- **Tipp:** Ähnliche Fächer ähnlich färben (z.B. alle Mathe-Kurse blau)

**Prüfungstermin (optional, aber empfohlen!):**
- **Wichtig:** Mit Prüfungstermin gibt's **15 XP/Min** statt 10 XP/Min (+50% XP!)
- Format: YYYY-MM-DD oder Datumspicker
- Beispiel: "2024-02-15" für 15. Februar 2024

**Wochenstunden (optional):**
- Geplante Lernzeit pro Woche
- Wird für automatische Sitzungsgenerierung genutzt
- Beispiel: "4" für 4 Stunden pro Woche

**Beschreibung (optional):**
- Notizen, Themen, Ziele
- Nur für dich sichtbar

### Fach bearbeiten

1. **Fächerliste:** Sidebar → **"Fächer"**
2. **Fach auswählen:** Klick auf Fach-Karte
3. **"Bearbeiten" Button** klicken
4. **Änderungen vornehmen** → **"Speichern"**

**Was kann geändert werden:**
- ✅ Fachname
- ✅ Farbe
- ✅ Prüfungstermin (hinzufügen/ändern/entfernen)
- ✅ Wochenstunden
- ✅ Beschreibung

**Was bleibt erhalten:**
- Alle vergangenen Lernsitzungen
- Bereits verdiente XP
- Statistiken

### Fach archivieren

**Wann archivieren?**
- Prüfung ist vorbei
- Fach wird nicht mehr gelernt
- Semester ist beendet

**Wie archivieren:**
1. Fach öffnen → **"Archivieren"** Button
2. Bestätigung: "Ja, archivieren"

**Effekt:**
- Fach erscheint nicht mehr in aktiver Fächerliste
- Archivierte Fächer: Filterbar über **"Archiv anzeigen"**
- Statistiken und XP bleiben erhalten
- Fach kann reaktiviert werden

### Fach löschen

**Achtung:** Löschen ist irreversibel!

**Effekt:**
- Fach wird vollständig entfernt
- **ALLE Lernsitzungen** für dieses Fach werden gelöscht
- **XP GEHEN VERLOREN** (wird vom Gesamtscore abgezogen)
- **Level kann sich verringern!**

**Empfehlung:** Lieber archivieren statt löschen!

---

## Lernsitzungen

### Sitzungsarten

#### 1. Manuelle Sitzung

**Für:** Abgeschlossene Sitzungen nachtragen

1. **Navigation:** **"Sitzungen"** → **"Neue Sitzung"**
2. **Formular:**
   - **Fach:** Dropdown-Auswahl
   - **Datum:** Heute oder Vergangenheit
   - **Startzeit:** z.B. "14:00"
   - **Dauer:** z.B. "45 Minuten"
   - **Notizen (optional):** z.B. "Kapitel 3 durchgearbeitet"
3. **"Speichern"** → XP werden sofort gutgeschrieben

#### 2. Timer-Sitzung

**Für:** Live-Tracking während des Lernens

**Header-Timer:**
1. **Timer-Symbol** im Header (⏱️)
2. **Fach auswählen:** Dropdown
3. **"Start"** klicken → Timer läuft
4. **Pause:** Timer pausieren (Zeit bleibt erhalten)
5. **"Beenden"** → Sitzung wird gespeichert, XP gutgeschrieben

**Kalender-Timer:**
1. **Geplante Sitzung** im Kalender auswählen
2. **"Starten"** Button klicken
3. Timer läuft automatisch für geplante Dauer
4. **"Beenden"** → Sitzung abgeschlossen

#### 3. Geplante Sitzung

**Für:** Vorausplanung von Lernzeiten

1. **Kalender öffnen** → **"Neue Sitzung"**
2. **Zeitpunkt & Dauer festlegen**
3. **"Speichern"** → Erscheint im Kalender (noch keine XP!)

**Später ausführen:**
- Zum geplanten Zeitpunkt: Sitzung starten
- Oder: Sitzung als "abgeschlossen" markieren

### XP-Gutschrift verstehen

**Formel:**
```
XP = Minuten × Basisrate + Bonus

Basisrate: 10 XP/Min
Bonus: +5 XP/Min (wenn Fach Prüfungstermin hat)
```

**Beispielrechnungen:**

| Dauer | Prüfungstermin | Berechnung | XP verdient |
|-------|----------------|------------|-------------|
| 30 Min | Nein | 30 × 10 | 300 XP |
| 30 Min | Ja | 30 × 15 | 450 XP |
| 60 Min | Nein | 60 × 10 | 600 XP |
| 60 Min | Ja | 60 × 15 | 900 XP |
| 120 Min | Ja | 120 × 15 | 1.800 XP |

**Optimierung:**
- **Setze Prüfungstermine:** +50% XP!
- **Längere Sitzungen:** Mehr XP auf einmal
- **Regelmäßig lernen:** Streak-Boni (indirekt über Erfolge)

### Sitzungen bearbeiten

**Warum bearbeiten?**
- Tippfehler korrigieren
- Dauer anpassen (zu kurz/lang eingetragen)
- Fach nachträglich ändern

**Wie bearbeiten:**
1. **Sitzungsliste:** **"Sitzungen"** → Sitzung auswählen
2. **"Bearbeiten"** Button
3. **Änderungen vornehmen:**
   - Dauer ändern → XP werden neu berechnet
   - Fach ändern → XP-Bonus ändert sich ggf.
   - Datum ändern → Streak-Berechnung ändert sich ggf.
4. **"Speichern"** → Änderungen wirken sich sofort aus

**Wichtig:**
- XP werden automatisch neu berechnet
- Level kann sich ändern (hoch oder runter)
- Streak kann sich ändern (wenn Datum geändert)

### Sitzungen löschen

**Effekt:**
- Sitzung wird entfernt
- XP werden vom Gesamtscore abgezogen
- Level kann sich verringern
- Streak kann brechen (wenn Sitzung der einzige Eintrag an dem Tag war)

**Vorgehen:**
1. Sitzung auswählen → **"Löschen"** Button
2. Bestätigung: "Wirklich löschen?"
3. **Ja** → Sitzung gelöscht, XP abgezogen

---

## Kalender & Planung

### Kalenderansichten

#### Monatsansicht

**Übersicht:** Gesamten Monat sehen

**Verwendung:**
- Prüfungstermine im Blick behalten
- Freie Tage identifizieren
- Verteilung der Sitzungen prüfen

**Elemente:**
- 🟢 Grüne Punkte: Abgeschlossene Sitzungen
- 🔵 Blaue Punkte: Geplante Sitzungen
- 🔴 Rote Markierung: Prüfungstermin

#### Wochenansicht

**Übersicht:** 7 Tage mit Zeitslots

**Verwendung:**
- Wochenplanung erstellen
- Zeitkonflikte erkennen
- Tagesstruktur optimieren

**Zeitslots:**
- 08:00 - 23:00 Uhr (anpassbar)
- Sitzungen als Blöcke dargestellt
- Farbe = Fach-Farbe

#### Tagesansicht

**Übersicht:** Detaillierter Tagesplan

**Verwendung:**
- Stundenplan für heute
- Nächste Sitzung im Blick
- Präzise Zeitplanung

**Details:**
- Startzeit & Endzeit jeder Sitzung
- Fachname & Farbe
- Status (geplant/laufend/abgeschlossen)

### Sitzungen planen

#### Manuelle Planung

1. **Kalender öffnen** (beliebige Ansicht)
2. **Zeitpunkt klicken** (oder **"Neue Sitzung"** Button)
3. **Formular:**
   - Fach: z.B. "Mathematik 1"
   - Datum: z.B. "2024-01-25"
   - Startzeit: z.B. "14:00"
   - Dauer: z.B. "60 Minuten"
   - Wiederholung (optional): täglich/wöchentlich
4. **"Speichern"** → Sitzung erscheint im Kalender

#### Wiederholende Sitzungen

**Beispiel:** Jeden Montag 14:00-16:00 Mathematik lernen

1. Sitzung erstellen (wie oben)
2. **"Wiederholung"** aktivieren:
   - Täglich
   - Wöchentlich (z.B. jeden Montag)
   - Monatlich
3. **Enddatum festlegen:** z.B. "2024-02-28" (letzter Termin)
4. **"Speichern"** → Alle Termine werden automatisch erstellt

**Anwendungsfälle:**
- Feste Lernzeiten (z.B. Mo/Mi/Fr 10:00)
- Wöchentliche Vorlesungsnachbereitung
- Prüfungsvorbereitung (täglich letzte 2 Wochen)

### Automatische Sitzungsgenerierung

**Funktion:** Sitzungen automatisch bis zum Prüfungstermin verteilen

**Voraussetzungen:**
- Fach mit Prüfungstermin
- Wochenstunden angegeben

**Vorgehen:**

1. **Fach öffnen** (mit Prüfungstermin!)
2. **"Sitzungen generieren"** Button klicken
3. **Parameter:**
   ```
   ┌──────────────────────────────────────────┐
   │ Automatische Sitzungsgenerierung         │
   ├──────────────────────────────────────────┤
   │ Fach: Mathematik 1                       │
   │ Prüfung: 15.02.2024 (in 21 Tagen)        │
   │                                          │
   │ Wochenstunden: [4] Stunden               │
   │                                          │
   │ Zeitfenster:                             │
   │   Mo [✓] Di [✓] Mi [✓] Do [✓] Fr [✓]    │
   │   Sa [ ] So [ ]                          │
   │                                          │
   │   Von: [14:00] Bis: [18:00]              │
   │                                          │
   │ Sitzungslänge: [60] Minuten              │
   │                                          │
   │ Vorschau: 12 Sitzungen werden erstellt   │
   │                                          │
   │ [ Abbrechen ]  [ Generieren ]            │
   └──────────────────────────────────────────┘
   ```
4. **"Generieren"** klicken → Sitzungen werden automatisch verteilt!

**Algorithmus:**
- Verteilt Wochenstunden gleichmäßig auf gewählte Tage
- Berücksichtigt Zeitfenster (z.B. nur 14:00-18:00)
- Stoppt am Prüfungstermin
- Überspringt bereits belegte Zeiten (falls andere Sitzungen existieren)

**Beispiel:**
- Wochenstunden: 4h
- Tage: Mo, Mi, Fr
- Zeitfenster: 14:00-18:00
- Sitzungslänge: 60 Min
- Ergebnis: Mo 14:00-15:00, Mi 14:00-15:00, Fr 14:00-16:00 (= 4h/Woche)

### Drag & Drop

**Sitzungen verschieben:**
1. Sitzung im Kalender anklicken & halten
2. An neue Position ziehen
3. Loslassen → Sitzung wird verschoben

**Beschränkungen:**
- Nur geplante Sitzungen (nicht abgeschlossene!)
- Nur innerhalb des Kalenders
- Überlappungen werden verhindert

---

## XP & Leveling

### Level-Progression

**Level-Tabelle:**

| Level | XP benötigt | Kumulative XP | Titel |
|-------|-------------|---------------|-------|
| 1 | 100 | 0-100 | Lernling |
| 2 | 400 | 100-500 | Lernling |
| 3 | 500 | 500-1.000 | Lernling |
| 4 | 500 | 1.000-1.500 | Lernling |
| 5 | 500 | 1.500-2.000 | Lernling |
| 10 | 500 | 4.500-5.000 | Wissensjäger |
| 20 | 500 | 9.500-10.000 | Studienkönig |
| 50 | 500 | 24.500-25.000 | Weiser |
| 100 | 500 | 49.500-50.000 | Lernlegende |

**Formel (ab Level 3):**
```
XP für nächstes Level = 500 XP
Kumulativ = (Level - 1) × 500 + 100
```

### Level-Up-Ereignis

**Was passiert beim Level-Up:**

1. **Konfetti-Animation** 🎉
   - Bunte Konfetti fallen vom oberen Bildschirmrand
   - Dauer: 3 Sekunden

2. **Benachrichtigung:**
   ```
   ┌────────────────────────────────┐
   │  🎉 Level-Up!                  │
   │                                │
   │  Level 12 erreicht!            │
   │  Du bist jetzt: Studienkönig   │
   │                                │
   │  +1 Erfolg freigeschaltet      │
   └────────────────────────────────┘
   ```

3. **XP-Reset:**
   - Überschüssige XP werden ins nächste Level übertragen
   - Beispiel: Level-Up bei 5.120 XP (Schwelle: 5.000) → 120 XP für Level 11

4. **Titel-Änderung:**
   - Dashboard zeigt neuen Titel
   - Profil wird aktualisiert

5. **Erfolg (optional):**
   - Level-Erfolge: Level 10, 25, 50, 100
   - Werden automatisch freigeschaltet

### XP-Quellen

**Primär: Lernsitzungen**
- 10-15 XP pro Minute (abhängig von Prüfungstermin)
- 90% aller XP stammen aus Sitzungen

**Sekundär: Erfolge** (zukünftig)
- Bonus-XP für bestimmte Achievements
- Z.B. +500 XP für 30-Tage-Streak

**Nicht möglich:**
- Kauf von XP (Pay-to-Win gibt es nicht!)
- Cheaten/Manipulieren (Sitzungen werden validiert)

---

## Streaks

### Streak-Mechanik

**Definition:**
> Ein Streak zählt die Anzahl aufeinanderfolgender Tage, an denen mindestens eine Lernsitzung abgeschlossen wurde.

**Regeln:**

1. **+1 Tag:** Mindestens 1 Sitzung pro Tag (beliebige Dauer)
2. **Streak bleibt:** Lerne jeden Tag
3. **Streak bricht:** Kein Lernen an einem Tag → zurück auf 0

**Zeitzone:**
- Berlin Time (UTC+1 / UTC+2 Sommerzeit)
- Tageswechsel: 00:00 Uhr

**Beispiel:**

```
Tag 1 (Mo): 30 Min gelernt → Streak: 1
Tag 2 (Di): 45 Min gelernt → Streak: 2
Tag 3 (Mi): 10 Min gelernt → Streak: 3 (auch kurze Sitzungen zählen!)
Tag 4 (Do): NICHT gelernt → Streak: 0 (gebrochen!)
Tag 5 (Fr): 60 Min gelernt → Streak: 1 (Neustart)
```

### Streak-Visualisierung

**Dashboard:**
```
🔥 Aktueller Streak: 12 Tage
🏆 Längster Streak: 28 Tage
```

**Streak-Feuer:**
- 1-2 Tage: 🔥 (klein, orange)
- 3-6 Tage: 🔥🔥 (mittel, rot)
- 7-29 Tage: 🔥🔥🔥 (groß, dunkelrot)
- 30+ Tage: 🔥🔥🔥🔥 (riesig, gold)

**Kalender:**
- Tage mit Sitzungen: grün markiert
- Heute: blauer Rahmen
- Morgen: "Streak in Gefahr!" (wenn heute noch keine Sitzung)

### Streak-Erfolge

**Meilensteine:**

| Streak-Länge | Erfolg | Beschreibung |
|--------------|--------|--------------|
| 3 Tage | 🔥 Feuerstart | Drei Tage in Folge gelernt |
| 7 Tage | 🔥🔥 Wochenkönig | Eine ganze Woche durchgehalten |
| 30 Tage | 🔥🔥🔥 Lernmaschine | Einen Monat ohne Unterbrechung |
| 100 Tage | 🔥🔥🔥🔥 Unaufhaltsam | Dreistelliger Streak! |

**Bonus:** (zukünftig)
- +500 XP bei 30-Tage-Streak
- +2.000 XP bei 100-Tage-Streak

### Streak-Strategien

**Aufbau:**
1. **Realistisch starten:** 10 Min täglich reichen!
2. **Feste Zeit:** Jeden Tag zur gleichen Zeit (z.B. 20:00)
3. **Erinnerungen:** Browser-Benachrichtigungen aktivieren
4. **Nicht aufgeben:** Auch an stressigen Tagen 10 Min einplanen

**Rettung:**
- **Streak in Gefahr:** Dashboard zeigt Warnung ab 22:00 Uhr
- **Notfall-Session:** Kurze 10-Min-Sitzung vor Mitternacht
- **Urlaub planen:** Sitzungen vorher einplanen oder bewusst Pause machen

**Mentalität:**
- **Qualität > Quantität:** Lieber 20 Min fokussiert als 2h abgelenkt
- **Konsistenz:** Streak zeigt Disziplin, nicht XP-Maximierung
- **Kein Stress:** Streak ist Motivation, kein Zwang

---

## Erfolge & Badges

### Kategorien

#### 🔥 Streak-Erfolge

| Name | Bedingung | Badge |
|------|-----------|-------|
| Feuerstart | 3 Tage Streak | 🔥 |
| Wochenkönig | 7 Tage Streak | 🔥🔥 |
| Lernmaschine | 30 Tage Streak | 🔥🔥🔥 |
| Unaufhaltsam | 100 Tage Streak | 🔥🔥🔥🔥 |

#### ⏱️ Zeit-Erfolge

| Name | Bedingung | Badge |
|------|-----------|-------|
| Erste Schritte | 10 Stunden insgesamt | ⏱️ |
| Fleißig | 50 Stunden insgesamt | ⏱️⏱️ |
| Experte | 100 Stunden insgesamt | ⏱️⏱️⏱️ |
| Meister | 500 Stunden insgesamt | ⏱️⏱️⏱️⏱️ |

#### 📝 Aufgaben-Erfolge

| Name | Bedingung | Badge |
|------|-----------|-------|
| Anfänger | 10 Sitzungen | 📝 |
| Gewohnheitstier | 50 Sitzungen | 📝📝 |
| Profi | 100 Sitzungen | 📝📝📝 |
| Veteran | 500 Sitzungen | 📝📝📝📝 |

#### ⭐ Level-Erfolge

| Name | Bedingung | Badge |
|------|-----------|-------|
| Wissensjäger | Level 10 | ⭐ |
| Studienkönig | Level 25 | ⭐⭐ |
| Weiser | Level 50 | ⭐⭐⭐ |
| Lernlegende | Level 100 | ⭐⭐⭐⭐ |

### Erfolge-Seite

**Navigation:** Sidebar → **"Erfolge"**

**Ansicht:**
```
┌────────────────────────────────────────────────┐
│ 🏆 Erfolge                              8/15   │
├────────────────────────────────────────────────┤
│                                                │
│  [✓] 🔥 Feuerstart        (3 Tage Streak)      │
│  [✓] 🔥🔥 Wochenkönig     (7 Tage Streak)      │
│  [ ] 🔥🔥🔥 Lernmaschine   (30 Tage Streak)     │
│  [ ] 🔥🔥🔥🔥 Unaufhaltsam (100 Tage Streak)    │
│                                                │
│  [✓] ⏱️ Erste Schritte   (10h gelernt)         │
│  [✓] ⏱️⏱️ Fleißig         (50h gelernt)         │
│  [ ] ⏱️⏱️⏱️ Experte        (100h gelernt)        │
│  [ ] ⏱️⏱️⏱️⏱️ Meister      (500h gelernt)        │
│                                                │
│  [✓] 📝 Anfänger          (10 Sitzungen)       │
│  [✓] 📝📝 Gewohnheitstier (50 Sitzungen)       │
│  [ ] 📝📝📝 Profi          (100 Sitzungen)      │
│  [ ] 📝📝📝📝 Veteran       (500 Sitzungen)      │
│                                                │
│  [✓] ⭐ Wissensjäger      (Level 10)           │
│  [ ] ⭐⭐ Studienkönig     (Level 25)           │
│  [ ] ⭐⭐⭐ Weiser          (Level 50)           │
│  [ ] ⭐⭐⭐⭐ Lernlegende    (Level 100)          │
└────────────────────────────────────────────────┘
```

**Elemente:**
- **[✓] Grün:** Erfolg freigeschaltet
- **[ ] Grau:** Noch nicht erreicht
- **Fortschrittsbalken:** Bei manchen Erfolgen (z.B. "50h: 32/50h")

### Erfolg-Benachrichtigungen

**Wenn freigeschaltet:**
```
┌────────────────────────────────────┐
│  🎉 Erfolg freigeschaltet!         │
│                                    │
│  🔥🔥 Wochenkönig                   │
│  7 Tage in Folge gelernt!          │
│                                    │
│  +200 XP Bonus                     │
└────────────────────────────────────┘
```

---

## Statistiken & Analysen

### Dashboard-Statistiken

**Übersicht:** Schnellzugriff auf wichtigste Metriken

**Verfügbare Statistiken:**
- XP-Fortschritt (heute, Woche, Monat, gesamt)
- Lernzeit (heute, Woche, Monat, gesamt)
- Streak (aktuell, längster)
- Sitzungen (heute, Woche, Monat, gesamt)
- Erfolge (freigeschaltet/gesamt)

### Statistiken-Seite

**Navigation:** Sidebar → **"Statistiken"**

#### 📊 XP-Verlauf

**Line-Chart:** XP über Zeit

**Ansichten:**
- **Letzte 7 Tage:** Tagesweise XP-Gewinne
- **Letzte 30 Tage:** Wochenweise XP-Gewinne
- **Letzte 12 Monate:** Monatsweise XP-Gewinne

**Interpretation:**
- **Aufwärtstrend:** Kontinuierliche Verbesserung
- **Plateaus:** Stagnation (Prüfungstermine setzen für Boost!)
- **Peaks:** Intensive Lernphasen (oft vor Prüfungen)

#### 📈 Fach-Performance

**Bar-Chart:** Lernzeit pro Fach

**Ansichten:**
- **Letzte 30 Tage**
- **Aktuelles Semester**
- **Gesamt**

**Interpretation:**
- **Dominante Fächer:** Viel Zeit investiert
- **Vernachlässigte Fächer:** Rot markiert (< 2h/Woche)
- **Ausgewogene Verteilung:** Alle Fächer ähnlich (ideal)

#### 🔥 Streak-Monitoring

**Kalender-Heatmap:** Jeden Tag farbig markiert

**Farblegende:**
- **Dunkelgrün:** > 120 Min gelernt
- **Grün:** 60-120 Min
- **Hellgrün:** 30-60 Min
- **Sehr hellgrün:** 1-30 Min
- **Grau:** 0 Min (Streak-Bruch!)

**Anwendungsfall:**
- Muster erkennen (z.B. "Immer Samstag keine Sitzung")
- Schwache Wochentage identifizieren
- Prüfungsphasen visualisieren

#### 📅 Tageszeit-Analyse

**Heatmap:** Produktivste Tageszeiten

**Achsen:**
- X-Achse: Wochentag (Mo-So)
- Y-Achse: Uhrzeit (08:00-23:00)
- Farbe: Anzahl Sitzungen / Lernzeit

**Interpretation:**
- **Hotspots (dunkel):** Optimale Lernzeiten (z.B. Mo-Fr 14:00-16:00)
- **Leere Bereiche (hell):** Ungenutzte Zeiten (Potenzial!)

**Nutzen:**
- Finde deine produktivsten Zeiten
- Plane Sitzungen entsprechend
- Vermeide unproduktive Zeiten (z.B. nach 22:00)

---

## Feedback-System

### Tägliches Feedback

**Zweck:** Reflexion über Lernproduktivität

**Ablauf:**

1. **Nach jeder Sitzung:** Optional Feedback geben
2. **Skala: 1-5 Sterne**
   - ⭐ = Sehr unproduktiv, abgelenkt
   - ⭐⭐ = Eher unproduktiv
   - ⭐⭐⭐ = Neutral
   - ⭐⭐⭐⭐ = Produktiv
   - ⭐⭐⭐⭐⭐ = Sehr produktiv, fokussiert
3. **Kommentar (optional):** Z.B. "Zu laut in der Bibliothek"

**Beispiel:**
```
┌──────────────────────────────────────────┐
│ Wie produktiv war diese Sitzung?         │
├──────────────────────────────────────────┤
│  ⭐ ⭐ ⭐ ⭐ ⭐                              │
│  [ ] [ ] [ ] [ ] [✓]                     │
│                                          │
│  Kommentar (optional):                   │
│  [Sehr fokussiert, gutes Flow-Gefühl]    │
│                                          │
│  [ Überspringen ]  [ Speichern ]         │
└──────────────────────────────────────────┘
```

### Feedback-Statistiken

**Navigition:** Statistiken → **"Feedback-Übersicht"**

**Ansichten:**

#### Durchschnittliche Produktivität

**Pro Fach:**
```
Mathematik 1:     ⭐⭐⭐⭐⭐ (4.8/5)
Programmieren:    ⭐⭐⭐⭐   (4.2/5)
BWL:              ⭐⭐⭐     (3.1/5)  ← Verbesserungspotenzial!
```

#### Tageszeit-Produktivität

**Heatmap:** Wann bist du am produktivsten?

**Beispiel-Erkenntnis:**
- Morgens (08:00-12:00): ⭐⭐⭐⭐⭐ (4.6/5)
- Nachmittags (14:00-18:00): ⭐⭐⭐⭐ (4.0/5)
- Abends (20:00-23:00): ⭐⭐⭐ (2.8/5) → Besser vermeiden!

#### Wochentag-Produktivität

**Bar-Chart:**
```
Mo: ⭐⭐⭐⭐   (4.1/5)
Di: ⭐⭐⭐⭐⭐ (4.7/5)  ← Produktivster Tag!
Mi: ⭐⭐⭐⭐   (3.9/5)
Do: ⭐⭐⭐     (3.2/5)  ← Müdigkeitstief?
Fr: ⭐⭐⭐⭐   (4.0/5)
Sa: ⭐⭐⭐     (2.9/5)
So: ⭐⭐       (2.1/5)  ← Erholen statt lernen
```

### Nutzen des Feedbacks

**Für dich:**
- Erkenne unproduktive Muster
- Optimiere Lernzeiten
- Identifiziere schwierige Fächer
- Verbesser deine Lernumgebung

**Für Entwickler:** (anonym)
- Systemverbesserungen
- Feature-Prioritäten
- Usability-Optimierungen

---

## Tipps & Best Practices

### Produktivitäts-Strategien

#### 1. Pomodoro-Technik

**Ablauf:**
1. 25 Min fokussiert lernen (Pomodoro)
2. 5 Min Pause
3. Nach 4 Pomodoros: 15-30 Min lange Pause

**In Lernplaner:**
- Timer auf 25 Min stellen
- Nach 4 Sessions: Lange Pause einplanen
- Feedback geben für jeden Pomodoro

#### 2. Time-Blocking

**Ablauf:**
1. Woche im Voraus planen
2. Feste Zeitblöcke für jedes Fach
3. Keine Überlappungen
4. Puffer für Unvorhergesehenes

**In Lernplaner:**
- Wochenansicht nutzen
- Wiederholende Sitzungen erstellen
- Automatische Generierung nutzen

#### 3. Prüfungsvorbereitung

**3 Wochen vor Prüfung:**
1. Fach mit Prüfungstermin anlegen (15 XP/Min!)
2. Wochenstunden erhöhen (z.B. 10h)
3. Sitzungen automatisch generieren
4. Täglich mindestens 1 Sitzung (Streak!)

**1 Woche vor Prüfung:**
- Intensiv-Modus: 2-3 Sitzungen täglich
- Feedback nutzen (produktivste Zeiten)
- Kurze Sessions (60 Min) statt Marathon (4h+)

### Motivations-Tipps

#### XP-Optimierung

**Strategie 1: Prüfungstermine setzen**
- Effekt: +50% XP (+5 XP/Min)
- Beispiel: 60 Min = 900 XP statt 600 XP
- Auch fiktive Termine setzen (z.B. "Selbsttest am Ende des Monats")

**Strategie 2: Längere Sessions**
- Effekt: Mehr XP pro Sitzung
- Aber: Qualität > Quantität (Pomodoro-Pausen!)
- Optimal: 60-90 Min pro Sitzung

**Strategie 3: Tägliche Routine**
- Effekt: Streak-Erfolge (+ Bonus-XP zukünftig)
- Beispiel: 30 Min täglich = 3.000 XP/Woche + Streak

#### Streak-Aufrechterhaltung

**Tipp 1: Minimales Lernziel**
- 10 Min täglich reichen für Streak!
- Auch an stressigen Tagen machbar
- Qualität später steigern

**Tipp 2: Feste Zeit**
- Jeden Tag zur gleichen Zeit
- Gewohnheit entsteht nach 21 Tagen
- Erinnerung setzen (Handy-Alarm)

**Tipp 3: Notfall-Plan**
- Ab 22:00: "Streak in Gefahr!"-Warnung
- Kurze 10-Min-Session vor Mitternacht
- Auch Quizze/Karteikarten zählen

### Organisations-Tipps

#### Fach-Management

**Farbcodierung:**
- Ähnliche Fächer, ähnliche Farben
- Beispiel: Alle Mathe-Kurse blau, alle Info-Kurse grün
- Kalender wird übersichtlicher

**Archivierung:**
- Nach Prüfung: Fach archivieren
- Statistiken bleiben erhalten
- Aktive Fächerliste bleibt übersichtlich

#### Kalender-Tricks

**Template-Wochen:**
1. Ideale Woche planen
2. Als wiederholende Sitzungen speichern
3. Bei Bedarf einzelne Termine verschieben

**Puffer einplanen:**
- Nicht jeden Zeitslot vollpacken
- 1-2h pro Tag frei lassen
- Für spontane Sitzungen oder Erholung

### Statistik-Nutzung

**Wöchentliche Reviews:**
1. Jeden Sonntag: Statistiken ansehen
2. Fragen stellen:
   - Welches Fach wurde vernachlässigt?
   - Wann war ich am produktivsten?
   - Wie war mein Streak?
3. Nächste Woche entsprechend planen

**Monatliche Retrospektiven:**
1. XP-Verlauf prüfen: Aufwärtstrend?
2. Fach-Performance: Ausgewogen?
3. Feedback-Statistiken: Wo unproduktiv?
4. Ziele setzen: Nächsten Level, Streak, Fach-Fokus

---

## Häufig gestellte Fragen

### Allgemein

**F: Ist Lernplaner kostenlos?**
A: Ja, komplett kostenlos und Open Source!

**F: Funktioniert Lernplaner offline?**
A: Nein, aktuell nur online. Offline-Modus ist geplant (Roadmap).

**F: Kann ich Lernplaner auf dem Handy nutzen?**
A: Ja, über den Browser (responsive Design). Native App ist geplant.

### XP & Level

**F: Wie viel XP brauche ich für Level 100?**
A: 49.500 XP kumulativ (ca. 3.300 Stunden mit 15 XP/Min oder 4.950h mit 10 XP/Min)

**F: Kann ich XP verlieren?**
A: Ja, wenn du Sitzungen löschst oder Fächer mit Sitzungen löschst.

**F: Warum bekomme ich manchmal 10 XP/Min und manchmal 15 XP/Min?**
A: 15 XP/Min gibt's nur, wenn das Fach einen Prüfungstermin hat!

### Streaks

**F: Zählen mehrere Sitzungen an einem Tag mehrfach?**
A: Nein, Streak zählt nur Tage (nicht Sitzungen). 1 oder 10 Sitzungen = +1 Tag Streak.

**F: Was passiert, wenn ich im Urlaub bin?**
A: Streak bricht (aktuell). Zukünftig geplant: "Streak Freeze" (1x pro Monat 1 Tag auslassen).

**F: Kann ich Sitzungen nachträglich hinzufügen, um Streak zu retten?**
A: Ja, du kannst Sitzungen in der Vergangenheit anlegen. Aber bitte ehrlich bleiben! 😊

### Erfolge

**F: Wann werden neue Erfolge hinzugefügt?**
A: Regelmäßig! Siehe Roadmap oder folge GitHub-Updates.

**F: Bekomme ich Bonus-XP für Erfolge?**
A: Aktuell nein, aber geplant (z.B. +500 XP für 30-Tage-Streak).

### Technisches

**F: Wo werden meine Daten gespeichert?**
A: In einer PostgreSQL-Datenbank auf dem Server (DSGVO-konform).

**F: Kann ich meine Daten exportieren?**
A: Aktuell nein, aber geplant (CSV-Export in Roadmap).

**F: Werden meine Daten mit anderen geteilt?**
A: Nein! Deine Daten sind privat. Optional: Anonymisierte Statistiken für Forschung (opt-in).

---

**Du hast weitere Fragen?**
- **GitHub Issues:** https://github.com/dias-digital-assistant/lernplan_new/issues
- **E-Mail:** dias@hs-ansbach.de
- **Dokumentation:** [README.md](../README.md)

---

**Viel Erfolg mit Lernplaner!** 🎓📚🚀
