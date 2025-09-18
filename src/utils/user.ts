// Utilities for resolving the active Lernplaner user id at runtime

function resolveUserId(): string | undefined {
  if (typeof window === 'undefined') {
    return process.env.DEFAULT_USER_ID || process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
  }

  return process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
}

export function getActiveUserId(): string {
  const resolved = resolveUserId();

  if (!resolved || resolved.trim().length === 0) {
    throw new Error(
      'Active user id is not configured. Set NEXT_PUBLIC_DEFAULT_USER_ID (and DEFAULT_USER_ID for server-side usage).'
    );
  }

  return resolved;
}
