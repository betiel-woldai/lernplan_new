import { useState, useCallback, useEffect } from 'react';
import { Subject } from '../types';
import { SubjectFormData } from '../schemas/subjectSchema';

const STORAGE_KEY = 'lernplaner_subjects';

// Initial mock subjects for demo
const mockSubjects: Subject[] = [
  {
    id: '1',
    userId: 'user-1',
    name: 'Mathematics',
    color: '#3B82F6',
    startDate: new Date('2024-01-15'),
    examDate: new Date('2024-06-15'),
    hoursPerWeek: 8,
    daysPerWeek: 4,
    intensityWeeks: 6,
    completedHours: 45,
    targetHours: 120
  },
  {
    id: '2',
    userId: 'user-1',
    name: 'Physics',
    color: '#10B981',
    startDate: new Date('2024-01-20'),
    examDate: new Date('2024-06-20'),
    hoursPerWeek: 6,
    daysPerWeek: 3,
    intensityWeeks: 4,
    completedHours: 32,
    targetHours: 96
  },
  {
    id: '3',
    userId: 'user-1',
    name: 'Chemistry',
    color: '#F59E0B',
    startDate: new Date('2024-02-01'),
    examDate: new Date('2024-06-25'),
    hoursPerWeek: 5,
    daysPerWeek: 3,
    intensityWeeks: 3,
    completedHours: 18,
    targetHours: 75
  }
];

export interface UseSubjectsReturn {
  subjects: Subject[];
  filteredSubjects: Subject[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  createSubject: (data: SubjectFormData) => Promise<void>;
  updateSubject: (id: string, data: SubjectFormData) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubjectById: (id: string) => Subject | undefined;
  resetSubjects: () => void;
}

export const useSubjects = (): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load subjects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSubjects = JSON.parse(stored);
        // Convert date strings back to Date objects
        const subjectsWithDates = parsedSubjects.map((subject: any) => ({
          ...subject,
          startDate: new Date(subject.startDate),
          examDate: subject.examDate ? new Date(subject.examDate) : undefined
        }));
        setSubjects(subjectsWithDates);
      } else {
        // Use mock data on first load
        setSubjects(mockSubjects);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSubjects));
      }
    } catch (err) {
      console.error('Failed to load subjects from localStorage:', err);
      setSubjects(mockSubjects);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save subjects to localStorage whenever subjects change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
      } catch (err) {
        console.error('Failed to save subjects to localStorage:', err);
        setError('Failed to save subjects to local storage');
      }
    }
  }, [subjects, loading]);

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create new subject
  const createSubject = useCallback(async (data: SubjectFormData) => {
    try {
      setLoading(true);
      setError(null);

      const newSubject: Subject = {
        id: Math.random().toString(36).substr(2, 9),
        userId: 'user-1', // Mock user ID
        name: data.name,
        color: data.color,
        startDate: new Date(data.startDate),
        examDate: new Date(data.examDate),
        hoursPerWeek: data.hoursPerWeek,
        daysPerWeek: data.daysPerWeek,
        intensityWeeks: data.intensityWeeks,
        completedHours: 0,
        targetHours: calculateTargetHours(data)
      };

      setSubjects(prev => [...prev, newSubject]);
    } catch (err) {
      setError('Failed to create subject');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing subject
  const updateSubject = useCallback(async (id: string, data: SubjectFormData) => {
    try {
      setLoading(true);
      setError(null);

      setSubjects(prev => prev.map(subject => 
        subject.id === id 
          ? {
              ...subject,
              name: data.name,
              color: data.color,
              startDate: new Date(data.startDate),
              examDate: new Date(data.examDate),
              hoursPerWeek: data.hoursPerWeek,
              daysPerWeek: data.daysPerWeek,
              intensityWeeks: data.intensityWeeks,
              targetHours: calculateTargetHours(data)
            }
          : subject
      ));
    } catch (err) {
      setError('Failed to update subject');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete subject
  const deleteSubject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      setSubjects(prev => prev.filter(subject => subject.id !== id));
    } catch (err) {
      setError('Failed to delete subject');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get subject by ID
  const getSubjectById = useCallback((id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  }, [subjects]);

  // Reset to mock data
  const resetSubjects = useCallback(() => {
    setSubjects(mockSubjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSubjects));
  }, []);

  return {
    subjects,
    filteredSubjects,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectById,
    resetSubjects
  };
};

// Helper function to calculate target hours based on form data
function calculateTargetHours(data: SubjectFormData): number {
  const startDate = new Date(data.startDate);
  const examDate = new Date(data.examDate);
  const totalWeeks = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Regular weeks + extra hours during intensity weeks
  const regularWeeks = Math.max(0, totalWeeks - data.intensityWeeks);
  const intensityHours = data.intensityWeeks * data.hoursPerWeek * 1.5; // 50% more during intensity
  const regularHours = regularWeeks * data.hoursPerWeek;
  
  return Math.round(regularHours + intensityHours);
}

export default useSubjects;