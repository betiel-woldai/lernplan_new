// Task and assignment types for subject management

export interface SubjectTask {
  id: string;
  subjectId: string;
  title: string;
  type: 'essay' | 'homework' | 'project' | 'research';
  description?: string;
  dueDate: Date;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  createdAt: Date;
  completedAt?: Date;
  // TODO(human): Add any additional fields for task management
}

export interface TaskTemplate {
  type: SubjectTask['type'];
  defaultTitle: string;
  defaultEstimatedHours: number;
  description: string;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    type: 'essay',
    defaultTitle: 'Essay Assignment',
    defaultEstimatedHours: 8,
    description: 'Written essay or paper requiring research and analysis'
  },
  {
    type: 'homework',
    defaultTitle: 'Homework Assignment', 
    defaultEstimatedHours: 2,
    description: 'Regular homework exercises and problem sets'
  },
  {
    type: 'project',
    defaultTitle: 'Project Work',
    defaultEstimatedHours: 15,
    description: 'Long-term project requiring multiple sessions'
  },
  {
    type: 'research',
    defaultTitle: 'Research Task',
    defaultEstimatedHours: 6,
    description: 'Research and information gathering'
  }
];

// Enhanced Subject interface with task support
export interface EnhancedSubject {
  id: string;
  userId: string;
  name: string;
  color: string;
  startDate: Date;
  examDate?: Date;
  hoursPerWeek: number;
  daysPerWeek: number;
  intensityWeeks: number;
  completedHours: number;
  targetHours: number;
  // New task-related fields
  tasks: SubjectTask[];
  autoGenerateStudySessions: boolean;
  studySessionDuration: number; // default session length in minutes
}

// Calendar event generation logic
export interface CalendarEventSource {
  type: 'exam' | 'task_deadline' | 'study_session';
  sourceId: string; // subject ID or task ID
  title: string;
  date: Date;
  duration?: number; // for study sessions
  priority: 'low' | 'medium' | 'high';
}