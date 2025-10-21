import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </SessionProvider>
  );
}