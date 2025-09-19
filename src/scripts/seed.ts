#!/usr/bin/env tsx
// Database seed script for Lernplaner development data
import './env';

import { query } from '../lib/db';

// Sample achievements data
const achievements = [
  {
    name: 'First Steps',
    description: 'Complete your first learning session',
    icon: '🎯',
    category: 'tasks',
    threshold_value: 1
  },
  {
    name: 'Getting Started',
    description: 'Complete 5 learning sessions',
    icon: '📚',
    category: 'tasks',
    threshold_value: 5
  },
  {
    name: 'Dedicated Learner',
    description: 'Complete 25 learning sessions',
    icon: '⭐',
    category: 'tasks',
    threshold_value: 25
  },
  {
    name: 'Study Master',
    description: 'Complete 100 learning sessions',
    icon: '🏆',
    category: 'tasks',
    threshold_value: 100
  },
  {
    name: 'Fire Starter',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    category: 'streak',
    threshold_value: 3
  },
  {
    name: 'Consistency Champion',
    description: 'Maintain a 7-day learning streak',
    icon: '💪',
    category: 'streak',
    threshold_value: 7
  },
  {
    name: 'Streak Legend',
    description: 'Maintain a 30-day learning streak',
    icon: '🌟',
    category: 'streak',
    threshold_value: 30
  },
  {
    name: 'Time Warrior',
    description: 'Study for 10 hours total',
    icon: '⏰',
    category: 'time',
    threshold_value: 600 // 10 hours in minutes
  },
  {
    name: 'Study Marathon',
    description: 'Study for 50 hours total',
    icon: '🏃',
    category: 'time',
    threshold_value: 3000 // 50 hours in minutes
  },
  {
    name: 'Level Up',
    description: 'Reach level 5',
    icon: '📈',
    category: 'level',
    threshold_value: 5
  },
  {
    name: 'Advanced Scholar',
    description: 'Reach level 10',
    icon: '🎓',
    category: 'level',
    threshold_value: 10
  }
];

// Sample user data
const sampleUsers = [
  {
    name: 'Max Mustermann',
    email: 'max@example.com',
    current_level: 3,
    current_xp: 750,
    next_level_xp: 1000,
    learning_streak: 5,
    daily_learning_time: 90,
    weekly_learning_time: 420,
    total_hours: 25,
    completed_tasks: 12,
    total_completed_tasks: 45
  },
  {
    name: 'Anna Schmidt',
    email: 'anna@example.com',
    current_level: 5,
    current_xp: 1200,
    next_level_xp: 1500,
    learning_streak: 12,
    daily_learning_time: 120,
    weekly_learning_time: 600,
    total_hours: 40,
    completed_tasks: 8,
    total_completed_tasks: 78
  }
];

// Sample subjects data
const sampleSubjects = [
  {
    name: 'Mathematik Abitur',
    color: '#FF6B6B',
    start_date: '2024-01-15',
    exam_date: '2024-04-20',
    hours_per_week: 8,
    days_per_week: 4,
    intensity_weeks: 3,
    completed_hours: 15.5,
    target_hours: 120
  },
  {
    name: 'Englisch Literatur',
    color: '#4ECDC4',
    start_date: '2024-02-01',
    exam_date: '2024-05-15',
    hours_per_week: 6,
    days_per_week: 3,
    intensity_weeks: 2,
    completed_hours: 8.0,
    target_hours: 80
  },
  {
    name: 'Deutsche Geschichte',
    color: '#45B7D1',
    start_date: '2024-01-20',
    exam_date: '2024-04-25',
    hours_per_week: 5,
    days_per_week: 3,
    intensity_weeks: 2,
    completed_hours: 12.5,
    target_hours: 60
  },
  {
    name: 'Physik Grundkurs',
    color: '#96CEB4',
    start_date: '2024-02-10',
    exam_date: '2024-05-05',
    hours_per_week: 7,
    days_per_week: 4,
    intensity_weeks: 3,
    completed_hours: 6.0,
    target_hours: 90
  }
];

