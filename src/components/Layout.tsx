import { ReactNode } from 'react';
import Head from 'next/head';
import { getVersionString } from '../utils/version';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'Lernplaner' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Gamifizierte Lernplattform für strukturiertes Lernen" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Lernplaner</h1>
              </div>
              
              {/* Navigation would go here */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Fächer</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Kalender</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Fortschritt</a>
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded" title="Version and build info">
                  {getVersionString()}
                </div>
              </nav>
            </div>
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
              <p>&copy; 2024 Lernplaner. Für besseres Lernen mit Gamification.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}