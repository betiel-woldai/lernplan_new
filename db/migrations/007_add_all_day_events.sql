-- Migration 007: Add support for all-day events
-- This allows marking events (especially terminplan entries) as all-day events

ALTER TABLE calendar_sessions
ADD COLUMN is_all_day BOOLEAN DEFAULT FALSE;

-- Mark existing terminplan entries as all-day events
UPDATE calendar_sessions
SET is_all_day = TRUE
WHERE is_fixed = TRUE AND fixed_source = 'terminplan';