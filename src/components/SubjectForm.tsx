import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectSchema, type SubjectFormData } from '../schemas/subjectSchema';
import { Subject } from '../types';
import ColorPicker from './ColorPicker';

export interface SubjectFormProps {
  onSubmit: (data: SubjectFormData) => void;
  onCancel: () => void;
  initialData?: Partial<Subject>;
  mode: 'create' | 'edit';
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  mode 
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || '#3B82F6',
      startDate: initialData?.startDate ? initialData.startDate.toISOString().split('T')[0] : '',
      examDate: initialData?.examDate ? initialData.examDate.toISOString().split('T')[0] : '',
      hoursPerWeek: initialData?.hoursPerWeek || 5,
      daysPerWeek: initialData?.daysPerWeek || 3,
      intensityWeeks: initialData?.intensityWeeks || 4
    }
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Add New Subject' : 'Edit Subject'}
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'create' 
            ? 'Create a new subject with your preferred settings and color.' 
            : 'Update your subject details and preferences.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Subject Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Subject Name *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Mathematics, Physics, Chemistry"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Color *
          </label>
          <Controller
            name="color"
            control={control}
            render={({ field, fieldState }) => (
              <ColorPicker
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              {...register('startDate')}
              type="date"
              id="startDate"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="examDate" className="block text-sm font-medium text-gray-700 mb-2">
              Exam Date *
            </label>
            <input
              {...register('examDate')}
              type="date"
              id="examDate"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.examDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.examDate && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.examDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Numeric Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700 mb-2">
              Hours per Week *
            </label>
            <input
              {...register('hoursPerWeek', { valueAsNumber: true })}
              type="number"
              id="hoursPerWeek"
              min="1"
              max="40"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.hoursPerWeek ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.hoursPerWeek && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.hoursPerWeek.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="daysPerWeek" className="block text-sm font-medium text-gray-700 mb-2">
              Days per Week *
            </label>
            <input
              {...register('daysPerWeek', { valueAsNumber: true })}
              type="number"
              id="daysPerWeek"
              min="1"
              max="7"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.daysPerWeek ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.daysPerWeek && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.daysPerWeek.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="intensityWeeks" className="block text-sm font-medium text-gray-700 mb-2">
              Intensity Weeks *
            </label>
            <input
              {...register('intensityWeeks', { valueAsNumber: true })}
              type="number"
              id="intensityWeeks"
              min="1"
              max="20"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.intensityWeeks ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Weeks before exam for intensive study
            </p>
            {errors.intensityWeeks && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.intensityWeeks.message}
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting 
              ? 'Saving...' 
              : mode === 'create' 
                ? 'Create Subject' 
                : 'Update Subject'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;