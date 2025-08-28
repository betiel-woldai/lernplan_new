import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { z } from 'zod';

const updateSubjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  examDate: z.string().transform(str => new Date(str)).optional(),
  hoursPerWeek: z.number().min(1).max(168).optional(),
  daysPerWeek: z.number().min(1).max(7).optional(),
  intensityWeeks: z.number().min(1).max(52).optional(),
  targetHours: z.number().min(1).optional(),
  completedHours: z.number().min(0).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Subject ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getSubject(id, res);
      case 'PUT':
        return await updateSubject(id, req, res);
      case 'DELETE':
        return await deleteSubject(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Subject API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSubject(id: string, res: NextApiResponse) {
  const result = await query(`
    SELECT 
      id,
      user_id as "userId",
      name,
      color,
      start_date as "startDate",
      exam_date as "examDate",
      hours_per_week as "hoursPerWeek",
      days_per_week as "daysPerWeek",
      intensity_weeks as "intensityWeeks",
      completed_hours as "completedHours",
      target_hours as "targetHours",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM subjects 
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const subject = result.rows[0];
  
  // Convert dates for JSON serialization
  const responseSubject = {
    ...subject,
    startDate: subject.startDate?.toISOString(),
    examDate: subject.examDate?.toISOString(),
    createdAt: subject.createdAt?.toISOString(),
    updatedAt: subject.updatedAt?.toISOString(),
  };

  return res.status(200).json(responseSubject);
}

async function updateSubject(id: string, req: NextApiRequest, res: NextApiResponse) {
  const validation = updateSubjectSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validation.error.errors 
    });
  }

  const data = validation.data;
  
  // Build dynamic update query
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name) {
    updateFields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.color) {
    updateFields.push(`color = $${paramIndex++}`);
    values.push(data.color);
  }
  if (data.startDate) {
    updateFields.push(`start_date = $${paramIndex++}`);
    values.push(data.startDate);
  }
  if (data.examDate) {
    updateFields.push(`exam_date = $${paramIndex++}`);
    values.push(data.examDate);
  }
  if (data.hoursPerWeek) {
    updateFields.push(`hours_per_week = $${paramIndex++}`);
    values.push(data.hoursPerWeek);
  }
  if (data.daysPerWeek) {
    updateFields.push(`days_per_week = $${paramIndex++}`);
    values.push(data.daysPerWeek);
  }
  if (data.intensityWeeks) {
    updateFields.push(`intensity_weeks = $${paramIndex++}`);
    values.push(data.intensityWeeks);
  }
  if (data.targetHours) {
    updateFields.push(`target_hours = $${paramIndex++}`);
    values.push(data.targetHours);
  }
  if (data.completedHours !== undefined) {
    updateFields.push(`completed_hours = $${paramIndex++}`);
    values.push(data.completedHours);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Add updated_at timestamp
  updateFields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(`
    UPDATE subjects 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING 
      id,
      user_id as "userId",
      name,
      color,
      start_date as "startDate",
      exam_date as "examDate",
      hours_per_week as "hoursPerWeek",
      days_per_week as "daysPerWeek",
      intensity_weeks as "intensityWeeks",
      completed_hours as "completedHours",
      target_hours as "targetHours",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  const subject = result.rows[0];
  
  // Convert dates for JSON serialization
  const responseSubject = {
    ...subject,
    startDate: subject.startDate?.toISOString(),
    examDate: subject.examDate?.toISOString(),
    createdAt: subject.createdAt?.toISOString(),
    updatedAt: subject.updatedAt?.toISOString(),
  };

  return res.status(200).json(responseSubject);
}

async function deleteSubject(id: string, res: NextApiResponse) {
  const result = await query('DELETE FROM subjects WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  return res.status(200).json({ message: 'Subject deleted successfully' });
}