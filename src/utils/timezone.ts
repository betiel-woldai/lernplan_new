/**
 * Timezone utilities for Berlin time (UTC+1/UTC+2 with DST)
 */

/**
 * Get current date in Berlin timezone formatted as YYYY-MM-DD
 */
export function getBerlinDateString(): string {
  const now = new Date();

  // Convert to Berlin timezone (Europe/Berlin handles DST automatically)
  const berlinDate = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));

  // Format as YYYY-MM-DD
  const year = berlinDate.getFullYear();
  const month = (berlinDate.getMonth() + 1).toString().padStart(2, '0');
  const day = berlinDate.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get current timestamp in Berlin timezone
 */
export function getBerlinTimestamp(): Date {
  const now = new Date();

  // Convert to Berlin timezone
  const berlinDate = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));

  return berlinDate;
}

/**
 * Convert any date to Berlin timezone
 */
export function toBerlinTime(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
}

/**
 * Format the provided date as YYYY-MM-DD in Berlin timezone.
 */
export function toBerlinDateString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

/**
 * Format date for Berlin timezone display
 */
export function formatBerlinDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Berlin",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };

  return date.toLocaleDateString('de-DE', defaultOptions);
}

/**
 * Format time for Berlin timezone display
 */
export function formatBerlinTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Berlin",
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  return date.toLocaleTimeString('de-DE', defaultOptions);
}

/**
 * Check if we're currently in daylight saving time in Berlin
 */
export function isBerlinDST(): boolean {
  const now = new Date();
  const january = new Date(now.getFullYear(), 0, 1);
  const july = new Date(now.getFullYear(), 6, 1);

  const januaryOffset = january.getTimezoneOffset();
  const julyOffset = july.getTimezoneOffset();

  // If current offset is different from January, we're in DST
  return now.getTimezoneOffset() !== januaryOffset;
}

/**
 * Get the current UTC offset for Berlin (accounting for DST)
 */
export function getBerlinUTCOffset(): string {
  const isDST = isBerlinDST();
  return isDST ? 'UTC+2' : 'UTC+1';
}
