import NextAuth,{type AuthOptions} from "next-auth";
const baseUrl = process.env.KEYCLOAK_BASE_URL;
const realmPath = "/keycloak/realms/dias";

export const authOptions: AuthOptions = {
  // Configure NextAuth to work with the base path
  useSecureCookies: true,
  providers: [
    {
      id: "keycloak",
      name: "Keycloak",
      type: "oauth" as const,
      wellKnown: `${baseUrl}${realmPath}/.well-known/openid-configuration`,
      issuer: `${baseUrl}${realmPath}`,
      authorization: {
        url: `${baseUrl}${realmPath}/protocol/openid-connect/auth`,
        params: { scope: "openid email profile roles" }
      },
      token: `${baseUrl}${realmPath}/protocol/openid-connect/token`,
      userinfo: `${baseUrl}${realmPath}/protocol/openid-connect/userinfo`,
      idToken: true,
      checks: ["pkce", "state"] as const,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          roles: profile.realm_access?.roles || [],
        }
      },
    }
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Session configuration
  session: {
    strategy: "jwt" as const,
    maxAge: 3600, // 1 hour in seconds
  },
  jwt: {
    maxAge: 3600, // 1 hour in seconds
  },
  // Cookie configuration - scoped to lernplaner path to prevent DIAS session conflicts
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/dias/lernplaner',
        secure: true,
        maxAge: 3600 // 1 hour in seconds
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'none' as const,
        path: '/dias/lernplaner',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/dias/lernplaner',
        secure: true
      }
    },
    pkceCodeVerifier: {
      name: `__Secure-next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/dias/lernplaner',
        secure: true,
        maxAge: 900 // 15 minutes
      }
    },
    state: {
      name: `__Secure-next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'none' as const,
        path: '/dias/lernplaner',
        secure: true,
        maxAge: 900 // 15 minutes
      }
    }
  },
  // Remove pages configuration to use NextAuth defaults
  // Remove custom redirect callback to let NextAuth handle routing
  callbacks: {
    async signIn() {
      return true;
    },
    async session({ session, token }: any) {
      // Add token expiry check
      if (token.error === "RefreshAccessTokenError") {
        return null;
      }

      // Add user ID (sub) and roles to session
      session.sub = token.sub;
      session.roles = token.roles || [];

      // Also add roles to session.user for compatibility with existing code
      if (session.user) {
        session.user.roles = token.roles || [];
      }

      return session;
    },
    async jwt({ token, user }: any) {
      // Store user ID and roles in token on first sign in
      if (user) {
        token.sub = user.id;
        token.roles = user.roles || [];
      }

      return token;
    }
  },
};

export default NextAuth(authOptions);
