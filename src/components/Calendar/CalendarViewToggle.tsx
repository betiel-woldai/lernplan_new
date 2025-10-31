import React from 'react';
import { CalendarView } from '../../types/calendar';
import { FaCalendarAlt, FaCalendarWeek, FaCalendarDay } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

interface CalendarViewToggleProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export default function CalendarViewToggle({ currentView, onViewChange }: CalendarViewToggleProps) {
  const { t } = useLanguage();

  const views: { value: CalendarView; label: string; icon: React.ReactNode }[] = [
    { value: 'month', label: t('calendar.month'), icon: <FaCalendarAlt className="w-4 h-4" /> },
    { value: 'week', label: t('calendar.week'), icon: <FaCalendarWeek className="w-4 h-4" /> },
    { value: 'day', label: t('calendar.day'), icon: <FaCalendarDay className="w-4 h-4" /> }
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {views.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => onViewChange(value)}
          className={`
            flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all
            ${currentView === value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}