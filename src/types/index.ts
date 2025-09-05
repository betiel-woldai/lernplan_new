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
  date: Date;
  duration: number; // minutes
  completed: boolean;
  points: number;
  notes?: string;
}