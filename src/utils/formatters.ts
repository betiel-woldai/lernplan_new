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

// German learning ranks - Fun but professional progression
export const LEARNING_RANKS: Record<number, string> = {
  1: 'Wissenshunger', // Knowledge hunger
  2: 'Aufsteiger', // Rising star
  3: 'Durchstarter', // Go-getter
  4: 'Wissensjäger', // Knowledge hunter
  5: 'Lernrakete', // Learning rocket
  6: 'Denkpilot', // Think pilot
  7: 'Ideensammler', // Idea collector
  8: 'Wissensarchitekt', // Knowledge architect
  9: 'Lernmeister', // Learning master
  10: 'Denkvirtuose', // Thinking virtuoso
  11: 'Wissensguru', // Knowledge guru
  12: 'Lernlegende', // Learning legend
  13: 'Gedächtnistitan', // Memory titan
  14: 'Wissenskönig', // Knowledge king
  15: 'Lernphilosoph' // Learning philosopher
};

// Simple color mapping for each rank
export const RANK_COLORS: Record<number, string> = {
  1: '#22c55e', 2: '#16a34a', 3: '#eab308', 4: '#f97316', 5: '#ec4899',
  6: '#3b82f6', 7: '#f59e0b', 8: '#8b5cf6', 9: '#6366f1', 10: '#d946ef',
  11: '#7c3aed', 12: '#fbbf24', 13: '#ef4444', 14: '#f59e0b', 15: '#06b6d4'
};

// Motivational quotes and learning tips - rotating daily
export const MOTIVATIONAL_CONTENT = [
  { type: 'motivation', text: 'Jeder Experte war einmal ein Anfänger. Bleib dran!' },
  { type: 'motivation', text: 'Kleine Schritte führen zu großen Erfolgen!' },
  { type: 'motivation', text: 'Dein Gehirn ist ein Muskel - trainiere es täglich!' },
  { type: 'motivation', text: 'Erfolg ist die Summe kleiner Anstrengungen!' },
  { type: 'motivation', text: 'Du bist stärker als du denkst!' },
  { type: 'motivation', text: 'Wissen ist die einzige Investition, die sich immer auszahlt!' },
  { type: 'tip', text: 'Tipp: Mache alle 25 Minuten eine 5-Minuten-Pause (Pomodoro-Technik)' },
  { type: 'tip', text: 'Tipp: Wiederhole neue Inhalte nach 1, 7 und 30 Tagen (Spaced Repetition)' },
  { type: 'tip', text: 'Tipp: Erkläre das Gelernte jemandem - das festigt dein Wissen!' },
  { type: 'tip', text: 'Tipp: Lerne am Morgen, wenn dein Gehirn frisch ist!' },
  { type: 'tip', text: 'Tipp: Visualisiere komplexe Konzepte mit Mindmaps!' },
  { type: 'tip', text: 'Tipp: Bleib hydratisiert - Wasser hilft beim Denken!' },
  { type: 'motivation', text: 'Heute lernst du für die Person, die du morgen sein willst!' },
  { type: 'motivation', text: 'Fehler sind Beweise, dass du es versuchst!' },
  { type: 'tip', text: 'Tipp: Nutze verschiedene Sinne beim Lernen - schreiben, sprechen, hören!' },
  { type: 'motivation', text: 'Deine einzige Grenze ist die, die du dir selbst setzt!' }
];

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

export function getLearningRank(level: number): string {
  return LEARNING_RANKS[level] || `Level ${level}`;
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

export function getRankColor(level: number): string {
  return RANK_COLORS[level] || '#fbbf24';
}

export function getDailyMotivation(): { type: string; text: string } {
  // Use day of year to rotate through messages
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % MOTIVATIONAL_CONTENT.length;
  return MOTIVATIONAL_CONTENT[index];
}