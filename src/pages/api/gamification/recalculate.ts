import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { getActiveUserId } from '@/utils/user';
import { hasSubjectTypeColumn, hasFixedAppointmentColumns } from '@/lib/schemaMetadata';
import { getLevel, getXPForLevel } from '@/utils/formatters';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = (req.body?.userId as string) || getActiveUserId();

    const hasType = await hasSubjectTypeColumn();
    const hasFixed = await hasFixedAppointmentColumns();

    // Always join subjects for name-based fallback; exclude admin/fixed from XP
    const joinSubjects = 'JOIN subjects s ON s.id = cs.subject_id';
    // Strong filter: always exclude fixed terminplan when available; otherwise exclude by subject name.
    // Accept subjects with subject_type NULL as academic for backward compatibility.
    const whereAcademic = hasType
      ? `AND (s.subject_type = 'academic' OR s.subject_type IS NULL)
         ${hasFixed ? "AND NOT (cs.is_fixed = TRUE AND cs.fixed_source = 'terminplan')" : "AND (s.name IS NULL OR s.name <> 'Termine & Fristen')"}`
      : hasFixed
      ? "AND NOT (cs.is_fixed = TRUE AND cs.fixed_source = 'terminplan')"
      : "AND (s.name IS NULL OR s.name <> 'Termine & Fristen')";

    const result = await query(
      `WITH cal AS (
         SELECT COALESCE(SUM(
                  CASE WHEN cs.completed THEN 
                    COALESCE(cs.xp_awarded, COALESCE(cs.actual_duration, cs.planned_duration) * 2)
                  ELSE 0 END
                ), 0) as xp
         FROM calendar_sessions cs
         ${joinSubjects}
         WHERE cs.user_id = $1
         ${whereAcademic}
       ),
       learn AS (
         SELECT COALESCE(SUM(
                  CASE WHEN ls.completed THEN ls.points ELSE 0 END
                ), 0) as xp
         FROM learning_sessions ls
         JOIN subjects s ON s.id = ls.subject_id
         WHERE ls.user_id = $1
         ${hasType ? "AND (s.subject_type = 'academic' OR s.subject_type IS NULL)" : ""}
         ${hasFixed ? "" : ""}
       )
       SELECT (SELECT xp FROM cal) + (SELECT xp FROM learn) as total_xp`,
      [userId]
    );

    const newXP: number = Math.max(0, parseInt(result.rows[0]?.total_xp || '0', 10));
    const newLevel = getLevel(newXP);
    const nextLevelXP = getXPForLevel(newLevel + 1);

    await query(
      `UPDATE users
         SET current_xp = $1,
             current_level = $2,
             next_level_xp = $3,
             updated_at = NOW()
       WHERE id = $4`,
      [newXP, newLevel, nextLevelXP, userId]
    );

    return res.status(200).json({ newXP, newLevel, nextLevelXP });
  } catch (error) {
    console.error('XP recalc failed:', error);
    return res.status(500).json({ error: 'Failed to recalculate XP' });
  }
}
