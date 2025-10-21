import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { query } from '@/lib/db';

/**
 * Check if terminplan has been imported for the current user
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.sub;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in session' });
    }

    // Check if any terminplan sessions exist for this user
    const result = await query(
      `SELECT COUNT(*) as count FROM calendar_sessions
       WHERE user_id = $1 AND is_fixed = true AND fixed_source = 'terminplan'`,
      [userId]
    );

    const count = parseInt(result.rows[0]?.count || '0');
    const isImported = count > 0;

    return res.status(200).json({
      isImported,
      count
    });
  } catch (error) {
    console.error('Terminplan status check failed:', error);
    return res.status(500).json({ error: 'Failed to check terminplan status' });
  }
}
