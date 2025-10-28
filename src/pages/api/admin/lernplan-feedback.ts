import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

// Helper to check admin authentication
function isAdminAuthenticated(req: NextApiRequest): boolean {
  return req.cookies['lernplan-admin-session'] === 'authenticated';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check admin authentication
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      triggerAction = 'all',
      hasComment = 'all',
      startDate,
      endDate,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause for filtering
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramCount = 1;

    if (triggerAction !== 'all') {
      whereConditions.push(`trigger_action = $${paramCount}`);
      queryParams.push(triggerAction);
      paramCount++;
    }

    if (hasComment === 'yes') {
      whereConditions.push(`comment IS NOT NULL AND comment != ''`);
    } else if (hasComment === 'no') {
      whereConditions.push(`(comment IS NULL OR comment = '')`);
    }

    if (startDate) {
      whereConditions.push(`created_at >= $${paramCount}`);
      queryParams.push(startDate);
      paramCount++;
    }

    if (endDate) {
      whereConditions.push(`created_at <= $${paramCount}`);
      queryParams.push(endDate);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM lernplan_feedback ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get feedback data with pagination
    const feedbackResult = await query(
      `SELECT
        id, user_sub, user_email, user_role, session_id,
        self_management_support, comment, is_anonymous,
        trigger_action, platform, created_at
      FROM lernplan_feedback
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...queryParams, limitNum, offset]
    );

    // Calculate summary statistics
    const summaryResult = await query(
      `SELECT
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN comment IS NOT NULL AND comment != '' THEN 1 END) as total_comments,
        AVG(self_management_support) as avg_rating,
        COUNT(CASE WHEN trigger_action = 'subject_created' THEN 1 END) as subject_created_count,
        COUNT(CASE WHEN trigger_action = 'session_saved' THEN 1 END) as session_saved_count,
        COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymous_count
      FROM lernplan_feedback
      ${whereClause}`,
      queryParams
    );

    const summary = summaryResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        feedback: feedbackResult.rows,
        summary: {
          totalSubmissions: parseInt(summary.total_submissions) || 0,
          totalComments: parseInt(summary.total_comments) || 0,
          avgRating: parseFloat(summary.avg_rating) || 0,
          subjectCreatedCount: parseInt(summary.subject_created_count) || 0,
          sessionSavedCount: parseInt(summary.session_saved_count) || 0,
          anonymousCount: parseInt(summary.anonymous_count) || 0
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error: any) {
    console.error('Failed to fetch feedback data:', error);
    return res.status(500).json({
      error: 'Failed to fetch feedback data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { feedback_id } = req.query;

    if (!feedback_id) {
      return res.status(400).json({ error: 'feedback_id is required' });
    }

    const result = await query(
      'DELETE FROM lernplan_feedback WHERE id = $1 RETURNING id',
      [feedback_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error: any) {
    console.error('Failed to delete feedback:', error);
    return res.status(500).json({
      error: 'Failed to delete feedback',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
