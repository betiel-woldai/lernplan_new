# 📁 Projektstruktur - Beginner-freundliche Organisation

> Diese Datei erklärt die neue, vereinfachte Ordnerstruktur für bessere Übersichtlichkeit.

## 🎯 Organisationsprinzip

**Hauptordner nur** - Keine tiefen Verschachtelungen für Anfänger!

```
lernplan_new/
│
├── 📚 docs/                 # DOKUMENTATION
├── ⚙️ setup/                # SETUP & INSTALLATION  
├── 🔧 config/               # KONFIGURATION
├── 📋 specs/                # SPEZIFIKATIONEN
│
├── README.md               # Projekt-Übersicht
└── CLAUDE.md              # Claude Code Anweisungen
```

## 📚 docs/ - Dokumentation

**Was gehört hier rein:** Alle Anleitungen und Dokumentation

```
docs/
├── README.md                    # Ausführliche Projektdokumentation
├── frontend-first-roadmap.md    # 10-Sprint Entwicklungsplan
└── github-issues.md            # Geplante GitHub Issues
```

**Für wen:** Entwickler, die das Projekt verstehen wollen

## ⚙️ setup/ - Setup & Installation

**Was gehört hier rein:** Alles was für Installation und Setup nötig ist

```
setup/
├── repository-setup.md         # Komplette Setup-Anleitung
├── docker-compose.yml          # Docker Services (DB + Keycloak)
└── docker/                     # Docker Konfigurationen
    └── Dockerfile.dev          # Development Container
```

**Für wen:** Entwickler, die das Projekt zum ersten Mal einrichten

## 🔧 config/ - Konfiguration

**Was gehört hier rein:** Konfigurationsdateien für verschiedene Services

```
config/
└── next-i18next.config.js      # Internationalisierung (DE/EN)
```

**Für wen:** Entwickler, die Services konfigurieren müssen

## 📋 specs/ - Spezifikationen

**Was gehört hier rein:** Original-Spezifikationen und Anforderungen

```
specs/
├── idea.md                     # Original Projektidee
└── structure.md               # Technische Spezifikationen
```

**Für wen:** Produktmanager und Entwickler für Requirement-Analyse

## ✅ Vorteile dieser Struktur

### Für Beginner:
- **Übersichtlich:** Nur 4 Hauptordner
- **Selbsterklärend:** Namen zeigen sofort den Zweck
- **Einfach zu navigieren:** Keine tiefen Verschachtelungen

### Für das Projekt:
- **Saubere Trennung:** Docs, Setup, Config, Specs getrennt
- **Einfache Wartung:** Schnell finden was man sucht
- **Skalierbar:** Struktur wächst mit dem Projekt

## 🚀 Nächste Schritte

1. **Verstehe die Struktur:** Diese Datei durchlesen
2. **Setup starten:** `setup/repository-setup.md` folgen
3. **Dokumentation lesen:** `docs/README.md` für Details
4. **Entwicklung beginnen:** Issues aus `docs/github-issues.md` bearbeiten

---

**💡 Tipp:** Halte diese Struktur einfach - füge nur neue Hauptordner hinzu wenn unbedingt nötig!