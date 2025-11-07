import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { getVersionString } from '../utils/version';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { apiFetch } from '../lib/apiClient';
import CompactTimer from './CompactTimer';
import SubjectSelector from './SubjectSelector';
import SessionSummary from './SessionSummary';
import { useActiveSession } from '../hooks/useActiveSession';
import SimplifiedHeader from './SimplifiedHeader';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Lernplaner' }: LayoutProps) {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'loading';
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [completedSession, setCompletedSession] = useState<any>(null);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { sessionState, sessionData: activeSessionData } = useActiveSession();

  // Initialize user in database on first load
  useEffect(() => {
    const initializeUser = async () => {
      if (status === 'authenticated' && session) {
        try {
          await apiFetch('/api/users/init', {
            method: 'POST',
          });
        } catch (error) {
          // Silently fail - user will be initialized on next API call
        }
      }
    };

    if (typeof window !== 'undefined') {
      initializeUser();
    }
  }, [status, session]);

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const handleSessionCompleted = (session: any) => {
    setCompletedSession(session);
    setShowSessionSummary(true);
  };

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();

    // Check if already on this page
    if (router.pathname === path) {
      setIsMobileMenuOpen(false); // Close mobile menu
      return;
    }

    // Check if timer is running
    const isTimerRunning = sessionState === 'active' && activeSessionData !== null;

    if (isTimerRunning) {
      // Show warning modal
      setPendingNavigationPath(path);
      setShowNavigationWarning(true);
      setIsMobileMenuOpen(false); // Close mobile menu
    } else {
      // Navigate directly
      router.push(path);
      setIsMobileMenuOpen(false); // Close mobile menu
    }
  };

  const confirmNavigation = () => {
    setShowNavigationWarning(false);
    router.push(pendingNavigationPath);
    setPendingNavigationPath('');
  };

  const cancelNavigation = () => {
    setShowNavigationWarning(false);
    setPendingNavigationPath('');
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Gamifizierte Lernplattform für strukturiertes Lernen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Simplified Header - DIAS back button and logo */}
        <SimplifiedHeader />

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16 gap-2 sm:gap-6">
              {/* Lernplaner Logo */}
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Lernplaner</h1>
              </Link>

              {/* Spacer to push navigation to the right */}
              <div className="flex-grow"></div>

              {/* Language Selector - visible on all screen sizes */}
              <div className="flex items-center space-x-1 mr-4">
                <button
                  onClick={() => setLanguage('de')}
                  className={`px-2 py-1 text-xl rounded transition-all ${
                    language === 'de'
                      ? 'bg-blue-100 scale-110'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  title="Deutsch"
                >
                  🇩🇪
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xl rounded transition-all ${
                    language === 'en'
                      ? 'bg-blue-100 scale-110'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  title="English"
                >
                  🇺🇸
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  onClick={handleNavigation('/')}
                  className={`transition-colors ${
                    isActive('/')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/subjects"
                  onClick={handleNavigation('/subjects')}
                  className={`transition-colors ${
                    isActive('/subjects')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.subjects')}
                </Link>
                <Link
                  href="/analytics"
                  onClick={handleNavigation('/analytics')}
                  className={`transition-colors ${
                    isActive('/analytics')
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('nav.analytics')}
                </Link>
                {/* Compact Timer */}
                <CompactTimer
                  onShowSubjectSelector={() => setShowSubjectSelector(true)}
                  onShowSessionSummary={handleSessionCompleted}
                />

                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded" title={t('version.title')}>
                  {getVersionString()}
                </div>
              </nav>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Menu"
              >
                {isMobileMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
                {/* Language Selector in Mobile Menu */}
                <div className="flex items-center justify-center space-x-2 px-4 pb-3 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setLanguage('de');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-2xl rounded transition-all ${
                      language === 'de'
                        ? 'bg-blue-100 scale-110'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                    title="Deutsch"
                  >
                    🇩🇪
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 text-2xl rounded transition-all ${
                      language === 'en'
                        ? 'bg-blue-100 scale-110'
                        : 'opacity-50 hover:opacity-100'
                    }`}
                    title="English"
                  >
                    🇺🇸
                  </button>
                </div>

                <Link
                  href="/"
                  onClick={handleNavigation('/')}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/')
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/subjects"
                  onClick={handleNavigation('/subjects')}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/subjects')
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.subjects')}
                </Link>
                <Link
                  href="/analytics"
                  onClick={handleNavigation('/analytics')}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    isActive('/analytics')
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t('nav.analytics')}
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 text-sm">
              <p>{t('footer.copyright')}</p>
            </div>
          </div>
        </footer>

        {/* Subject Selector Modal */}
        <SubjectSelector
          isOpen={showSubjectSelector}
          onClose={() => setShowSubjectSelector(false)}
          onSessionStarted={() => setShowSubjectSelector(false)}
        />

        {/* Session Summary Modal */}
        <SessionSummary
          isOpen={showSessionSummary}
          onClose={() => {
            setShowSessionSummary(false);
            setCompletedSession(null);
          }}
          session={completedSession}
        />

        {/* Navigation Warning Modal */}
        {showNavigationWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t('nav.timerRunning')}
              </h3>
              <p className="text-gray-600 mb-3">
                {t('nav.timerRunningMessage')} <strong>{activeSessionData?.subjectName}</strong>.
              </p>
              <p className="text-gray-600 mb-3">
                {t('nav.timerRunningWarning')}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t('nav.timerRunningConfirm')}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelNavigation}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  {t('nav.timerRunningCancel')}
                </button>
                <button
                  onClick={confirmNavigation}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  {t('nav.timerRunningContinue')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}