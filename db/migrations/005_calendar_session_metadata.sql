-- Migration 005: add metadata for auto-generated calendar sessions

ALTER TABLE calendar_sessions
  ADD COLUMN is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN source_subject_exam_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  ADD COLUMN scheduling_priority SMALLINT NOT NULL DEFAULT 0;

-- Index to speed up filtering of auto-generated sessions
CREATE INDEX idx_calendar_sessions_auto_generated
  ON calendar_sessions(is_auto_generated);

-- Index to support scheduling priority ordering per subject
CREATE INDEX idx_calendar_sessions_priority
  ON calendar_sessions(subject_id, scheduling_priority);
