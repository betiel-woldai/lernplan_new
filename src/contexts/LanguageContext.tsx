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
    'nav.dashboard': 'Übersicht',
    'nav.subjects': 'Fächer',
    'nav.calendar': 'Kalender',
    'nav.analytics': 'Statistiken',
    'nav.settings': 'Einstellungen',
    
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
    'analytics.progressOverTime': 'Lernfortschritt über Zeit',
    'analytics.timeBySubject': 'Zeitverteilung nach Fach',
    'analytics.streaks': 'Lernstreifen',
    'analytics.goalProgress': 'Zielfortschritt',
    'analytics.subjectDetails': 'Fachdetails',
    'analytics.noData': 'Keine Daten verfügbar für ausgewählten Zeitraum',
    'analytics.noSubjectData': 'Keine Fachdaten verfügbar',
    'analytics.noStreakData': 'Keine Streak-Daten verfügbar',
    'analytics.noGoals': 'Keine Ziele gefunden',
    
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
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.subjects': 'Subjects',
    'nav.calendar': 'Calendar',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    
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
    'analytics.streaks': 'Learning Streaks',
    'analytics.goalProgress': 'Goal Progress',
    'analytics.subjectDetails': 'Subject Details',
    'analytics.noData': 'No progress data available for selected period',
    'analytics.noSubjectData': 'No subject data available',
    'analytics.noStreakData': 'No streak data available',
    'analytics.noGoals': 'No goals found',
    
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