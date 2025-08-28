-- Migration 002: Add performance indexes for Lernplaner
-- Optimizes queries for common access patterns

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active_at);
CREATE INDEX idx_users_level ON users(current_level);
CREATE INDEX idx_users_streak ON users(learning_streak);

-- Subjects table indexes  
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_exam_date ON subjects(exam_date) WHERE exam_date IS NOT NULL;
CREATE INDEX idx_subjects_start_date ON subjects(start_date);
CREATE INDEX idx_subjects_user_name ON subjects(user_id, name);

-- Learning Sessions table indexes
CREATE INDEX idx_sessions_subject_id ON learning_sessions(subject_id);
CREATE INDEX idx_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_sessions_date ON learning_sessions(date);
CREATE INDEX idx_sessions_completed ON learning_sessions(completed);
CREATE INDEX idx_sessions_user_date ON learning_sessions(user_id, date);
CREATE INDEX idx_sessions_subject_date ON learning_sessions(subject_id, date);

-- Achievements table indexes
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_threshold ON achievements(threshold_value) WHERE threshold_value IS NOT NULL;

-- User Achievements table indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
CREATE INDEX idx_user_achievements_is_new ON user_achievements(is_new) WHERE is_new = true;

-- Calendar Sessions table indexes
CREATE INDEX idx_calendar_sessions_subject_id ON calendar_sessions(subject_id);
CREATE INDEX idx_calendar_sessions_user_id ON calendar_sessions(user_id);
CREATE INDEX idx_calendar_sessions_start_time ON calendar_sessions(start_time);
CREATE INDEX idx_calendar_sessions_session_type ON calendar_sessions(session_type);
CREATE INDEX idx_calendar_sessions_completed ON calendar_sessions(completed);
-- CREATE INDEX idx_calendar_sessions_user_date ON calendar_sessions(user_id, date_trunc('day', start_time)); -- Removed functional index

-- Gamification Events table indexes
CREATE INDEX idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX idx_gamification_events_type ON gamification_events(event_type);
CREATE INDEX idx_gamification_events_created_at ON gamification_events(created_at);
CREATE INDEX idx_gamification_events_user_created ON gamification_events(user_id, created_at);

-- Composite indexes for common query patterns
CREATE INDEX idx_sessions_user_completed_date ON learning_sessions(user_id, completed, date);
CREATE INDEX idx_calendar_user_time_range ON calendar_sessions(user_id, start_time, end_time);