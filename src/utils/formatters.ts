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

export function getLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

export function getXPForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
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