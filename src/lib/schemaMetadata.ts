import { query } from './db';

// Detects whether the calendar_sessions table already contains the new
// auto-generation metadata columns. Falls back gracefully when migrations
// haven't been applied yet so the application can still run.
export async function hasCalendarMetadataColumns(): Promise<boolean> {
  try {
    const result = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'calendar_sessions'
           AND column_name = 'is_auto_generated'
       ) AS "exists"
      `
    );
    return Boolean(result.rows[0]?.exists);
  } catch (error) {
    console.warn('Failed to detect calendar metadata columns:', error);
    return false;
  }
}

// Detects whether fixed-appointment columns exist (is_fixed, fixed_source, fixed_source_key)
export async function hasFixedAppointmentColumns(): Promise<boolean> {
  try {
    const result = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'calendar_sessions'
           AND column_name = 'is_fixed'
       ) AS "exists"`
    );
    return Boolean(result.rows[0]?.exists);
  } catch (error) {
    console.warn('Failed to detect fixed appointment columns:', error);
    return false;
  }
}
