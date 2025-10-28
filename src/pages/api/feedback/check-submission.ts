import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { query } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.sub as string;

    // Check if user has submitted feedback in the last 24 hours
    const result = await query(
      `SELECT id, created_at, trigger_action, self_management_support, comment
       FROM lernplan_feedback
       WHERE user_sub = $1
       AND created_at > NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length > 0) {
      // User has submitted feedback in the last 24 hours
      return res.status(200).json({
        success: true,
        canSubmit: false,
        lastSubmission: {
          id: result.rows[0].id,
          createdAt: result.rows[0].created_at,
          triggerAction: result.rows[0].trigger_action,
          rating: result.rows[0].self_management_support,
          hasComment: !!result.rows[0].comment
        }
      });
    }

    // User can submit feedback
    return res.status(200).json({
      success: true,
      canSubmit: true,
      lastSubmission: null
    });

  } catch (error: any) {
    console.error('Check submission error:', error);

    return res.status(500).json({
      error: 'Failed to check submission status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
