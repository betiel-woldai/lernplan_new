import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiClient';
import { Subject } from '../types';
import { SubjectFormData } from '../schemas/subjectSchema';

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
  refreshSubjects: () => Promise<void>;
}

export const useSubjects = (): UseSubjectsReturn => {
  const sessionData = useSession();
  const session = sessionData?.data;
  const userId = session?.sub;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch subjects from API
  const fetchSubjects = useCallback(async () => {
    if (!userId) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(`/api/subjects?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const subjectsWithDates = data.map((subject: any) => ({
        ...subject,
        startDate: new Date(subject.startDate),
        examDate: subject.examDate ? new Date(subject.examDate) : undefined
      }));

      setSubjects(subjectsWithDates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subjects';
      console.error('Failed to fetch subjects:', err);
      setError(errorMessage);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    const handleExamDateChanged = (event: Event) => {
      const { detail } = event as CustomEvent<{ subjectId: string; examDate: Date }>;
      if (!detail?.subjectId || !detail.examDate) return;

      setSubjects(prev => prev.map(subject =>
        subject.id === detail.subjectId
          ? {
              ...subject,
              examDate: new Date(detail.examDate),
            }
          : subject
      ));
    };

    window.addEventListener('subjectExamDateChanged', handleExamDateChanged);
    return () => window.removeEventListener('subjectExamDateChanged', handleExamDateChanged);
  }, []);

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create new subject
  const createSubject = useCallback(async (data: SubjectFormData) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        ...data,
        userId,
        startDate: data.startDate,
        examDate: data.examDate,
        targetHours: calculateTargetHours(data)
      };

      const response = await apiFetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject');
      }

      const newSubject = await response.json();
      
      // Convert dates and add to local state
      const subjectWithDates = {
        ...newSubject,
        startDate: new Date(newSubject.startDate),
        examDate: newSubject.examDate ? new Date(newSubject.examDate) : undefined
      };

      setSubjects(prev => [...prev, subjectWithDates]);

      // Emit custom event to notify calendar about new subject
      window.dispatchEvent(new CustomEvent('subjectCreated', { 
        detail: { subject: subjectWithDates } 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subject';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update existing subject
  const updateSubject = useCallback(async (id: string, data: SubjectFormData) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        ...data,
        startDate: data.startDate,
        examDate: data.examDate,
        targetHours: calculateTargetHours(data)
      };

      const response = await apiFetch(`/api/subjects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subject');
      }

      const updatedSubject = await response.json();

      // Convert dates and update local state
      const subjectWithDates = {
        ...updatedSubject,
        startDate: new Date(updatedSubject.startDate),
        examDate: updatedSubject.examDate ? new Date(updatedSubject.examDate) : undefined
      };

      setSubjects(prev => prev.map(subject => 
        subject.id === id ? subjectWithDates : subject
      ));

      // Emit custom event to notify calendar about subject changes
      window.dispatchEvent(new CustomEvent('subjectUpdated', { 
        detail: { subjectId: id, updatedSubject: subjectWithDates } 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subject';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Delete subject
  const deleteSubject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(`/api/subjects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject');
      }

      setSubjects(prev => prev.filter(subject => subject.id !== id));

      // Emit custom event to notify calendar about subject deletion
      window.dispatchEvent(new CustomEvent('subjectDeleted', { 
        detail: { subjectId: id } 
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subject';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get subject by ID
  const getSubjectById = useCallback((id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  }, [subjects]);

  // Refresh subjects from API
  const refreshSubjects = useCallback(async () => {
    await fetchSubjects();
  }, [fetchSubjects]);

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
    refreshSubjects
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
