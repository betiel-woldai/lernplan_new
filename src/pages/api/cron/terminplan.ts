import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { canonicalizer } from '@/lib/terminplan/canonicalizer';
import { TerminplanSchema, TerminplanEntry } from '@/lib/terminplan/contracts';
import { diffEngine } from '@/lib/terminplan/diff';
import { query, withTransaction } from '@/lib/db';
import { getActiveUserId } from '@/utils/user';
import crypto from 'crypto';

// Cron stub: dry-run only, returns diff summary without mutating DB
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), 'db', 'terminplan.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    if (!TerminplanSchema.validate(json)) {
      return res.status(400).json({ error: 'Invalid terminplan format' });
    }

    const current = canonicalizer.normalize(json);
    const checksum = canonicalizer.checksum(current);

    if (req.method !== 'POST') {
      // Dry run: compute diff vs DB snapshot of fixed terminplan entries
      const old = await loadExistingCanonical();
      const diff = diffEngine.computeDiff(old, current);
      return res.status(200).json({ checksum, summary: {
        added: diff.added.length,
        removed: diff.removed.length,
        modified: diff.modified.length,
      }});
    }

    // Apply: upsert fixed calendar sessions from terminplan
    const applyResult = await applyTerminplan(current.entries);
    return res.status(200).json({ checksum, applied: applyResult });
  } catch (e: any) {
    console.error('terminplan cron preview failed', e);
    return res.status(500).json({ error: 'Failed to process terminplan' });
  }
}

async function loadExistingCanonical() {
  const rows = await query(
    `SELECT fixed_source_key, title, description as details,
            to_char(start_time AT TIME ZONE 'Europe/Berlin', 'YYYY-MM-DD') as date
     FROM calendar_sessions
     WHERE is_fixed = true AND fixed_source = 'terminplan'`
  );
  const entries = rows.rows.map(r => ({
    title: r.title as string,
    details: r.details as string | null,
    date: r.date as string,
    source_key: String(r.fixed_source_key)
  }));
  return { entries } as any;
}

function toEventWindows(e: TerminplanEntry): Array<{ date: string; startISO: Date; endISO: Date; title: string; details?: string }>
{
  const mk = (d: string) => {
    // Skip entries without fixed dates (e.g., "2025-11-? (noch offen)", "TBD", etc.)
    // Only accept exact format: YYYY-MM-DD
    if (!d.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log(`Skipping entry with unfixed date: "${d}"`);
      return null;
    }

    // Create all-day events: start at midnight, end at midnight next day
    const startISO = new Date(`${d}T00:00:00+01:00`);
    const endISO = new Date(`${d}T23:59:59+01:00`);

    // Validate that dates are valid
    if (isNaN(startISO.getTime()) || isNaN(endISO.getTime())) {
      console.log(`Skipping entry with invalid date parsing: "${d}"`);
      return null;
    }

    return {
      date: d,
      startISO,
      endISO,
    };
  };

  const base = (d: string) => {
    const result = mk(d);
    return result ? { ...result, title: e.title, details: e.details } : null;
  };

  const results = [];

  // Handle single date entries
  if (e.date) {
    const b = base(e.date);
    if (b) results.push(b);
  }

  // Handle date range entries (from-to)
  if (e.date_from && e.date_to) {
    const b1 = base(e.date_from);
    const b2 = base(e.date_to);
    if (b1) results.push(b1);
    if (b2 && b1 && b2.date !== b1.date) results.push(b2); // Only add end date if different
  }

  // Handle date_from only entries
  if (e.date_from && !e.date_to) {
    const b = base(e.date_from);
    if (b) results.push(b);
  }

  return results;
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
  const existing = await query(
    `SELECT id FROM subjects WHERE user_id = $1 AND name = 'Termine & Fristen' LIMIT 1`,
    [userId]
  );
  if (existing.rows[0]?.id) return existing.rows[0].id as string;

  const today = new Date();
  const inserted = await query(
    `INSERT INTO subjects (user_id, name, color, start_date, hours_per_week, days_per_week, intensity_weeks, target_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [userId, 'Termine & Fristen', '#6B7280', today, 1, 1, 1, 1]
  );
  return inserted.rows[0].id as string;
}

async function applyTerminplan(entries: Array<TerminplanEntry & { source_key: string }>) {
  const userId = getActiveUserId();
  const subjectId = await ensureTerminplanSubject(userId);

  return await withTransaction(async (client) => {
    // allow updates on fixed rows during this transaction only
    await client.query("SET LOCAL app.bypass_fixed_guard = 'on'");

    // index existing fixed entries by source_key
    const existing = await client.query(
      `SELECT id, fixed_source_key FROM calendar_sessions WHERE is_fixed = true AND fixed_source = 'terminplan'`
    );
    const byKey = new Map(existing.rows.map((r: any) => [r.fixed_source_key, r]));

    const currentKeys = new Set(entries.map(e => e.source_key));

    let added = 0, updated = 0, removed = 0;

    // Upsert all current entries
    for (const e of entries) {
      const windows = toEventWindows(e);
      if (windows.length === 0) continue;
      const w = windows[0]; // keep it simple: single marker per entry

      // Double-check date validity before database operations
      if (!w || !w.startISO || !w.endISO || isNaN(w.startISO.getTime()) || isNaN(w.endISO.getTime())) {
        console.log(`Skipping entry with invalid dates: ${e.title} (${e.source_key})`);
        continue;
      }

      const id = stableUUID(`terminplan:${e.source_key}`);
      const sessionType = classifyType(e.title);
      const plannedMinutes = Math.max(1, Math.round((w.endISO.getTime() - w.startISO.getTime()) / 60000));

      if (byKey.has(e.source_key)) {
        // Update
        await client.query(
          `UPDATE calendar_sessions SET
             title = $1, description = $2, start_time = $3, end_time = $4,
             planned_duration = $5, session_type = $6, is_all_day = TRUE, updated_at = NOW()
           WHERE fixed_source = 'terminplan' AND fixed_source_key = $7`,
          [e.title, w.details || null, w.startISO, w.endISO, plannedMinutes, sessionType, e.source_key]
        );
        updated++;
      } else {
        // Insert
        await client.query(
          `INSERT INTO calendar_sessions (
             id, user_id, subject_id, title, start_time, end_time, planned_duration,
             session_type, completed, description, is_fixed, fixed_source, fixed_source_key, is_all_day
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,true,'terminplan',$10,true)
           ON CONFLICT (fixed_source, fixed_source_key)
           DO UPDATE SET title = EXCLUDED.title,
                         description = EXCLUDED.description,
                         start_time = EXCLUDED.start_time,
                         end_time = EXCLUDED.end_time,
                         planned_duration = EXCLUDED.planned_duration,
                         session_type = EXCLUDED.session_type,
                         is_all_day = EXCLUDED.is_all_day,
                         updated_at = NOW()
          `,
          [id, userId, subjectId, e.title, w.startISO, w.endISO, plannedMinutes, sessionType, w.details || null, e.source_key]
        );
        added++;
      }
    }

    // Remove entries that are no longer present
    const stale = await client.query(
      `SELECT id, fixed_source_key FROM calendar_sessions WHERE is_fixed = true AND fixed_source = 'terminplan'`
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
