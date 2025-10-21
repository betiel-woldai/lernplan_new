import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import fs from 'fs';
import path from 'path';
import { canonicalizer } from '@/lib/terminplan/canonicalizer';
import { TerminplanSchema, TerminplanEntry } from '@/lib/terminplan/contracts';
import { normalizeDates } from '@/lib/terminplan/normalize';
import { transformAcademicCalendar } from '@/lib/terminplan/transform';
import { diffEngine } from '@/lib/terminplan/diff';
import { query, withTransaction } from '@/lib/db';
import { hasSubjectTypeColumn } from '@/lib/schemaMetadata';
import crypto from 'crypto';

// Cron stub: dry-run only, returns diff summary without mutating DB
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const filePath = path.join(process.cwd(), 'db', 'terminplan.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);

    // Accept both formats:
    // 1) New hierarchical { academic_calendar: {...} } → flatten to legacy entries
    // 2) Legacy flat TerminplanEntry[] → pass through as-is
    const transformed = transformAcademicCalendar(json);
    const baseInput: TerminplanEntry[] | null = transformed
      ? transformed
      : (TerminplanSchema.validate(json) ? (json as TerminplanEntry[]) : null);
    if (!baseInput) return res.status(400).json({ error: 'Invalid terminplan format' });

    // Step 1: normalize date fields (accept YYYY-MM-DD; mark others as TBD)
    const normalizedInput = normalizeDates(baseInput);
    const current = canonicalizer.normalize(normalizedInput);
    const checksum = canonicalizer.checksum(current);

    if (req.method !== 'POST') {
      // Dry run: compute diff vs DB snapshot of fixed terminplan entries
      const old = await loadExistingCanonical(userId);
      const diff = diffEngine.computeDiff(old, current);
      return res.status(200).json({ checksum, summary: {
        added: diff.added.length,
        removed: diff.removed.length,
        modified: diff.modified.length,
      }});
    }

    // Apply: upsert fixed calendar sessions from terminplan
    const applyResult = await applyTerminplan(current.entries, userId);
    return res.status(200).json({ checksum, applied: applyResult });
  } catch (e: any) {
    console.error('terminplan cron preview failed', e);
    return res.status(500).json({ error: 'Failed to process terminplan' });
  }
}

async function loadExistingCanonical(userId: string) {
  const rows = await query(
    `SELECT fixed_source_key, title, description as details,
            to_char(start_time AT TIME ZONE 'Europe/Berlin', 'YYYY-MM-DD') as date
     FROM calendar_sessions
     WHERE is_fixed = true AND fixed_source = 'terminplan' AND user_id = $1`,
    [userId]
  );
  const entries = rows.rows.map(r => ({
    title: r.title as string,
    details: r.details as string | null,
    date: r.date as string,
    source_key: String(r.fixed_source_key)
  }));
  return { entries } as any;
}

function toEventWindows(e: TerminplanEntry): Array<{ date: string; startISO: Date; endISO: Date; title: string; details?: string; popupMessage?: string }>{
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const mk = (d: string) => {
    if (!DATE_RE.test(d)) return null;
    const startISO = new Date(`${d}T00:00:00`); // treat as date boundary
    const endISO = new Date(`${d}T23:59:59`);
    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) return null;
    return { date: d, startISO, endISO };
  };

  const decorate = (d: string) => {
    const win = mk(d);
    return win ? { ...win, title: e.title, details: e.details, popupMessage: e.popupMessage } : null;
  };

  const out: Array<{ date: string; startISO: Date; endISO: Date; title: string; details?: string; popupMessage?: string }> = [];

  // Single date
  if (e.date && DATE_RE.test(e.date)) {
    const w = decorate(e.date);
    if (w) out.push(w);
    return out;
  }

  // Range expansion: Only mark start and end dates to reduce visual clutter
  if (e.date_from && e.date_to && DATE_RE.test(e.date_from) && DATE_RE.test(e.date_to)) {
    const start = new Date(`${e.date_from}T00:00:00`);
    const end = new Date(`${e.date_to}T00:00:00`);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
      // Check if start and end are the same date
      if (e.date_from === e.date_to) {
        // Same date: create single event with original title
        const w = decorate(e.date_from);
        if (w) out.push(w);
      } else {
        // Different dates: create start and end markers
        const startWin = mk(e.date_from);
        if (startWin) {
          out.push({
            ...startWin,
            title: `Start ${e.title}`,
            details: e.details,
            popupMessage: e.popupMessage
          });
        }

        const endWin = mk(e.date_to);
        if (endWin) {
          out.push({
            ...endWin,
            title: `Ende ${e.title}`,
            details: e.details,
            popupMessage: e.popupMessage
          });
        }
      }
      return out;
    }
  }

  // Fallback: date_from only
  if (e.date_from && DATE_RE.test(e.date_from)) {
    const w = decorate(e.date_from);
    if (w) out.push(w);
  }
  return out;
}

function classifyType(title: string): 'exam' | 'assignment' | 'study' | 'break' {
  const t = title.toLowerCase();
  if (t.includes('prüfung')) return 'exam';
  if (t.includes('abgabe') || t.includes('deadline')) return 'assignment';
  return 'assignment';
}

