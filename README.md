# 🎓 Lernplaner - Gamified Learning Management Platform

> Gamifizierte Lernplattform mit XP-System, Streaks und intelligentem Scheduling für strukturiertes und motivierendes Lernen.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📁 Projektstruktur (Beginner-freundlich)

```
lernplan_new/
├── README.md              # Diese Datei - Projektübersicht
├── CLAUDE.md             # Anweisungen für Claude Code
│
├── docs/                 # 📚 DOKUMENTATION
│   ├── README.md         # Ausführliche Projektdokumentation  
│   ├── frontend-first-roadmap.md  # 10-Sprint Entwicklungsplan
│   └── github-issues.md  # Alle geplanten GitHub Issues
│
├── setup/               # ⚙️ SETUP & INSTALLATION
│   ├── repository-setup.md      # Komplette Setup-Anleitung
│   ├── docker-compose.yml       # Docker Services (DB + Keycloak)
│   └── docker/                  # Docker Konfigurationen
│       └── Dockerfile.dev       # Development Container
│
├── config/              # 🔧 KONFIGURATION
│   └── next-i18next.config.js  # Internationalisierung (DE/EN)
│
└── specs/               # 📋 SPEZIFIKATIONEN
    ├── idea.md          # Original Projektidee
    └── structure.md     # Technische Spezifikationen
```

## 🚀 Schnellstart

### 1. Repository klonen
```bash
git clone https://github.com/betiel-woldai/lernplan_new.git
cd lernplan_new
```

### 2. Dokumentation lesen
- **[docs/README.md](docs/README.md)** - Vollständige Projektdokumentation
- **[setup/repository-setup.md](setup/repository-setup.md)** - Detaillierte Setup-Anleitung
- **[docs/frontend-first-roadmap.md](docs/frontend-first-roadmap.md)** - Entwicklungsroadmap

### 3. Setup starten
```bash
# Alle Dependencies installieren
npm install

# Docker Services starten (PostgreSQL + Keycloak)
docker-compose -f setup/docker-compose.yml up -d

# Development Server starten
npm run dev
```

## 🎯 Nächste Schritte

1. **Setup durchführen:** Folge der Anleitung in `setup/repository-setup.md`
2. **Issues bearbeiten:** Beginne mit [Issue #1](https://github.com/betiel-woldai/lernplan_new/issues/1) (Dashboard UI)
3. **Roadmap folgen:** Nutze `docs/frontend-first-roadmap.md` für Sprint-Planung

## 🛠 Technologie-Stack

- **Frontend:** Next.js 14 (Pages Router), React 18, TypeScript, Tailwind CSS
- **Backend:** PostgreSQL, Keycloak Auth, Node.js API Routes
- **Infrastructure:** Docker Compose, Multi-Service Setup
- **Gamification:** XP-System, Levels, Badges, Streaks

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/betiel-woldai/lernplan_new/issues)
- **Dokumentation:** [docs/README.md](docs/README.md)
- **Setup-Hilfe:** [setup/repository-setup.md](setup/repository-setup.md)

---

**🎓 Für besseres Lernen - Mit Gamification zum Erfolg!**