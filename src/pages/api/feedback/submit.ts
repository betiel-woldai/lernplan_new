import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { query } from '../../../lib/db';

interface FeedbackSubmitRequest {
  selfManagementSupport?: number;
  comment?: string;
  isAnonymous?: boolean;
  triggerAction: 'subject_created' | 'session_saved';
  sessionId: string;
}

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
    const userEmail = session.user?.email as string;

    // Parse and validate request body
    const {
      selfManagementSupport,
      comment,
      isAnonymous = false,
      triggerAction,
      sessionId
    }: FeedbackSubmitRequest = req.body;

    // Validation: at least one of rating or comment must be provided
    if (!selfManagementSupport && !comment) {
      return res.status(400).json({
        error: 'At least one of selfManagementSupport or comment must be provided'
      });
    }

    // Validate rating range
    if (selfManagementSupport !== undefined && (selfManagementSupport < 1 || selfManagementSupport > 5)) {
      return res.status(400).json({
        error: 'selfManagementSupport must be between 1 and 5'
      });
    }

    // Validate trigger action
    if (!['subject_created', 'session_saved'].includes(triggerAction)) {
      return res.status(400).json({
        error: 'Invalid trigger action'
      });
    }

    // Validate sessionId
    if (!sessionId || sessionId.trim() === '') {
      return res.status(400).json({
        error: 'sessionId is required'
      });
    }

    // Insert feedback into database
    const result = await query(
      `INSERT INTO lernplan_feedback (
        user_sub,
        user_email,
        user_role,
        session_id,
        self_management_support,
        comment,
        is_anonymous,
        trigger_action,
        platform
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at`,
      [
        userId,
        isAnonymous ? null : userEmail,
        'student', // Default role, can be extended later
        sessionId,
        selfManagementSupport || null,
        comment || null,
        isAnonymous,
        triggerAction,
        'lernplaner'
      ]
    );

    // Check for duplicate submission (UNIQUE constraint violation)
    if (result.rows.length === 0) {
      return res.status(409).json({
        error: 'Feedback already submitted for this session'
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error: any) {
    console.error('Feedback submission error:', error);

    // Handle duplicate key violation (UNIQUE constraint)
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Feedback already submitted for this session'
      });
    }

    return res.status(500).json({
      error: 'Failed to submit feedback',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
