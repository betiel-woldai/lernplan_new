import React, { useState } from 'react';
import { TodaysTerminplanEvent } from '@/hooks/useTodaysTerminplanEvents';

export interface TodaysTerminplanModalProps {
  isOpen: boolean;
  events: TodaysTerminplanEvent[];
  onClose: () => void;
  onDismissForToday: () => void;
}

export const TodaysTerminplanModal: React.FC<TodaysTerminplanModalProps> = ({
  isOpen,
  events,
  onClose,
  onDismissForToday
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleDismissForToday = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onDismissForToday();
    }, 300);
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'from-red-100 to-red-50 border-red-200';
      case 'medium':
        return 'from-blue-100 to-blue-50 border-blue-200';
      case 'low':
        return 'from-green-100 to-green-50 border-green-200';
      default:
        return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return '🚨';
      case 'medium':
        return '📅';
      case 'low':
        return '📝';
      default:
        return '📌';
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen && isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      data-testid="todays-terminplan-modal"
    >
      <div
        className={`glass-card p-6 rounded-2xl border border-blue-200/50 shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-500 ${
          isOpen && isAnimating ? 'scale-100' : 'scale-95'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.98), rgba(226, 232, 240, 0.98))',
          backdropFilter: 'blur(10px)',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-2xl mb-4 shadow-lg">
            📅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Termine heute
          </h2>
          <p className="text-gray-600 text-sm">
            {events.length === 1 ? 'Benachrichtigung' : `${events.length} wichtige Termine`} für heute
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-4 mb-6">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg border bg-gradient-to-r ${getPriorityColor(event.priority)} shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getPriorityIcon(event.priority)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {event.title}
                  </h3>

                  {/* Custom popup message or fallback to details */}
                  {event.popupMessage ? (
                    <div
                      className="text-gray-700 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: event.popupMessage }}
                    />
                  ) : event.details ? (
                    <p className="text-gray-600 text-sm">
                      {event.details}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleDismissForToday}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Heute nicht mehr zeigen
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};