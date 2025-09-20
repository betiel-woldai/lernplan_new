-- Migration 008: Subject type classification
-- Goal: Hide administrative subjects like "Termine & Fristen" from learning flows

-- 1) Column: subjects.subject_type with default
ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS subject_type VARCHAR(20) NOT NULL DEFAULT 'academic';

-- 2) Valid values constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_subjects_type_valid'
  ) THEN
    ALTER TABLE subjects
      ADD CONSTRAINT chk_subjects_type_valid
      CHECK (subject_type IN ('academic','administrative'));
  END IF;
END$$;

-- 3) Backfill: mark existing admin subject by name
UPDATE subjects
SET subject_type = 'administrative'
WHERE name = 'Termine & Fristen'
  AND subject_type <> 'administrative';

-- 4) Indexes for fast filtering/access
CREATE INDEX IF NOT EXISTS idx_subjects_type ON subjects(subject_type);
CREATE INDEX IF NOT EXISTS idx_subjects_admin_by_user ON subjects(user_id) WHERE subject_type = 'administrative';

