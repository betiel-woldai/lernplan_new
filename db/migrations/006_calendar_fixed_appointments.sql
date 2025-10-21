-- Migration 006: Fixed appointments support (terminplan)
-- Adds fixed flags, source tracking, and immutability guard for fixed rows

-- New columns for fixed (read-only) appointments
ALTER TABLE calendar_sessions
  ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fixed_source TEXT,
  ADD COLUMN IF NOT EXISTS fixed_source_key TEXT;

-- Unique key to support idempotent upserts by source (per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uniq_calendar_fixed_source_key'
  ) THEN
    ALTER TABLE calendar_sessions
      ADD CONSTRAINT uniq_calendar_fixed_source_key
      UNIQUE (user_id, fixed_source, fixed_source_key);
  END IF;
END$$;

-- Guard: prevent UPDATE/DELETE of fixed rows (except via controlled bypass)
CREATE OR REPLACE FUNCTION calendar_sessions_fixed_guard()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow internal jobs to bypass when explicitly enabled in the same transaction
  IF current_setting('app.bypass_fixed_guard', true) = 'on' THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    IF OLD.is_fixed THEN
      RAISE EXCEPTION 'Deletion blocked: fixed calendar session (id=%)', OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE: only allow toggling completed and description/location for fixed rows
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.is_fixed THEN
      IF (
        NEW.start_time IS DISTINCT FROM OLD.start_time OR
        NEW.end_time   IS DISTINCT FROM OLD.end_time   OR
        NEW.title      IS DISTINCT FROM OLD.title      OR
        NEW.session_type IS DISTINCT FROM OLD.session_type OR
        NEW.subject_id IS DISTINCT FROM OLD.subject_id OR
        NEW.user_id    IS DISTINCT FROM OLD.user_id
      ) THEN
        RAISE EXCEPTION 'Update blocked: fixed session fields are immutable (id=%)', OLD.id;
      END IF;
      -- completed, description, location, planned/actual duration are allowed
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_calendar_sessions_fixed_guard'
  ) THEN
    CREATE TRIGGER trg_calendar_sessions_fixed_guard
      BEFORE UPDATE OR DELETE ON calendar_sessions
      FOR EACH ROW EXECUTE FUNCTION calendar_sessions_fixed_guard();
  END IF;
END$$;

