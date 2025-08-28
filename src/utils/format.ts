// Utility functions for consistent formatting across client and server

// Fixed number formatting to prevent hydration errors
export const formatNumber = (num: number): string => {
  // Use consistent formatting for both client and server
  if (num >= 1000) {
    return Math.floor(num / 1000) + ',' + String(num % 1000).padStart(3, '0');
  }
  return num.toString();
};

export const formatXP = (xp: number): string => {
  return `${formatNumber(xp)} XP`;
};

export const formatXPTotal = (xp: number): string => {
  return `${formatNumber(xp)} XP Total`;
};

export const formatRemainingXP = (remaining: number, nextLevel: number): string => {
  return `${formatNumber(remaining)} XP bis Level ${nextLevel}`;
};