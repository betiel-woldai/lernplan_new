import { UserStats, Achievement, Subject } from '@/types';

// Mock achievements data
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first learning session',
    icon: '🏆',
    unlockedAt: new Date('2024-01-15'),
    category: 'tasks'
  },
  {
    id: '2', 
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '⚡',
    unlockedAt: new Date('2024-01-22'),
    category: 'streak'
  },
  {
    id: '3',
    name: 'Study Master',
    description: 'Complete 100 hours of learning',
    icon: '🎓',
    unlockedAt: new Date('2024-02-01'),
    category: 'time'
  }
];

// Mock user stats data
export const mockUserStats: UserStats = {
  id: 'user-1',
  name: 'Max Mustermann',
  email: 'max@example.com',
  
  // Gamification Stats
  currentLevel: 8,
  currentXP: 1250,
  nextLevelXP: 1600,
  learningStreak: 12,
  
  // Learning Stats  
  dailyLearningTime: 87, // 1h 27min today
  weeklyLearningTime: 420, // 7 hours this week
  totalHours: 156,
  completedTasks: 3, // today
  totalCompletedTasks: 48,
  
  // Achievements
  achievements: mockAchievements,
  
  // Timestamps
  createdAt: new Date('2024-01-01'),
  lastActiveAt: new Date()
};

// Mock subjects data
export const mockSubjects: Subject[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Mathematik',
    color: '#3B82F6',
    startDate: new Date('2024-01-01'),
    examDate: new Date('2024-06-15'),
    hoursPerWeek: 10,
    daysPerWeek: 5,
    completedHours: 45,
    targetHours: 120
  },
  {
    id: '2',
    userId: 'user-1', 
    name: 'Physik',
    color: '#10B981',
    startDate: new Date('2024-01-01'),
    examDate: new Date('2024-06-20'),
    hoursPerWeek: 8,
    daysPerWeek: 4,
    completedHours: 32,
    targetHours: 96
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Chemie', 
    color: '#F59E0B',
    startDate: new Date('2024-01-01'),
    examDate: new Date('2024-06-25'),
    hoursPerWeek: 6,
    daysPerWeek: 3,
    completedHours: 28,
    targetHours: 72
  }
];