/**
 * API Client utility for handling basePath in production
 * This ensures all API calls include the correct basePath prefix
 */

import getConfig from 'next/config';

// Get the basePath from Next.js public runtime config
function getBasePath(): string {
  const { publicRuntimeConfig } = getConfig() || {};
  return publicRuntimeConfig?.basePath || '';
}

/**
 * Helper function to build API URLs with correct basePath
 * @param path - API path (should start with /api/)
 * @returns Full API URL with basePath prefix
 */
export function getApiUrl(path: string): string {
  const basePath = getBasePath();

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Return full URL with basePath
  return `${basePath}${normalizedPath}`;
}

/**
 * Wrapper around fetch that automatically adds basePath
 * @param path - API path (should start with /api/)
 * @param options - Fetch options
 * @returns Fetch promise
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, options);
}
