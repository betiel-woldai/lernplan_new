-- Add xp_awarded field to calendar_sessions table to track exact XP awarded
-- This ensures accurate XP subtraction when calendar sessions are unmarked

ALTER TABLE calendar_sessions
ADD COLUMN xp_awarded INTEGER NOT NULL DEFAULT 0;

-- Add constraint to ensure xp_awarded is non-negative
ALTER TABLE calendar_sessions
ADD CONSTRAINT chk_calendar_sessions_xp_awarded_positive CHECK (xp_awarded >= 0);

-- Add comment for documentation
COMMENT ON COLUMN calendar_sessions.xp_awarded IS 'Exact XP awarded for this calendar session including all bonuses (streak, punctuality). Used for accurate XP reversal when unmarking sessions.';