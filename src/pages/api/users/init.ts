import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { query, withTransaction } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Use Keycloak user ID as the primary key
    const userId = session.sub;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in session' });
    }

    const userEmail = session.user.email;
    const userName = session.user.name || userEmail;

    // Check if user already exists by Keycloak ID
    const existingUserById = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId]
    );

    if (existingUserById.rows.length > 0) {
      // User exists with correct Keycloak ID, just update last_active
      await query(
        'UPDATE users SET last_active_at = NOW() WHERE id = $1',
        [userId]
      );

      return res.status(200).json({
        message: 'User exists',
        userId: userId,
        isNew: false
      });
    }

    // Check if email exists with different Keycloak ID (user was deleted and re-registered)
    const existingUserByEmail = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [userEmail]
    );

    if (existingUserByEmail.rows.length > 0) {
      const oldUserId = existingUserByEmail.rows[0].id;

      // Email exists but with old Keycloak ID
      // This happens when user was deleted from Keycloak and re-registered
      // Delete the old user (CASCADE will automatically delete all their data: subjects, sessions, etc.)

      // Use transaction with bypass flag to delete user with fixed terminplan sessions
      await withTransaction(async (client) => {
        // Bypass the fixed_guard trigger that prevents deletion of terminplan sessions
        await client.query("SET LOCAL app.bypass_fixed_guard = 'on'");

        // Delete user (CASCADE will delete all subjects, sessions, etc.)
        await client.query('DELETE FROM users WHERE id = $1', [oldUserId]);
      });
    }

    // Create new user with Keycloak user ID
    // Use ON CONFLICT to handle race conditions (multiple parallel requests for same user)
    const newUser = await query(
      `INSERT INTO users (
        id,
        name,
        email
      ) VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        last_active_at = NOW()
      RETURNING id, email`,
      [userId, userName, userEmail]
    );

    return res.status(201).json({
      message: 'User created',
      userId: newUser.rows[0].id,
      isNew: true
    });
  } catch (error) {
    console.error('User initialization error:', error);
    return res.status(500).json({
      error: 'Failed to initialize user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
