-- Migration: Create feedback table for Lernplaner feedback system
-- Purpose: Store user feedback about DIAS self-management support
-- Date: 2025-10-27

CREATE TABLE IF NOT EXISTS lernplan_feedback (
  id SERIAL PRIMARY KEY,
  user_sub VARCHAR(255),
  user_email VARCHAR(255),
  user_role VARCHAR(50) DEFAULT 'student',
  session_id VARCHAR(255) NOT NULL,
  self_management_support INTEGER CHECK (self_management_support BETWEEN 1 AND 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  trigger_action VARCHAR(50) CHECK (trigger_action IN ('subject_created', 'session_saved')),
  platform VARCHAR(50) DEFAULT 'lernplaner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate submissions for the same session
  UNIQUE(user_sub, session_id)
);

-- Index for querying by user
CREATE INDEX idx_lernplan_feedback_user_sub ON lernplan_feedback(user_sub);

-- Index for querying by creation date (for admin dashboard)
CREATE INDEX idx_lernplan_feedback_created_at ON lernplan_feedback(created_at DESC);

-- Index for querying by trigger action
CREATE INDEX idx_lernplan_feedback_trigger_action ON lernplan_feedback(trigger_action);

-- Index for cooldown checks (last 24 hours)
CREATE INDEX idx_lernplan_feedback_user_recent ON lernplan_feedback(user_sub, created_at DESC);

COMMENT ON TABLE lernplan_feedback IS 'Stores user feedback about DIAS self-management support from Lernplaner';
COMMENT ON COLUMN lernplan_feedback.session_id IS 'Unique identifier for this feedback session (used for deduplication)';
COMMENT ON COLUMN lernplan_feedback.self_management_support IS 'Likert scale 1-5: Rating for "DIAS unterstützt mich beim Selbstmanagement"';
COMMENT ON COLUMN lernplan_feedback.trigger_action IS 'What action triggered the feedback request (subject_created or session_saved)';
COMMENT ON COLUMN lernplan_feedback.is_anonymous IS 'Whether the user opted for anonymous feedback (email will be NULL if true)';
