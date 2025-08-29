-- Migration 003: Add subject tasks support
-- Extends subjects with essay/homework task management

-- Subject Tasks table - Essays, homework, projects etc.
CREATE TABLE subject_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Task details
  title VARCHAR(255) NOT NULL,
  task_type VARCHAR(20) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  estimated_hours DECIMAL(4,1) NOT NULL DEFAULT 2.0,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_task_type CHECK (task_type IN ('essay', 'homework', 'project', 'research')),
  CONSTRAINT chk_task_priority CHECK (priority IN ('low', 'medium', 'high')),
  CONSTRAINT chk_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  CONSTRAINT chk_task_hours_positive CHECK (estimated_hours > 0),
  CONSTRAINT chk_task_due_date_reasonable CHECK (due_date >= CURRENT_DATE - INTERVAL '1 year')
);

-- Add task configuration to subjects
ALTER TABLE subjects 
  ADD COLUMN auto_generate_study_sessions BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN study_session_duration INTEGER NOT NULL DEFAULT 120; -- 2 hours default

-- Add updated_at trigger for tasks
CREATE TRIGGER update_subject_tasks_updated_at
  BEFORE UPDATE ON subject_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_subject_tasks_subject_id ON subject_tasks(subject_id);
CREATE INDEX idx_subject_tasks_due_date ON subject_tasks(due_date);
CREATE INDEX idx_subject_tasks_status ON subject_tasks(status);
CREATE INDEX idx_subjects_exam_date ON subjects(exam_date) WHERE exam_date IS NOT NULL;