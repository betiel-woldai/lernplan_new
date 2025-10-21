export interface UserStats {
  id: string;
  name: string;
  email: string;
  
  // Gamification Stats
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  learningStreak: number; // days
  
  // Learning Stats
  dailyLearningTime: number; // minutes today
  weeklyLearningTime: number; // minutes this week
  totalHours: number; // all time
  completedTasks: number; // today
  totalCompletedTasks: number; // all time
  
  // Achievements
  achievements: Achievement[];
  
  // Timestamps
  createdAt: Date;
  lastActiveAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'streak' | 'time' | 'tasks' | 'level';
  isNew?: boolean;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  startDate: Date;
  examDate?: Date;
  hoursPerWeek: number;
  daysPerWeek: number;
  intensityWeeks: number;
  completedHours: number;
  targetHours: number;
}

export interface LearningSession {
  id: string;
  subjectId: string;
  userId: string;
  date: string | Date; // Can be string (from API) or Date object
  actualDuration: number; // minutes - actual time spent
  plannedDuration?: number; // minutes - originally planned time
  duration: number; // DEPRECATED: use actualDuration (kept for backward compatibility)
  completed: boolean;
  points: number;
  notes?: string;
  sessionExtended?: boolean; // true if session went beyond planned time
  manualAdjustmentReason?: string; // reason for manual time adjustments
  timeAdjustmentsLog?: TimeAdjustment[]; // log of all manual adjustments
}

export interface TimeAdjustment {
  timestamp: Date;
  previousDuration: number; // in minutes
  newDuration: number; // in minutes
  reason?: string;
  adjustedBy?: string; // user identifier
}