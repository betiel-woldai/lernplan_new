import { UserStats, Achievement, Subject } from '@/types';

// Empty achievements - ready for user to unlock
export const mockAchievements: Achievement[] = [];

// Fresh user stats - ready for new user to start
export const mockUserStats: UserStats = {
  id: 'user-1',
  name: 'New User',
  email: 'user@example.com',
  
  // Gamification Stats - starting from zero
  currentLevel: 1,
  currentXP: 0,
  nextLevelXP: 100,
  learningStreak: 0,
  
  // Learning Stats - all empty
  dailyLearningTime: 0,
  weeklyLearningTime: 0,
  totalHours: 0,
  completedTasks: 0,
  totalCompletedTasks: 0,
  
  // Achievements
  achievements: mockAchievements,
  
  // Timestamps
  createdAt: new Date(),
  lastActiveAt: new Date()
};

// Empty subjects array - ready for user to add their subjects
export const mockSubjects: Subject[] = [];