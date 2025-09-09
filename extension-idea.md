Ich beschreibe die Funktionen und ihre logischen Verknüpfungen für Ihre Lernplattform:

## Neue Struktur der Lernplattform

### 1. **Übersicht (neue Hauptseite mit Kalender)**
Die Übersicht wird zur zentralen Anlaufstelle der Plattform:
- **Primäre Ansicht**: Der vollständige Kalender mit allen Terminen und Lernsessions
- **Kompakte Darstellung**: Wichtige Informationen aus anderen Bereichen werden hier in verkleinerter Form angezeigt
- **Schnellzugriff**: Direkte Einsicht in anstehende Termine und geplante Lernsessions
- **Datenfluss**: Empfängt Daten aus allen anderen Bereichen und stellt sie übersichtlich dar

### 2. **Fächer (Lerntracker-Zentrale)**
Diese Seite wird zum aktiven Arbeitsbereich:
- **Lern-Session Tracker**: 
  - Start-Button aktiviert einen sichtbaren Timer
  - Automatische Verknüpfung mit dem gewählten Fach
  - Echtzeiterfassung der Lernzeit
- **Datenfluss**: 
  - Sendet Lerndaten an Kalender (zur Bestätigung)
  - Nach Bestätigung: Weiterleitung an Statistiken
  - Aktiviert Gamification-Elemente bei Zielerreichung

### 3. **Kalender (integriert in Übersicht)**
Der Kalender bietet volle Funktionalität:
- **Ansichtsmodi**: Monats-, Wochen- und Tagesansicht
- **Terminverwaltung**: 
  - Neue Termine erstellen und löschen
  - Lernzeiten anpassen
  - Import aus terminplan.json mit automatischen Updates
- **Session-Bestätigung**: 
  - Zentrale Stelle zur Validierung von Lernsessions
  - Nach Bestätigung werden Daten an alle verknüpften Module weitergeleitet
- **Datenfluss**: Fungiert als Datenverteiler für bestätigte Sessions

### 4. **Statistiken (Auswertungszentrale)**
Aggregiert und visualisiert alle Lerndaten:
- **Datenquellen**: 
  - Bestätigte Sessions aus dem Kalender
  - Fächerinformationen und Lernzeiten
  - Übersichtsdaten für Gesamtfortschritt
- **Darstellung**: 
  - Fortschrittsbalken pro Fach
  - Zeitstatistiken (täglich/wöchentlich/monatlich)
  - Leistungstrends und Zielerreichung
- **Datenfluss**: Reiner Datenempfänger, keine Rückgabe

### 5. **Technische Verknüpfungen**

**Datenfluss-Kreislauf**:
1. **Fächer** → Timer startet Lernsession
2. **Kalender** → Session wird angezeigt und kann bestätigt werden
3. **Bestätigung** → Daten fließen zu Statistiken und Gamification
4. **Übersicht** → Zeigt aktualisierte Informationen aus allen Bereichen

**Automatisierungen**:
- terminplan.json wird überwacht und Änderungen automatisch in den Kalender übernommen
- Keine hartcodierten Daten - alle Informationen stammen aus:
  - Benutzereingaben
  - Timer-Erfassungen
  - JSON-Dateien
  - Bestätigten Sessions

**Zentrale Datenspeicherung**:
- Alle Sessions, Termine und Fortschritte werden in einer zentralen Datenstruktur gespeichert
- Jedes Modul greift auf dieselbe Datenquelle zu
- Änderungen werden in Echtzeit an alle betroffenen Module propagiert

Diese Struktur gewährleistet eine nahtlose Integration aller Funktionen, wobei jede Komponente ihre spezifische Rolle hat, aber alle miteinander kommunizieren und Daten austauschen.