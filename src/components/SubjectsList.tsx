import React, { useState } from 'react';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { Subject } from '../types';
import { SubjectFormData } from '../schemas/subjectSchema';
import SubjectCard from './SubjectCard';
import SubjectModal from './SubjectModal';
import useSubjects from '../hooks/useSubjects';

export const SubjectsList: React.FC = () => {
  const {
    filteredSubjects,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    createSubject,
    updateSubject,
    deleteSubject
  } = useSubjects();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const handleCreateNew = () => {
    setModalMode('create');
    setEditingSubject(null);
    setModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setModalMode('edit');
    setEditingSubject(subject);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject(id);
    } catch (err) {
      console.error('Failed to delete subject:', err);
    }
  };

  const handleSubmit = async (data: SubjectFormData) => {
    try {
      if (modalMode === 'create') {
        await createSubject(data);
      } else if (editingSubject) {
        await updateSubject(editingSubject.id, data);
      }
      setModalOpen(false);
      setEditingSubject(null);
    } catch (err) {
      console.error('Failed to save subject:', err);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSubject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading subjects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-1">
            Manage your subjects with personalized settings and track your progress.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add Subject
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search subjects by name or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaFilter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No subjects found' : 'No subjects yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or filters.' 
              : 'Get started by adding your first subject.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <SubjectModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingSubject || undefined}
        mode={modalMode}
      />
    </div>
  );
};

export default SubjectsList;