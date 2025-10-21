// Utilities for resolving the active Lernplaner user id at runtime

/**
 * Get active user ID for server-side contexts.
 *
 * IMPORTANT: This should ONLY be used in:
 * - Cron jobs / scheduled tasks (no session context)
 * - System-level operations (e.g., terminplan import)
 *
 * For API endpoints, use getServerSession() directly to get user ID from session:
 *
 * ```typescript
 * import { getServerSession } from 'next-auth/next';
 * import { authOptions } from '@/pages/api/auth/[...nextauth]';
 *
 * const session = await getServerSession(req, res, authOptions);
 * if (!session) return res.status(401).json({ error: 'Unauthorized' });
 * const userId = session.sub;
 * ```
 */
export function getActiveUserId(): string {
  // Server-side: Try environment variable fallback (for cron/system tasks only)
  if (typeof window === 'undefined') {
    const serverId = process.env.DEFAULT_USER_ID || process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
    if (serverId && serverId.trim().length > 0) {
      return serverId;
    }
  }

  // Client-side: Environment variable fallback
  const clientId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
  if (clientId && clientId.trim().length > 0) {
    return clientId;
  }

  throw new Error(
    'No user ID available. For API endpoints, use getServerSession() to get authenticated user ID from session.'
  );
}