async function clearExistingData(): Promise<void> {
  console.log('🧹 Clearing existing data...');
  
  // Clear in reverse dependency order
  await query('DELETE FROM gamification_events');
  await query('DELETE FROM user_achievements');
  await query('DELETE FROM calendar_sessions');
  await query('DELETE FROM learning_sessions');
  await query('DELETE FROM subjects');
  await query('DELETE FROM achievements');
  await query('DELETE FROM users');
  
  console.log('✅ Existing data cleared');
}

async function seedAchievements(): Promise<{ [key: string]: string }> {
  console.log('🏆 Seeding achievements...');
  
  const achievementIds: { [key: string]: string } = {};
  
  for (const achievement of achievements) {
    const result = await query(
      `INSERT INTO achievements (name, description, icon, category, threshold_value) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [achievement.name, achievement.description, achievement.icon, achievement.category, achievement.threshold_value]
    );
    
    achievementIds[achievement.name] = result.rows[0].id;
  }
  
  console.log(`✅ Seeded ${achievements.length} achievements`);
  return achievementIds;
}

async function seedUsers(): Promise<{ [key: string]: string }> {
  console.log('👥 Seeding users...');
  
  const userIds: { [key: string]: string } = {};
  
  for (const user of sampleUsers) {
    const result = await query(
      `INSERT INTO users (name, email, current_level, current_xp, next_level_xp, learning_streak, 
                         daily_learning_time, weekly_learning_time, total_hours, completed_tasks, total_completed_tasks) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [user.name, user.email, user.current_level, user.current_xp, user.next_level_xp, 
       user.learning_streak, user.daily_learning_time, user.weekly_learning_time, 
       user.total_hours, user.completed_tasks, user.total_completed_tasks]
    );
    
    userIds[user.name] = result.rows[0].id;
  }
  
  console.log(`✅ Seeded ${sampleUsers.length} users`);
  return userIds;
}

async function seedSubjects(userIds: { [key: string]: string }): Promise<{ [key: string]: string }> {
  console.log('📚 Seeding subjects...');
  
  const subjectIds: { [key: string]: string } = {};
  const userIdArray = Object.values(userIds);
  
  for (let i = 0; i < sampleSubjects.length; i++) {
    const subject = sampleSubjects[i];
    const userId = userIdArray[i % userIdArray.length]; // Distribute subjects among users
    
    const result = await query(
      `INSERT INTO subjects (user_id, name, color, start_date, exam_date, hours_per_week, 
                           days_per_week, intensity_weeks, completed_hours, target_hours) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [userId, subject.name, subject.color, subject.start_date, subject.exam_date,
       subject.hours_per_week, subject.days_per_week, subject.intensity_weeks,
       subject.completed_hours, subject.target_hours]
    );
    
    subjectIds[subject.name] = result.rows[0].id;
  }
  
  console.log(`✅ Seeded ${sampleSubjects.length} subjects`);
  return subjectIds;
}

async function seedLearningSessions(userIds: { [key: string]: string }, subjectIds: { [key: string]: string }): Promise<void> {
  console.log('📝 Seeding learning sessions...');
  
  const userIdArray = Object.values(userIds);
  const subjectIdArray = Object.values(subjectIds);
  
  // Generate sessions for the last 30 days
  const today = new Date();
  let sessionCount = 0;
  
  for (let i = 0; i < 30; i++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(sessionDate.getDate() - i);
    
    // Random number of sessions per day (0-3)
    const sessionsPerDay = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < sessionsPerDay; j++) {
      const userId = userIdArray[Math.floor(Math.random() * userIdArray.length)];
      const subjectId = subjectIdArray[Math.floor(Math.random() * subjectIdArray.length)];
      const duration = 30 + Math.floor(Math.random() * 90); // 30-120 minutes
      const completed = Math.random() > 0.1; // 90% completion rate
      const points = completed ? Math.floor(duration / 10) + Math.floor(Math.random() * 20) : 0;
      
      const notes = [
        'Productive session with good focus',
        'Reviewed previous material',
        'Worked on practice problems',
        'Prepared for upcoming exam',
        'Difficult topic but made progress',
        null
      ][Math.floor(Math.random() * 6)];
      
      await query(
        `INSERT INTO learning_sessions (
           subject_id, user_id, date, actual_duration, planned_duration, completed, points, notes
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          subjectId,
          userId,
          sessionDate.toISOString().split('T')[0],
          duration,              // actual_duration
          duration,              // planned_duration (seed parity)
          completed,
          points,
          notes
        ]
      );
      
      sessionCount++;
    }
  }
  
  console.log(`✅ Seeded ${sessionCount} learning sessions`);
}

