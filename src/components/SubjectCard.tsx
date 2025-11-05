import React, { useState } from 'react';
import { Subject } from '../types';
import { FaEdit, FaTrash, FaCalendarAlt, FaClock, FaCalendarWeek, FaFire } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { formatHours } from '../utils/formatters';

export interface SubjectCardProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onStartSession?: (subject: Subject) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onEdit,
  onDelete,
  onStartSession
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(subject.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getTimeUntilExam = () => {
    if (!subject.examDate) return null;
    const now = new Date();
    const examDate = new Date(subject.examDate);
    
    if (examDate < now) {
      return 'Exam passed';
    }
    
    return formatDistanceToNow(examDate, { addSuffix: true });
  };

  const getProgressPercentage = () => {
    if (subject.targetHours === 0) return 0;
    return Math.min(100, (subject.completedHours / subject.targetHours) * 100);
  };

  const timeUntilExam = getTimeUntilExam();
  const progressPercentage = getProgressPercentage();

  return (
    <div 
      className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 overflow-hidden"
      style={{
        borderLeft: `6px solid ${subject.color}`,
      }}
    >
      {/* Color strip and main content */}
      <div className="p-6">
        {/* Header with name and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
              {subject.name}
            </h3>
            <div className="flex items-center mt-1">
              <div 
                className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                style={{ backgroundColor: subject.color }}
                title={`Color: ${subject.color}`}
              />
              <span className="text-sm text-gray-500 font-mono">{subject.color}</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2">
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onEdit(subject)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit subject"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete subject"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Exam countdown */}
        {timeUntilExam && (
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <FaCalendarAlt className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm text-gray-700">
              <span className="font-medium">Exam:</span> {timeUntilExam}
            </span>
          </div>
        )}

        {/* Study metrics */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaClock className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Hours/Week</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{subject.hoursPerWeek}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCalendarWeek className="w-4 h-4 text-purple-500 mr-2" />
              <span className="text-sm text-gray-600">Days/Week</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{subject.daysPerWeek}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaFire className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-sm text-gray-600">Intensity Weeks</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{subject.intensityWeeks}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500">
              {formatHours(subject.completedHours)}/{formatHours(subject.targetHours)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: subject.color
              }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {progressPercentage.toFixed(0)}% complete
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center p-4 rounded-xl">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Delete Subject?</h4>
            <p className="text-xs text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={cancelDelete}
                className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectCard;