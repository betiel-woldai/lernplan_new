import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    sub?: string; // Keycloak user ID
    roles?: string[]; // User roles from Keycloak
    user: {
      roles?: string[]; // User roles (duplicate for compatibility)
    } & DefaultSession['user'];
  }
}