async function seedCalendarSessions(userIds: { [key: string]: string }, subjectIds: { [key: string]: string }): Promise<void> {
  console.log('📅 Seeding calendar sessions...');
  
  const userIdArray = Object.values(userIds);
  const subjectIdArray = Object.values(subjectIds);
  const sessionTypes = ['study', 'exam', 'assignment'];
  
  let sessionCount = 0;
  
  // Generate future calendar sessions for the next 14 days
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const sessionDate = new Date(today);
    sessionDate.setDate(sessionDate.getDate() + i);
    
    // Random sessions per day (1-3)
    const sessionsPerDay = 1 + Math.floor(Math.random() * 3);
    
    for (let j = 0; j < sessionsPerDay; j++) {
      const userId = userIdArray[Math.floor(Math.random() * userIdArray.length)];
      const subjectId = subjectIdArray[Math.floor(Math.random() * subjectIdArray.length)];
      const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
      
      // Random time during the day
      const hour = 8 + Math.floor(Math.random() * 12); // 8 AM to 8 PM
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      
      const startTime = new Date(sessionDate);
      startTime.setHours(hour, minute, 0, 0);
      
      const duration = 60 + Math.floor(Math.random() * 120); // 60-180 minutes
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      const titles = {
        study: ['Study Session', 'Review Session', 'Practice Time', 'Learning Block'],
        exam: ['Final Exam', 'Midterm Exam', 'Test', 'Quiz'],
        assignment: ['Assignment Due', 'Project Work', 'Homework', 'Essay Writing']
      };
      
      const title = titles[sessionType as keyof typeof titles][Math.floor(Math.random() * 4)];
      
      await query(
        `INSERT INTO calendar_sessions (
           subject_id, user_id, title, start_time, end_time,
           planned_duration, session_type, completed, description,
           is_auto_generated, source_subject_exam_id, scheduling_priority
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          subjectId,
          userId,
          title,
          startTime.toISOString(),
          endTime.toISOString(),
          duration,
          sessionType,
          false,
          `Scheduled ${sessionType} session`,
          false,
          null,
          0
        ]
      );
      
      sessionCount++;
    }
  }
  
  console.log(`✅ Seeded ${sessionCount} calendar sessions`);
}

async function seedUserAchievements(userIds: { [key: string]: string }, achievementIds: { [key: string]: string }): Promise<void> {
  console.log('🏅 Seeding user achievements...');
  
  const userIdArray = Object.values(userIds);
  const achievementIdArray = Object.values(achievementIds);
  
  let count = 0;
  
  // Give each user some random achievements
  for (const userId of userIdArray) {
    const numAchievements = 2 + Math.floor(Math.random() * 4); // 2-5 achievements per user
    const userAchievements = new Set<string>();
    
    while (userAchievements.size < numAchievements && userAchievements.size < achievementIdArray.length) {
      const achievementId = achievementIdArray[Math.floor(Math.random() * achievementIdArray.length)];
      
      if (!userAchievements.has(achievementId)) {
        userAchievements.add(achievementId);
        
        const unlockedDate = new Date();
        unlockedDate.setDate(unlockedDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days
        
        await query(
          `INSERT INTO user_achievements (user_id, achievement_id, unlocked_at, is_new) 
           VALUES ($1, $2, $3, $4)`,
          [userId, achievementId, unlockedDate.toISOString(), Math.random() > 0.7] // 30% chance of being "new"
        );
        
        count++;
      }
    }
  }
  
  console.log(`✅ Seeded ${count} user achievements`);
}

async function seedGamificationEvents(userIds: { [key: string]: string }): Promise<void> {
  console.log('🎮 Seeding gamification events...');
  
  const userIdArray = Object.values(userIds);
  const eventTypes = ['xp_gain', 'level_up', 'achievement_unlock', 'streak_milestone', 'session_complete'];
  
  let eventCount = 0;
  
  // Generate events for the last 14 days
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() - i);
    
    // Random events per day (2-8)
    const eventsPerDay = 2 + Math.floor(Math.random() * 7);
    
    for (let j = 0; j < eventsPerDay; j++) {
      const userId = userIdArray[Math.floor(Math.random() * userIdArray.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let xpAwarded = 0;
      let eventData: any = {};
      
      switch (eventType) {
        case 'xp_gain':
          xpAwarded = 10 + Math.floor(Math.random() * 50);
          eventData = { reason: 'session_completion', session_duration: 60 };
          break;
        case 'level_up':
          xpAwarded = 100;
          eventData = { new_level: 2 + Math.floor(Math.random() * 5), old_level: 1 + Math.floor(Math.random() * 4) };
          break;
        case 'achievement_unlock':
          xpAwarded = 50;
          eventData = { achievement_name: 'Sample Achievement', achievement_category: 'tasks' };
          break;
        case 'streak_milestone':
          xpAwarded = 25;
          eventData = { streak_days: 3 + Math.floor(Math.random() * 10) };
          break;
        case 'session_complete':
          xpAwarded = 15 + Math.floor(Math.random() * 30);
          eventData = { session_duration: 30 + Math.floor(Math.random() * 90), subject: 'Sample Subject' };
          break;
      }
      
      const eventTimestamp = new Date(eventDate);
      eventTimestamp.setHours(
        8 + Math.floor(Math.random() * 12), // Random hour 8-20
        Math.floor(Math.random() * 60), // Random minute
        Math.floor(Math.random() * 60) // Random second
      );
      
      await query(
        `INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded, created_at) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, eventType, JSON.stringify(eventData), xpAwarded, eventTimestamp.toISOString()]
      );
      
      eventCount++;
    }
  }
  
  console.log(`✅ Seeded ${eventCount} gamification events`);
}

async function runSeed(): Promise<void> {
  try {
    console.log('🌱 Starting database seed...');
    
    // Clear existing data first
    await clearExistingData();
    
    // Seed data in correct order (respecting foreign key constraints)
    const achievementIds = await seedAchievements();
    const userIds = await seedUsers();
    const subjectIds = await seedSubjects(userIds);
    
    await seedLearningSessions(userIds, subjectIds);
    await seedCalendarSessions(userIds, subjectIds);
    await seedUserAchievements(userIds, achievementIds);
    await seedGamificationEvents(userIds);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${achievements.length} achievements`);
    console.log(`- ${sampleUsers.length} users`);
    console.log(`- ${sampleSubjects.length} subjects`);
    console.log('- ~50+ learning sessions');
    console.log('- ~30+ calendar sessions');
    console.log('- ~10+ user achievements');
    console.log('- ~80+ gamification events');
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'clear':
    clearExistingData().then(() => {
      console.log('🧹 Database cleared successfully');
    });
    break;
  default:
    runSeed();
    break;
}

// Export for use in other scripts
export { runSeed, clearExistingData };
