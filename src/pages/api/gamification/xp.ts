import { NextApiRequest, NextApiResponse } from 'next';
import { query, withTransaction } from '@/lib/db';
import { z } from 'zod';

const xpUpdateSchema = z.object({
  userId: z.string(),
  xpGain: z.number().min(1).max(1000),
  reason: z.string().max(255),
  metadata: z.record(z.any()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await addXP(req, res);
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('XP API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function addXP(req: NextApiRequest, res: NextApiResponse) {
  const validation = xpUpdateSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validation.error.errors 
    });
  }

  const { userId, xpGain, reason, metadata } = validation.data;

  const result = await withTransaction(async (client) => {
    // Get current user stats
    const userResult = await client.query(`
      SELECT 
        current_level,
        current_xp,
        next_level_xp,
        learning_streak,
        total_completed_tasks
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const currentUser = userResult.rows[0];
    const newXP = currentUser.current_xp + xpGain;
    let newLevel = currentUser.current_level;
    let newNextLevelXP = currentUser.next_level_xp;
    let leveledUp = false;

    // Check if user levels up (simple progression: each level needs 100 more XP)
    while (newXP >= newNextLevelXP) {
      newLevel++;
      newNextLevelXP = newLevel * 100; // Simple formula: level * 100
      leveledUp = true;
    }

    // Update user stats
    await client.query(`
      UPDATE users 
      SET 
        current_xp = $1,
        current_level = $2,
        next_level_xp = $3,
        last_active_at = NOW(),
        updated_at = NOW()
      WHERE id = $4
    `, [newXP, newLevel, newNextLevelXP, userId]);

    // Log XP gain event
    await client.query(`
      INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
      VALUES ($1, $2, $3, $4)
    `, [userId, 'xp_gain', JSON.stringify({
      reason,
      previousXP: currentUser.current_xp,
      newXP,
      ...metadata
    }), xpGain]);

    // If level up occurred, log level up event and check for achievements
    if (leveledUp) {
      await client.query(`
        INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
        VALUES ($1, $2, $3, $4)
      `, [userId, 'level_up', JSON.stringify({
        previousLevel: currentUser.current_level,
        newLevel,
        totalXP: newXP
      }), 0]);

      // Check for level-based achievements
      await checkAndUnlockAchievements(client, userId, 'level', newLevel);
    }

    // Check for task-based achievements if this XP was from completing a task
    if (reason.includes('task') || reason.includes('session')) {
      await checkAndUnlockAchievements(client, userId, 'tasks', currentUser.total_completed_tasks);
    }

    return {
      previousXP: currentUser.current_xp,
      newXP,
      xpGain,
      previousLevel: currentUser.current_level,
      newLevel,
      leveledUp,
      nextLevelXP: newNextLevelXP,
      xpToNextLevel: newNextLevelXP - newXP
    };
  });

  return res.status(200).json(result);
}

async function checkAndUnlockAchievements(client: any, userId: string, category: string, currentValue: number) {
  // Get available achievements for this category that user hasn't unlocked yet
  const availableAchievements = await client.query(`
    SELECT a.id, a.name, a.threshold_value
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
    WHERE a.category = $2 
      AND ua.id IS NULL 
      AND a.threshold_value <= $3
  `, [userId, category, currentValue]);

  // Unlock each achievement
  for (const achievement of availableAchievements.rows) {
    await client.query(`
      INSERT INTO user_achievements (user_id, achievement_id, is_new)
      VALUES ($1, $2, true)
    `, [userId, achievement.id]);

    // Log achievement unlock event
    await client.query(`
      INSERT INTO gamification_events (user_id, event_type, event_data, xp_awarded)
      VALUES ($1, $2, $3, $4)
    `, [userId, 'achievement_unlock', JSON.stringify({
      achievementId: achievement.id,
      achievementName: achievement.name,
      category,
      thresholdValue: achievement.threshold_value
    }), 50]); // Bonus XP for achievement
  }
}