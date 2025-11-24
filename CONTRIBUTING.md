# Contributing to DIAS Frontend / Mitwirken am DIAS Frontend

🇬🇧 [English](#english) | 🇩🇪 [Deutsch](#deutsch)

---

## English

Thank you for your interest in contributing to the DIAS Frontend project! We welcome contributions from everyone.

### Code of Conduct

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

### How Can I Contribute?

#### Reporting Bugs

- Use GitHub Issues to report bugs
- Check if the bug has already been reported
- Include steps to reproduce, expected behavior, and actual behavior
- Add screenshots if applicable
- Include environment details (browser, OS, Node version)

#### Suggesting Enhancements

- Use GitHub Issues with the "enhancement" label
- Clearly describe the feature and its benefits
- Provide examples or mockups if possible

#### Pull Requests

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/my-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit:** Use clear, descriptive commit messages
6. **Push:** `git push origin feature/my-feature`
7. **Open a Pull Request**

### Development Guidelines

#### Code Style

- Follow existing code patterns
- Use ESLint for JavaScript/TypeScript
- Keep functions small and focused
- Write meaningful variable and function names
- Comment complex logic

#### Testing

- Add tests for new features
- Ensure all tests pass before submitting PR
- Test on multiple browsers if UI changes

#### Documentation

- Update README.md if adding features
- Document API changes
- Add JSDoc comments for functions
- Update CHANGELOG.md

#### Commit Messages

Use conventional commit format:
```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(timer): add pause functionality
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
```

### Project Structure

- `/components` - React components
- `/pages` - Next.js pages and API routes
- `/lib` - Utility functions and libraries
- `/styles` - CSS modules
- `/public` - Static assets

### Getting Help

- Open a GitHub Discussion
- Ask in GitHub Issues
- Email: dias@hs-ansbach.de

---

## Deutsch

Vielen Dank für Ihr Interesse, zum DIAS-Frontend-Projekt beizutragen! Wir begrüßen Beiträge von allen.

### Verhaltenskodex

Bitte lesen Sie unseren [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) vor dem Mitwirken.

### Wie kann ich mitwirken?

#### Fehler melden

- Verwenden Sie GitHub Issues, um Fehler zu melden
- Prüfen Sie, ob der Fehler bereits gemeldet wurde
- Fügen Sie Schritte zur Reproduktion, erwartetes und tatsächliches Verhalten hinzu
- Fügen Sie Screenshots hinzu, falls zutreffend
- Geben Sie Umgebungsdetails an (Browser, OS, Node-Version)

#### Verbesserungen vorschlagen

- Verwenden Sie GitHub Issues mit dem Label "enhancement"
- Beschreiben Sie die Funktion und ihre Vorteile klar
- Stellen Sie Beispiele oder Mockups bereit, wenn möglich

#### Pull Requests

1. **Repository forken**
2. **Feature-Branch erstellen:** `git checkout -b feature/meine-funktion`
3. **Änderungen vornehmen**
4. **Gründlich testen**
5. **Committen:** Verwenden Sie klare, beschreibende Commit-Nachrichten
6. **Pushen:** `git push origin feature/meine-funktion`
7. **Pull Request öffnen**

### Entwicklungsrichtlinien

#### Code-Stil

- Folgen Sie bestehenden Code-Mustern
- Verwenden Sie ESLint für JavaScript/TypeScript
- Halten Sie Funktionen klein und fokussiert
- Schreiben Sie aussagekräftige Variablen- und Funktionsnamen
- Kommentieren Sie komplexe Logik

#### Testen

- Fügen Sie Tests für neue Funktionen hinzu
- Stellen Sie sicher, dass alle Tests vor dem Einreichen der PR bestehen
- Testen Sie auf mehreren Browsern bei UI-Änderungen

#### Dokumentation

- Aktualisieren Sie README.md beim Hinzufügen von Funktionen
- Dokumentieren Sie API-Änderungen
- Fügen Sie JSDoc-Kommentare für Funktionen hinzu
- Aktualisieren Sie CHANGELOG.md

#### Commit-Nachrichten

Verwenden Sie das Conventional-Commit-Format:
```
typ(bereich): betreff

nachricht (optional)

fußzeile (optional)
```

Typen: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Beispiele:
```
feat(timer): Pausenfunktion hinzufügen
fix(auth): Session-Timeout-Problem beheben
docs(readme): Installationsanweisungen aktualisieren
```

### Projektstruktur

- `/components` - React-Komponenten
- `/pages` - Next.js-Seiten und API-Routen
- `/lib` - Utility-Funktionen und Bibliotheken
- `/styles` - CSS-Module
- `/public` - Statische Assets

### Hilfe erhalten

- Öffnen Sie eine GitHub-Diskussion
- Fragen Sie in GitHub Issues
- E-Mail: dias@hs-ansbach.de
