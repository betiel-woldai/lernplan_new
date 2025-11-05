/**
 * Utility functions for formatting data display
 */

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatLearningTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} Min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) {
    return `${hours} Std`;
  }
  
  return `${hours}h ${remainingMins}m`;
}

export function calculateXP(minutes: number, onTime: boolean = true, streak: number = 0): number {
  const baseXP = minutes * 2;
  const streakBonus = streak * 5;
  const punctualityBonus = onTime ? 20 : 0;
  return baseXP + streakBonus + punctualityBonus;
}

// Learning ranks - Returns translation keys for i18n support
export const LEARNING_RANK_KEYS: Record<number, string> = {
  1: 'ranks.wissenshunger',
  2: 'ranks.aufsteiger',
  3: 'ranks.durchstarter',
  4: 'ranks.wissensjaeger',
  5: 'ranks.lernrakete',
  6: 'ranks.denkpilot',
  7: 'ranks.ideensammler',
  8: 'ranks.wissensarchitekt',
  9: 'ranks.lernmeister',
  10: 'ranks.denkvirtuose',
  11: 'ranks.wissensguru',
  12: 'ranks.lernlegende',
  13: 'ranks.gedaechtnistitan',
  14: 'ranks.wissenskoenig',
  15: 'ranks.lernphilosoph'
};

export function getLevel(totalXP: number): number {
  if (totalXP < 100) return 1;
  if (totalXP < 500) return 2;
  if (totalXP < 1000) return 3;

  // Level 4+ follows pattern: Level n = 500 + (n-3) * 500
  // Level 4 = 1500, Level 5 = 2000, etc.
  const level = Math.floor((totalXP - 1000) / 500) + 4;
  return Math.max(4, level);
}

export function getXPForLevel(level: number): number {
  if (level <= 1) return 100;
  if (level === 2) return 500;
  if (level === 3) return 1000;

  // Level 4+ follows pattern: 500 + (level-3) * 500
  return 500 + (level - 3) * 500;
}

// Returns a translation key for the rank. Components should use t() to translate.
export function getLearningRank(level: number): string {
  return LEARNING_RANK_KEYS[level] || `Level ${level}`;
}

export function getXPProgress(currentXP: number, currentLevel: number): {
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const progressXP = currentXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progress = Math.max(0, Math.min(100, (progressXP / neededXP) * 100));
  
  return {
    currentLevelXP,
    nextLevelXP,
    progress
  };
}

export function formatStreak(days: number): string {
  if (days === 0) return 'Kein Streak';
  if (days === 1) return '1 Tag';
  return `${days} Tage`;
}

/**
 * Converts decimal hours to human-readable format (e.g., 1.67 -> "1h 40m")
 * @param decimalHours - Hours in decimal format (e.g., 1.67)
 * @returns Formatted string (e.g., "1h 40m")
 */
export function formatHours(decimalHours: number): string {
  if (decimalHours === 0) return '0h';

  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}