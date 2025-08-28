-- Migration 001: Create initial schema for Lernplaner
-- Creates core tables: users, subjects, learning_sessions, achievements

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user data and gamification
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- Gamification fields
  current_level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  next_level_xp INTEGER NOT NULL DEFAULT 100,
  learning_streak INTEGER NOT NULL DEFAULT 0,
  
  -- Learning statistics
  daily_learning_time INTEGER NOT NULL DEFAULT 0, -- minutes today
  weekly_learning_time INTEGER NOT NULL DEFAULT 0, -- minutes this week  
  total_hours INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_completed_tasks INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_users_xp_positive CHECK (current_xp >= 0),
  CONSTRAINT chk_users_level_positive CHECK (current_level >= 1),
  CONSTRAINT chk_users_streak_positive CHECK (learning_streak >= 0),
  CONSTRAINT chk_users_hours_positive CHECK (total_hours >= 0)
);

-- Subjects table - Learning subjects with configuration
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Subject basic info
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL, -- hex color format #RRGGBB
  
  -- Date configuration
  start_date DATE NOT NULL,
  exam_date DATE, -- optional
  
  -- Learning configuration  
  hours_per_week INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL,
  intensity_weeks INTEGER NOT NULL DEFAULT 2,
  
  -- Progress tracking
  completed_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  target_hours DECIMAL(8,2) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_subjects_hours_positive CHECK (hours_per_week > 0),
  CONSTRAINT chk_subjects_days_valid CHECK (days_per_week BETWEEN 1 AND 7),
  CONSTRAINT chk_subjects_target_positive CHECK (target_hours > 0),
  CONSTRAINT chk_subjects_completed_positive CHECK (completed_hours >= 0),
  CONSTRAINT chk_subjects_exam_after_start CHECK (exam_date IS NULL OR exam_date > start_date),
  CONSTRAINT chk_subjects_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Learning Sessions table - Individual study sessions
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session details
  date DATE NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  completed BOOLEAN NOT NULL DEFAULT false,
  points INTEGER NOT NULL DEFAULT 0, -- XP points earned
  notes TEXT,
  
  -- Session metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_sessions_duration_positive CHECK (duration > 0),
  CONSTRAINT chk_sessions_points_positive CHECK (points >= 0),
  CONSTRAINT chk_sessions_duration_reasonable CHECK (duration <= 1440) -- max 24 hours
);

-- Achievements table - Gamification achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10) NOT NULL, -- emoji or icon code
  category VARCHAR(20) NOT NULL,
  threshold_value INTEGER, -- value needed to unlock (optional)
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_achievements_category CHECK (category IN ('streak', 'time', 'tasks', 'level')),
  CONSTRAINT chk_achievements_threshold_positive CHECK (threshold_value IS NULL OR threshold_value > 0)
);

-- User Achievements junction table - Many-to-many relationship
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_new BOOLEAN NOT NULL DEFAULT true, -- whether user has seen this achievement
  
  -- Ensure unique user-achievement pairs
  UNIQUE(user_id, achievement_id)
);

-- Calendar Sessions table - Scheduled learning sessions
CREATE TABLE calendar_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session details
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- minutes (calculated from start/end)
  
  -- Session type and status
  session_type VARCHAR(20) NOT NULL DEFAULT 'study',
  completed BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  location VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_calendar_end_after_start CHECK (end_time > start_time),
  CONSTRAINT chk_calendar_session_type CHECK (session_type IN ('study', 'exam', 'break', 'assignment')),
  CONSTRAINT chk_calendar_duration_positive CHECK (duration > 0)
);

-- Gamification Events table - Activity tracking
CREATE TABLE gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB, -- flexible data storage for event specifics
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_events_xp_positive CHECK (xp_awarded >= 0),
  CONSTRAINT chk_events_type CHECK (event_type IN ('xp_gain', 'level_up', 'achievement_unlock', 'streak_milestone', 'session_complete'))
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at 
  BEFORE UPDATE ON subjects  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_sessions_updated_at
  BEFORE UPDATE ON calendar_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();