function stableUUID(name: string) {
  const h = crypto.createHash('sha256').update(name).digest('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20,32)}`;
}

async function ensureTerminplanSubject(userId: string) {
  const hasType = await hasSubjectTypeColumn();

  // Reuse existing by name per user
  const existing = await query(
    `SELECT id${hasType ? ', subject_type' : ''} FROM subjects WHERE user_id = $1 AND name = 'Termine & Fristen' LIMIT 1`,
    [userId]
  );
  if (existing.rows[0]?.id) {
    const id = existing.rows[0].id as string;
    if (hasType && existing.rows[0].subject_type !== 'administrative') {
      await query(`UPDATE subjects SET subject_type = 'administrative', updated_at = NOW() WHERE id = $1`, [id]);
    }
    return id;
  }

  // Create new admin subject (set subject_type when available)
  const today = new Date();
  if (hasType) {
    const inserted = await query(
      `INSERT INTO subjects (user_id, name, color, start_date, hours_per_week, days_per_week, intensity_weeks, target_hours, subject_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'administrative')
       RETURNING id`,
      [userId, 'Termine & Fristen', '#6B7280', today, 1, 1, 1, 1]
    );
    return inserted.rows[0].id as string;
  }

  const inserted = await query(
    `INSERT INTO subjects (user_id, name, color, start_date, hours_per_week, days_per_week, intensity_weeks, target_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [userId, 'Termine & Fristen', '#6B7280', today, 1, 1, 1, 1]
  );
  return inserted.rows[0].id as string;
}

async function applyTerminplan(entries: Array<TerminplanEntry & { source_key: string }>, userId: string) {
  const subjectId = await ensureTerminplanSubject(userId);

  return await withTransaction(async (client) => {
    // allow updates on fixed rows during this transaction only
    await client.query("SET LOCAL app.bypass_fixed_guard = 'on'");

    // index existing fixed entries by source_key for this user
    const existing = await client.query(
      `SELECT id, fixed_source_key FROM calendar_sessions WHERE is_fixed = true AND fixed_source = 'terminplan' AND user_id = $1`,
      [userId]
    );
    const byKey = new Map(existing.rows.map((r: any) => [r.fixed_source_key, r]));

    // Build set of per-day keys for accurate stale detection
    const currentKeys = new Set<string>();
    for (const e of entries) {
      const windows = toEventWindows(e);
      for (const w of windows) currentKeys.add(`${e.source_key}|${w.date}`);
    }

    let added = 0, updated = 0, removed = 0;

    // Upsert all current entries
    for (const e of entries) {
      const windows = toEventWindows(e);
      if (windows.length === 0) continue;
      const sessionType = classifyType(e.title);
      for (const w of windows) {
        const perDayKey = `${e.source_key}|${w.date}`;
        const id = stableUUID(`${userId}:terminplan:${perDayKey}`);
        const plannedMinutes = Math.max(1, Math.round((w.endISO.getTime() - w.startISO.getTime()) / 60000));

        // Store both details and popupMessage in description field as JSON
        const descriptionData = {
          details: w.details || null,
          popupMessage: w.popupMessage || null
        };
        const descriptionJson = JSON.stringify(descriptionData);

        if (byKey.has(perDayKey)) {
          await client.query(
            `UPDATE calendar_sessions SET
               title = $1, description = $2, start_time = $3, end_time = $4,
               planned_duration = $5, session_type = $6, is_all_day = TRUE, updated_at = NOW()
             WHERE fixed_source = 'terminplan' AND fixed_source_key = $7`,
            [w.title, descriptionJson, w.startISO, w.endISO, plannedMinutes, sessionType, perDayKey]
          );
          updated++;
        } else {
          await client.query(
            `INSERT INTO calendar_sessions (
               id, user_id, subject_id, title, start_time, end_time, planned_duration,
               session_type, completed, description, is_fixed, fixed_source, fixed_source_key, is_all_day
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,true,'terminplan',$10,true)
             ON CONFLICT (user_id, fixed_source, fixed_source_key)
             DO UPDATE SET title = EXCLUDED.title,
                           description = EXCLUDED.description,
                           start_time = EXCLUDED.start_time,
                           end_time = EXCLUDED.end_time,
                           planned_duration = EXCLUDED.planned_duration,
                           session_type = EXCLUDED.session_type,
                           is_all_day = EXCLUDED.is_all_day,
                           updated_at = NOW()`,
            [id, userId, subjectId, w.title, w.startISO, w.endISO, plannedMinutes, sessionType, descriptionJson, perDayKey]
          );
          added++;
        }
      }
    }

    // Remove entries that are no longer present for this user
    const stale = await client.query(
      `SELECT id, fixed_source_key FROM calendar_sessions WHERE is_fixed = true AND fixed_source = 'terminplan' AND user_id = $1`,
      [userId]
    );
    for (const row of stale.rows) {
      if (!currentKeys.has(row.fixed_source_key)) {
        await client.query('DELETE FROM calendar_sessions WHERE id = $1', [row.id]);
        removed++;
      }
    }

    return { added, updated, removed };
  });
}
