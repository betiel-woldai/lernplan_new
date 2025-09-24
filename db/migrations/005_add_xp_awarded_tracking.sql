-- Add xp_awarded field to track exact XP awarded for each session
-- This ensures accurate XP subtraction when sessions are unmarked

ALTER TABLE learning_sessions
ADD COLUMN xp_awarded INTEGER NOT NULL DEFAULT 0;

-- Add constraint to ensure xp_awarded is non-negative
ALTER TABLE learning_sessions
ADD CONSTRAINT chk_sessions_xp_awarded_positive CHECK (xp_awarded >= 0);

-- Add comment for documentation
COMMENT ON COLUMN learning_sessions.xp_awarded IS 'Exact XP awarded for this session including all bonuses (streak, punctuality). Used for accurate XP reversal when unmarking sessions.';