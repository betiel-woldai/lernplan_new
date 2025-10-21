import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getUserStats(id, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserStats(userId: string, res: NextApiResponse) {
  // Get user basic info and stats  
  let userResult;
  
  // Check if userId looks like a UUID or email
  if (userId.includes('@')) {
    // Search by email
    userResult = await query(`
      SELECT 
        id,
        name,
        email,
        current_level as "currentLevel",
        current_xp as "currentXP",
        next_level_xp as "nextLevelXP",
        learning_streak as "learningStreak",
        daily_learning_time as "dailyLearningTime",
        weekly_learning_time as "weeklyLearningTime",
        total_hours as "totalHours",
        completed_tasks as "completedTasks",
        total_completed_tasks as "totalCompletedTasks",
        created_at as "createdAt",
        last_active_at as "lastActiveAt"
      FROM users 
      WHERE email = $1
    `, [userId]);
  } else {
    // Search by UUID or use default user fallback
    const searchId = userId === 'default-user' ? 'default-user' : userId;
    userResult = await query(`
      SELECT 
        id,
        name,
        email,
        current_level as "currentLevel",
        current_xp as "currentXP",
        next_level_xp as "nextLevelXP",
        learning_streak as "learningStreak",
        daily_learning_time as "dailyLearningTime",
        weekly_learning_time as "weeklyLearningTime",
        total_hours as "totalHours",
        completed_tasks as "completedTasks",
        total_completed_tasks as "totalCompletedTasks",
        created_at as "createdAt",
        last_active_at as "lastActiveAt"
      FROM users 
      WHERE id::text = $1
    `, [searchId]);
  }

  if (userResult.rows.length === 0) {
    // User not found - this can happen on first login if stats are fetched before init completes
    // Return default stats instead of 404 to avoid race condition errors
    return res.status(200).json({
      id: userId,
      name: 'New User',
      email: null,
      currentLevel: 1,
      currentXP: 0,
      nextLevelXP: 100,
      learningStreak: 0,
      dailyLearningTime: 0,
      weeklyLearningTime: 0,
      totalHours: 0,
      completedTasks: 0,
      totalCompletedTasks: 0,
      achievements: [],
      levelProgress: 0,
      xpToNextLevel: 100,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });
  }

  const user = userResult.rows[0];

  // Get user's achievements
  const achievementsResult = await query(`
    SELECT 
      a.id,
      a.name,
      a.description,
      a.icon,
      a.category,
      a.threshold_value as "thresholdValue",
      ua.unlocked_at as "unlockedAt",
      ua.is_new as "isNew"
    FROM achievements a
    JOIN user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = $1
    ORDER BY ua.unlocked_at DESC
  `, [user.id]);

  const achievements = achievementsResult.rows.map(achievement => ({
    ...achievement,
    unlockedAt: achievement.unlockedAt?.toISOString(),
  }));

  // Calculate progress percentages and next level XP
  const levelProgress = user.currentLevel > 1 ? 100 : Math.round((user.currentXP / user.nextLevelXP) * 100);
  const xpToNextLevel = Math.max(0, user.nextLevelXP - user.currentXP);

  const userStats = {
    ...user,
    achievements,
    levelProgress,
    xpToNextLevel,
    createdAt: user.createdAt?.toISOString(),
    lastActiveAt: user.lastActiveAt?.toISOString(),
  };

  return res.status(200).json(userStats);
}