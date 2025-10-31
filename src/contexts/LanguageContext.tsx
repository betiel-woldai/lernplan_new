import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Deutsche Übersetzungen
const translations = {
  de: {
    // Navigation
    'nav.backToDias': 'Zurück zur DIAS Übersicht',
    'nav.dashboard': 'Übersicht',
    'nav.subjects': 'Fächer',
    'nav.analytics': 'Statistiken',
    'nav.settings': 'Einstellungen',
    'nav.timerRunning': 'Timer läuft noch',
    'nav.timerRunningMessage': 'Du hast gerade eine Lernsession aktiv für',
    'nav.timerRunningWarning': 'Wenn du die Seite verlässt, wird die laufende Session beendet und nicht gespeichert.',
    'nav.timerRunningConfirm': 'Möchtest du wirklich fortfahren?',
    'nav.timerRunningCancel': 'Abbrechen',
    'nav.timerRunningContinue': 'Fortfahren und Session beenden',

    // Header & Dashboard
    'header.overview': 'Übersicht',
    'header.subtitle': 'Dein zentraler Lernplaner mit Kalender und Fortschritt',
    'header.loggedInAs': 'Angemeldet als',
    'header.welcomeBack': 'Willkommen zurück!',
    
    // Allgemeine Begriffe
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.add': 'Hinzufügen',
    'common.create': 'Erstellen',
    'common.update': 'Aktualisieren',
    'common.search': 'Suchen',
    'common.loading': 'Lädt...',
    'common.saving': 'Speichere...',
    'common.hours': 'Stunden',
    'common.minutes': 'Minuten',
    'common.days': 'Tage',
    'common.weeks': 'Wochen',
    'common.progress': 'Fortschritt',
    'common.complete': 'Abgeschlossen',
    'common.notes': 'Notizen',
    'common.today': 'Heute',
    'common.todays': 'Heutige',
    'common.loadError': 'Fehler beim Laden',
    
    // Subjects
    'subjects.title': 'Meine Fächer',
    'subjects.add': 'Fach hinzufügen',
    'subjects.addNew': 'Neues Fach hinzufügen',
    'subjects.edit': 'Fach bearbeiten',
    'subjects.delete': 'Fach löschen',
    'subjects.deleteConfirm': 'Fach löschen?',
    'subjects.deleteWarning': 'Diese Aktion kann nicht rückgängig gemacht werden.',
    'subjects.search.placeholder': 'Fächer nach Name oder Farbe suchen...',
    'subjects.noResults': 'Keine Fächer gefunden',
    'subjects.noSubjects': 'Noch keine Fächer',
    'subjects.noResultsHelp': 'Versuche deine Suchbegriffe anzupassen.',
    'subjects.noSubjectsHelp': 'Beginne mit dem Hinzufügen deines ersten Fachs.',
    'subjects.addFirst': 'Erstes Fach hinzufügen',
    'subjects.description': 'Verwalte deine Fächer mit personalisierten Einstellungen und verfolge deinen Fortschritt.',
    'subjects.quickStart': 'Schnellstart: Klicken Sie auf den grünen "Start"-Button auf einer beliebigen Fach-Karte, um eine Lernsession zu beginnen. Der kompakte Timer erscheint in der Kopfzeile und Sessions werden automatisch in Ihrem Kalender gespeichert, wenn sie abgeschlossen sind.',
    'subjects.quickStartForSubjects': 'Schnellstart: Klicke auf "Fach hinzufügen", lege dein Lernfach an und lass dir automatisiert Lernsessions im Kalendar generieren bis zu deiner Prüfung.',
    
    // Subject Form
    'subject.name': 'Fachname',
    'subject.name.placeholder': 'z.B. Mathematik, Physik, Chemie',
    'subject.color': 'Fachfarbe',
    'subject.startDate': 'Startdatum',
    'subject.examDate': 'Prüfungsdatum',
    'subject.hoursPerWeek': 'Stunden pro Woche',
    'subject.daysPerWeek': 'Tage pro Woche',
    'subject.intensityWeeks': 'Intensivwochen',
    'subject.intensityWeeks.help': 'Wochen vor der Prüfung für intensives Lernen',
    'subject.createDescription': 'Erstelle ein neues Fach mit deinen bevorzugten Einstellungen und Farbe.',
    'subject.editDescription': 'Aktualisiere deine Fachdetails und Einstellungen.',
    'subject.examPassed': 'Prüfung vorbei',
    
    // Sessions
    'session.start': 'Session starten',
    'session.startLearning': 'Lernsession starten',
    'session.title': 'Lernsession starten',
    'session.subject': 'Fach',
    'session.duration': 'Zieldauer',
    'session.notes': 'Session-Notizen',
    'session.notes.optional': 'Session-Notizen (Optional)',
    'session.notes.placeholder': 'Woran möchtest du in dieser Session arbeiten?',
    'session.noSubjects': 'Keine Fächer gefunden. Erstelle zuerst ein Fach, um eine Session zu starten.',
    'session.starting': 'Wird gestartet...',
    'subject.yourLearningSubjects': 'Deine Lernfächer',
    'subject.manageAndConfigureYourLearningSubjects': 'Verwalte und konfiguriere deine Lernfächer',
    
    // Duration Options
    'duration.15min': '15 Minuten',
    'duration.25min': '25 Minuten (Pomodoro)',
    'duration.30min': '30 Minuten',
    'duration.45min': '45 Minuten',
    'duration.1hour': '1 Stunde',
    'duration.1.5hours': '1,5 Stunden',
    'duration.2hours': '2 Stunden',
    
    // Session Timer
    'timer.target': 'Ziel:',
    'timer.remaining': 'Verbleibend:',
    'timer.targetReached': 'Zielzeit erreicht!',
    'timer.pause': 'Pause',
    'timer.resume': 'Fortsetzen',
    'timer.complete': 'Beenden',
    
    // Analytics
    'analytics.title': 'Fortschritts-Statistiken',
    'analytics.subtitle': 'Verfolge deinen Lernfortschritt und Erkenntnisse',
    'analytics.totalHours': 'Gesamtstunden',
    'analytics.sessions': 'Sessions',
    'analytics.totalXP': 'Gesamt-XP',
    'analytics.avgSession': 'Ø Session',
    'analytics.completed': 'abgeschlossen',
    'analytics.completedSessions': 'Abgeschlossene Sessions',
    'analytics.successRate': 'Erfolgsrate',
    'analytics.completionRate': 'Abschlussrate',
    'analytics.progressOverTime': 'Lernfortschritt über Zeit',
    'analytics.timeBySubject': 'Zeitverteilung nach Fach',
    'analytics.streaks': 'Streak',
    'analytics.learningStreaks': 'Streak',
    'analytics.goalProgress': 'Zielfortschritt',
    'analytics.subjectDetails': 'Fachdetails',
    'analytics.noData': 'Keine Daten verfügbar für ausgewählten Zeitraum',
    'analytics.noSubjectData': 'Keine Fachdaten verfügbar',
    'analytics.noStreakData': 'Keine Streak-Daten verfügbar',
    'analytics.noGoals': 'Keine Ziele gefunden',
    'analytics.updating': 'Aktualisiere...',
    'analytics.lastUpdated': 'Zuletzt aktualisiert:',
    'analytics.of': 'von',
    'analytics.daysRemaining': 'Tage verbleibend',
    'analytics.overdue': 'Überfällig',
    'analytics.subject': 'Fach',
    'analytics.hours': 'Stunden',
    'analytics.progress': 'Fortschritt',

    // Stats & Dashboard
    'stats.of2hGoal': 'von 2h Ziel',
    'stats.completedToday': 'heute abgeschlossen',
    'stats.completedOn': 'abgeschlossen',
    'stats.daysInARowUntilToday': 'Tage in Folge bis heute',
    'stats.daysInARowUntil': 'Tage in Folge bis',
    'stats.learningTime': 'Lernzeit',
    'stats.sessionsCompleted': 'Sessions abgeschlossen',
    'stats.onThisDay': 'an diesem Tag',
    'stats.learningStreak': 'Lernstreak',
    'stats.newRecord': 'Neuer Rekord!',
    'stats.levelAndXP': 'Level & XP',
    'stats.level': 'Level',
    'stats.rank': 'Rank',
    'dashboard.quickOverview': 'Schnellübersicht',

    // Calendar
    'calendar.errorLoadingData': 'Fehler beim Laden der Kalenderdaten',
    'calendar.loadingData': 'Lade Kalenderdaten...',
    'calendar.title': 'Lernkalender',
    'calendar.clickForDetails': 'Klicke auf Termine für Details',
    'calendar.today': 'Heute',
    'calendar.hsTermine': 'HS‑Termine',
    'calendar.session': 'Session',
    'calendar.month': 'Monat',
    'calendar.week': 'Woche',
    'calendar.day': 'Tag',
    'calendar.instructions': 'Kalender-Funktionen: Erstelle ein Fach, um Sessions automatisiert zu generieren oder klicke auf einen Tag und auf "+ Session", um neue Sessions zu erstellen. Rechtsklick auf Sessions für Bearbeiten, Duplizieren oder Löschen. Sessions per Drag-and-Drop verschieben. Doppelklick für Schnellbearbeitung.',
    'calendar.deleteConfirm': 'Sind Sie sicher, dass Sie löschen möchten',
    'calendar.addSession': 'Session hinzufügen',
    'calendar.selectDate': 'Wähle ein Datum aus',
    'calendar.selectedDate': 'Ausgewähltes Datum',
    'calendar.loadError': 'Fehler beim Laden der Kalenderdaten',
    'calendar.more': 'mehr',

    // Day names (short)
    'days.sun': 'So',
    'days.mon': 'Mo',
    'days.tue': 'Di',
    'days.wed': 'Mi',
    'days.thu': 'Do',
    'days.fri': 'Fr',
    'days.sat': 'Sa',

    // Months names
    'months.january': 'Januar',
    'months.february': 'Februar',
    'months.march': 'März',
    'months.april': 'April',
    'months.may': 'Mai',
    'months.june': 'Juni',
    'months.july': 'Juli',
    'months.august': 'August',
    'months.september': 'September',
    'months.october': 'Oktober',
    'months.november': 'November',
    'months.december': 'Dezember',

    // Session Status & Errors
    'session.status': 'Status',
    'session.completed': 'Abgeschlossen',
    'session.pending': 'Ausstehend',
    'session.pendingReverted': 'Ausstehend (Rückgängig)',
    'session.errorSaving': 'Fehler beim Speichern der Session',
    'session.errorDeleting': 'Fehler beim Löschen der Session',
    'session.errorCreating': 'Fehler beim Erstellen der Session',

    // Time Periods
    'period.thisWeek': 'Diese Woche',
    'period.thisMonth': 'Dieser Monat',
    'period.thisYear': 'Dieses Jahr',
    
    // Color Picker
    'color.selected': 'Ausgewählte Farbe:',
    'color.select': 'Farbe auswählen',
    
    // Settings
    'settings.title': 'Einstellungen',
    'settings.language': 'Sprache',
    'settings.language.german': 'Deutsch',
    'settings.language.english': 'English',
    'settings.language.description': 'Wähle deine bevorzugte Sprache für die Benutzeroberfläche.',
    
    // Version Info
    'version.title': 'Version und Build-Info',

    // Rank & Gamification (Learning Ranks by Level)
    'ranks.wissenshunger': 'Wissenshunger',
    'ranks.aufsteiger': 'Aufsteiger',
    'ranks.durchstarter': 'Durchstarter',
    'ranks.wissensjaeger': 'Wissensjäger',
    'ranks.lernrakete': 'Lernrakete',
    'ranks.denkpilot': 'Denkpilot',
    'ranks.ideensammler': 'Ideensammler',
    'ranks.wissensarchitekt': 'Wissensarchitekt',
    'ranks.lernmeister': 'Lernmeister',
    'ranks.denkvirtuose': 'Denkvirtuose',
    'ranks.wissensguru': 'Wissensguru',
    'ranks.lernlegende': 'Lernlegende',
    'ranks.gedaechtnistitan': 'Gedächtnistitan',
    'ranks.wissenskoenig': 'Wissenskönig',
    'ranks.lernphilosoph': 'Lernphilosoph',

    // Footer
    'footer.copyright': '© DIAS | Digitaler Intelligenter Assistent',
  },
  en: {
    // Navigation
    'nav.backToDias': 'Back to DIAS overview',
    'nav.dashboard': 'Dashboard',
    'nav.subjects': 'Subjects',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.timerRunning': 'Timer still running',
    'nav.timerRunningMessage': 'You have an active learning session for',
    'nav.timerRunningWarning': 'If you leave this page, the running session will be ended and not saved.',
    'nav.timerRunningConfirm': 'Do you really want to continue?',
    'nav.timerRunningCancel': 'Cancel',
    'nav.timerRunningContinue': 'Continue and end session',

    // Header & Dashboard
    'header.overview': 'Overview',
    'header.subtitle': 'Your central learning planner with calendar and progress',
    'header.loggedInAs': 'Logged in as',
    'header.welcomeBack': 'Welcome back!',
    
    // Common Terms
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.saving': 'Saving...',
    'common.hours': 'hours',
    'common.minutes': 'minutes',
    'common.days': 'days',
    'common.weeks': 'weeks',
    'common.progress': 'Progress',
    'common.complete': 'complete',
    'common.notes': 'Notes',
    'common.today': 'Today',
    'common.todays': "Today's",
    'common.loadError': 'Error loading',
    
    // Subjects
    'subjects.title': 'My Subjects',
    'subjects.add': 'Add Subject',
    'subjects.addNew': 'Add New Subject',
    'subjects.edit': 'Edit Subject',
    'subjects.delete': 'Delete Subject',
    'subjects.deleteConfirm': 'Delete Subject?',
    'subjects.deleteWarning': 'This action cannot be undone.',
    'subjects.search.placeholder': 'Search subjects by name or color...',
    'subjects.noResults': 'No subjects found',
    'subjects.noSubjects': 'No subjects yet',
    'subjects.noResultsHelp': 'Try adjusting your search terms or filters.',
    'subjects.noSubjectsHelp': 'Get started by adding your first subject.',
    'subjects.addFirst': 'Add Your First Subject',
    'subjects.description': 'Manage your subjects with personalized settings and track your progress.',
    'subjects.quickStart': 'Quick Start: Click the green "Start" button on any subject card to begin a learning session. The compact timer appears in the header and sessions are automatically saved to your calendar when completed.',
    'subjects.quickStartForSubjects': 'Quick start: Click on "Add subject", create your learning subject, and have learning sessions automatically generated in your calendar until your exam.',

    // Subject Form
    'subject.name': 'Subject Name',
    'subject.name.placeholder': 'e.g., Mathematics, Physics, Chemistry',
    'subject.color': 'Subject Color',
    'subject.startDate': 'Start Date',
    'subject.examDate': 'Exam Date',
    'subject.hoursPerWeek': 'Hours per Week',
    'subject.daysPerWeek': 'Days per Week',
    'subject.intensityWeeks': 'Intensity Weeks',
    'subject.intensityWeeks.help': 'Weeks before exam for intensive study',
    'subject.createDescription': 'Create a new subject with your preferred settings and color.',
    'subject.editDescription': 'Update your subject details and preferences.',
    'subject.examPassed': 'Exam passed',
    'subject.yourLearningSubjects': 'Your Learning Subjects',
    'subject.manageAndConfigureYourLearningSubjects': 'Manage and configure your learning subjects',
    
    // Sessions
    'session.start': 'Start Session',
    'session.startLearning': 'Start learning session',
    'session.title': 'Start Learning Session',
    'session.subject': 'Subject',
    'session.duration': 'Target Duration',
    'session.notes': 'Session Notes',
    'session.notes.optional': 'Session Notes (Optional)',
    'session.notes.placeholder': 'What do you plan to work on during this session?',
    'session.noSubjects': 'No subjects found. Create a subject first to start a session.',
    'session.starting': 'Starting...',
    
    // Duration Options
    'duration.15min': '15 minutes',
    'duration.25min': '25 minutes (Pomodoro)',
    'duration.30min': '30 minutes',
    'duration.45min': '45 minutes',
    'duration.1hour': '1 hour',
    'duration.1.5hours': '1.5 hours',
    'duration.2hours': '2 hours',
    
    // Session Timer
    'timer.target': 'Target:',
    'timer.remaining': 'Remaining:',
    'timer.targetReached': 'Target time reached!',
    'timer.pause': 'Pause',
    'timer.resume': 'Resume',
    'timer.complete': 'Complete',
    
    // Analytics
    'analytics.title': 'Progress Analytics',
    'analytics.subtitle': 'Track your learning progress and insights',
    'analytics.totalHours': 'Total Hours',
    'analytics.sessions': 'Sessions',
    'analytics.totalXP': 'Total XP',
    'analytics.avgSession': 'Avg Session',
    'analytics.progressOverTime': 'Learning Progress Over Time',
    'analytics.timeBySubject': 'Time Distribution by Subject',
    'analytics.streaks': 'Streak',
    'analytics.goalProgress': 'Goal Progress',
    'analytics.subjectDetails': 'Subject Details',
    'analytics.noData': 'No progress data available for selected period',
    'analytics.noSubjectData': 'No subject data available',
    'analytics.noStreakData': 'No streak data available',
    'analytics.noGoals': 'No goals found',
    'analytics.completed': 'completed',

    // Stats & Dashboard
    'stats.of2hGoal': 'of 2h goal',
    'stats.completedToday': 'completed today',
    'stats.completedOn': 'completed',
    'stats.daysInARowUntilToday': 'days in a row until today',
    'stats.daysInARowUntil': 'days in a row until',
    'stats.learningTime': 'Learning Time',
    'stats.sessionsCompleted': 'sessions completed',
    'stats.onThisDay': 'on this day',
    'stats.learningStreak': 'Learning Streak',
    'stats.newRecord': 'New Record!',
    'stats.levelAndXP': 'Level & XP',
    'stats.level': 'Level',
    'stats.rank': 'Rank',
    'dashboard.quickOverview': 'Quick Overview',

    // Calendar
    'calendar.errorLoadingData': 'Error loading calendar data',
    'calendar.loadingData': 'Loading calendar data...',
    'calendar.title': 'Learning Calendar',
    'calendar.clickForDetails': 'Click on appointments for details',
    'calendar.today': 'Today',
    'calendar.hsTermine': 'University Events',
    'calendar.session': 'Session',
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.instructions': 'Calendar functions: Create a subject to automatically generate sessions, or click on a day and then "+ Session" to create new sessions. Right-click on sessions to edit, duplicate, or delete. Move sessions using drag and drop. Double-click for quick editing.',
    'calendar.deleteConfirm': 'Are you sure you want to delete',
    'calendar.addSession': 'Add session',
    'calendar.selectDate': 'Select a date',
    'calendar.selectedDate': 'Selected date',
    'calendar.loadError': 'Error loading calendar data',
    'calendar.more': 'more',

    // Day names (short)
    'days.sun': 'Sun',
    'days.mon': 'Mon',
    'days.tue': 'Tue',
    'days.wed': 'Wed',
    'days.thu': 'Thu',
    'days.fri': 'Fri',
    'days.sat': 'Sat',

    // Months names
    'months.january': 'January',
    'months.february': 'February',
    'months.march': 'March',
    'months.april': 'April',
    'months.may': 'May',
    'months.june': 'June',
    'months.july': 'July',
    'months.august': 'August',
    'months.september': 'September',
    'months.october': 'October',
    'months.november': 'November',
    'months.december': 'December',

    // Session Status & Errors
    'session.status': 'Status',
    'session.completed': 'Completed',
    'session.pending': 'Pending',
    'session.pendingReverted': 'Pending (Reverted)',
    'session.errorSaving': 'Error saving session',
    'session.errorDeleting': 'Error deleting session',
    'session.errorCreating': 'Error creating session',

    // Time Periods
    'period.thisWeek': 'This Week',
    'period.thisMonth': 'This Month',
    'period.thisYear': 'This Year',
    
    // Color Picker
    'color.selected': 'Selected color:',
    'color.select': 'Select color',
    
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.language.german': 'Deutsch',
    'settings.language.english': 'English',
    'settings.language.description': 'Choose your preferred language for the user interface.',
    
    // Version Info
    'version.title': 'Version and build info',

    // Rank & Gamification (Learning Ranks by Level)
    'ranks.wissenshunger': 'Knowledge Seeker',
    'ranks.aufsteiger': 'Rising Star',
    'ranks.durchstarter': 'Go-Getter',
    'ranks.wissensjaeger': 'Knowledge Hunter',
    'ranks.lernrakete': 'Learning Rocket',
    'ranks.denkpilot': 'Think Pilot',
    'ranks.ideensammler': 'Idea Collector',
    'ranks.wissensarchitekt': 'Knowledge Architect',
    'ranks.lernmeister': 'Learning Master',
    'ranks.denkvirtuose': 'Thinking Virtuoso',
    'ranks.wissensguru': 'Knowledge Guru',
    'ranks.lernlegende': 'Learning Legend',
    'ranks.gedaechtnistitan': 'Memory Titan',
    'ranks.wissenskoenig': 'Knowledge King',
    'ranks.lernphilosoph': 'Learning Philosopher',

    // Footer
    'footer.copyright': '© DIAS | Digital Intelligent Assistant',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('de'); // Standard: Deutsch

  // Lade gespeicherte Sprache beim Start
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Speichere Sprachänderung
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Übersetzungsfunktion
  const t = (key: string): string => {
    return (translations[language] as any)[key] || (translations['en'] as any)[key] || key;
  };

  const value = {
    language,
    setLanguage: handleLanguageChange,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}