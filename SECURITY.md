# Security Policy / Sicherheitsrichtlinie

🇬🇧 [English](#english) | 🇩🇪 [Deutsch](#deutsch)

---

## English

### Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

### Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please send an email to:

**dias@hs-ansbach.de**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within 48 hours. If the issue is confirmed, we will:
1. Work on a fix
2. Release a security patch
3. Credit you in the security advisory (unless you prefer to remain anonymous)

### Security Best Practices

When using this application:
- Never commit `.env` files with actual secrets
- Use strong passwords for all services
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting
- Enable CORS protection
- Regular security audits

### Known Security Considerations

- **Environment Variables:** Must be kept secure and never committed
- **Keycloak Integration:** Ensure Keycloak is properly configured with HTTPS
- **Database Access:** Use strong passwords and restrict network access
- **Session Management:** NextAuth sessions should have appropriate timeout
- **Admin Endpoints:** Protected with authentication

---

## Deutsch

### Unterstützte Versionen

Wir veröffentlichen Patches für Sicherheitslücken für folgende Versionen:

| Version | Unterstützt        |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

### Melden einer Sicherheitslücke

**Bitte melden Sie Sicherheitslücken nicht über öffentliche GitHub-Issues.**

Wenn Sie eine Sicherheitslücke entdecken, senden Sie bitte eine E-Mail an:

**dias@hs-ansbach.de**

Bitte fügen Sie hinzu:
- Beschreibung der Sicherheitslücke
- Schritte zur Reproduktion
- Potenzielle Auswirkungen
- Vorgeschlagene Lösung (falls vorhanden)

Sie sollten innerhalb von 48 Stunden eine Antwort erhalten. Wenn das Problem bestätigt wird, werden wir:
1. An einer Lösung arbeiten
2. Einen Sicherheits-Patch veröffentlichen
3. Sie im Sicherheitshinweis nennen (es sei denn, Sie möchten anonym bleiben)

### Sicherheits-Best-Practices

Bei Verwendung dieser Anwendung:
- Nie `.env`-Dateien mit echten Secrets committen
- Starke Passwörter für alle Services verwenden
- Abhängigkeiten aktuell halten
- HTTPS in Produktion verwenden
- Rate-Limiting implementieren
- CORS-Schutz aktivieren
- Regelmäßige Sicherheitsaudits

### Bekannte Sicherheitsüberlegungen

- **Umgebungsvariablen:** Müssen sicher aufbewahrt und nie committet werden
- **Keycloak-Integration:** Sicherstellen, dass Keycloak richtig mit HTTPS konfiguriert ist
- **Datenbankzugriff:** Starke Passwörter verwenden und Netzwerkzugriff einschränken
- **Session-Management:** NextAuth-Sessions sollten angemessene Timeouts haben
- **Admin-Endpunkte:** Mit Authentifizierung geschützt
