-- Make this migration idempotent to tolerate partial application
ALTER TABLE calendar_sessions
  ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE calendar_sessions
  ADD COLUMN IF NOT EXISTS source_subject_exam_id UUID REFERENCES subjects(id) ON DELETE CASCADE;

ALTER TABLE calendar_sessions
  ADD COLUMN IF NOT EXISTS scheduling_priority SMALLINT NOT NULL DEFAULT 0;

-- Index to speed up filtering of auto-generated sessions
CREATE INDEX IF NOT EXISTS idx_calendar_sessions_auto_generated
  ON calendar_sessions(is_auto_generated);

-- Index to support scheduling priority ordering per subject
CREATE INDEX IF NOT EXISTS idx_calendar_sessions_priority
  ON calendar_sessions(subject_id, scheduling_priority);
