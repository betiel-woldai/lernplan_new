module.exports = {
  i18n: {
    defaultLocale: 'de',
    locales: ['en', 'de'],
  },
  fallbackLng: 'de',
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  // Namespace configuration
  ns: ['common', 'dashboard', 'subjects', 'gamification'],
  defaultNS: 'common',
  
  // Interpolation settings
  interpolation: {
    escapeValue: false, // not needed for React
  },
}