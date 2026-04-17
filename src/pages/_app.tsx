import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // Configure NextAuth basePath for production
  const authBasePath = process.env.NODE_ENV === 'production'
    ? '/dias/lernplaner/api/auth'
    : '/api/auth';

  return (
    <SessionProvider
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
      basePath={authBasePath}
    >
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </SessionProvider>
  );
}