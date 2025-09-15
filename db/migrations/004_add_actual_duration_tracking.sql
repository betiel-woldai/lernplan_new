-- Migration 004: Add actual duration tracking for flexible session management
-- Adds support for tracking both planned and actual session durations

-- Add actual_duration to learning_sessions table
-- This allows us to differentiate between planned time and actual time spent
ALTER TABLE learning_sessions
ADD COLUMN planned_duration INTEGER;

-- Rename existing duration to actual_duration for clarity
ALTER TABLE learning_sessions
RENAME COLUMN duration TO actual_duration;

-- Add planned_duration to calendar_sessions table for better tracking
ALTER TABLE calendar_sessions
ADD COLUMN actual_duration INTEGER;

-- Rename existing duration to planned_duration for calendar sessions
ALTER TABLE calendar_sessions
RENAME COLUMN duration TO planned_duration;

-- Update constraints to work with new column names
ALTER TABLE learning_sessions
DROP CONSTRAINT chk_sessions_duration_positive,
DROP CONSTRAINT chk_sessions_duration_reasonable;

ALTER TABLE learning_sessions
ADD CONSTRAINT chk_sessions_actual_duration_positive CHECK (actual_duration > 0),
ADD CONSTRAINT chk_sessions_actual_duration_reasonable CHECK (actual_duration <= 1440), -- max 24 hours
ADD CONSTRAINT chk_sessions_planned_duration_positive CHECK (planned_duration IS NULL OR planned_duration > 0);

-- Update calendar_sessions constraints
ALTER TABLE calendar_sessions
DROP CONSTRAINT chk_calendar_duration_positive;

ALTER TABLE calendar_sessions
ADD CONSTRAINT chk_calendar_planned_duration_positive CHECK (planned_duration > 0),
ADD CONSTRAINT chk_calendar_actual_duration_positive CHECK (actual_duration IS NULL OR actual_duration > 0);

-- Add session_extended field to track if session was extended beyond planned time
ALTER TABLE learning_sessions
ADD COLUMN session_extended BOOLEAN DEFAULT false;

-- Add manual_adjustment_reason field for audit logging of time adjustments
ALTER TABLE learning_sessions
ADD COLUMN manual_adjustment_reason TEXT;

-- Add time_adjustments_log as JSONB to track all manual adjustments
ALTER TABLE learning_sessions
ADD COLUMN time_adjustments_log JSONB DEFAULT '[]'::jsonb;

-- Create index for efficient querying of extended sessions
CREATE INDEX idx_learning_sessions_extended ON learning_sessions(session_extended) WHERE session_extended = true;

-- Create index for sessions with manual adjustments
CREATE INDEX idx_learning_sessions_adjusted ON learning_sessions USING GIN(time_adjustments_log) WHERE time_adjustments_log != '[]'::jsonb;