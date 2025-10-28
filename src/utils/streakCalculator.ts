import { toBerlinDateString } from './timezone';

/**
 * Calculate the current learning streak for a user
 *
 * A streak is consecutive days with at least one completed learning session
 * - If session today AND yesterday → continue/increment streak
 * - If session today but NOT yesterday → streak = 1 (new streak starts)
 * - If NO session today → streak = 0 (broken, will be reset when next session completed)
 *
 * @param sessions - Array of session dates (must be sorted DESC by date)
 * @returns The current streak count
 */
export function calculateStreak(sessions: Array<{ date: string | Date; completed: boolean }>): number {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  // Filter only completed sessions
  const completedSessions = sessions.filter(s => s.completed);

  if (completedSessions.length === 0) {
    return 0;
  }

  // Get unique dates (in case multiple sessions on same day)
  // Convert date to string if it's a Date object
  const uniqueDates = Array.from(
    new Set(completedSessions.map(s => {
      const dateStr = s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date);
      return dateStr;
    }))
  ).sort((a, b) => b.localeCompare(a)); // DESC order

  if (uniqueDates.length === 0) {
    return 0;
  }

  // Get today's date in Berlin timezone
  const todayBerlin = toBerlinDateString(new Date());
  const mostRecentSessionDate = uniqueDates[0];

  // Check if most recent session is today or yesterday
  const today = new Date(todayBerlin);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayStr = toBerlinDateString(yesterday);

  // If most recent session is not today or yesterday, streak is broken
  if (mostRecentSessionDate !== todayBerlin && mostRecentSessionDate !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days backwards from the most recent session
  let streak = 1;
  let currentDate = new Date(mostRecentSessionDate);

  for (let i = 1; i < uniqueDates.length; i++) {
    const previousDate = new Date(uniqueDates[i]);
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);

    const prevDateStr = toBerlinDateString(previousDate);
    const expectedDateStr = toBerlinDateString(expectedDate);

    // Check if previous session is exactly one day before
    if (prevDateStr === expectedDateStr) {
      streak++;
      currentDate = previousDate;
    } else {
      // Gap found, stop counting
      break;
    }
  }

  return streak;
}

/**
 * Check if streak should be reset (no session today)
 * Used for UI updates on dashboard load
 *
 * @param lastSessionDate - The date of the most recent session (YYYY-MM-DD)
 * @returns true if streak should be reset to 0
 */
export function shouldResetStreak(lastSessionDate: string | null): boolean {
  if (!lastSessionDate) {
    return true;
  }

  const todayBerlin = toBerlinDateString(new Date());
  const yesterday = new Date(todayBerlin);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toBerlinDateString(yesterday);

  // If last session is not today or yesterday, streak should be reset
  return lastSessionDate !== todayBerlin && lastSessionDate !== yesterdayStr;
}
