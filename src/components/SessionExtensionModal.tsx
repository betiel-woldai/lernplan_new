import React, { useState } from 'react';
import { Clock, Plus, CheckCircle, XCircle, Timer } from 'lucide-react';

interface SessionExtensionModalProps {
  isOpen: boolean;
  onContinue: (extensionMinutes?: number) => void;
  onComplete: () => void;
  onCancel: () => void;
  subjectName: string;
  subjectColor: string;
  elapsedTime: string;
  targetDuration: number; // in minutes
}

export default function SessionExtensionModal({
  isOpen,
  onContinue,
  onComplete,
  onCancel,
  subjectName,
  subjectColor,
  elapsedTime,
  targetDuration
}: SessionExtensionModalProps) {
  const [customExtension, setCustomExtension] = useState<number>(15);
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleContinueWithExtension = (minutes?: number) => {
    onContinue(minutes);
    setShowCustomInput(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {/* Modal */}
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Planned Time Reached!</h3>
              <p className="text-sm text-gray-600">What would you like to do?</p>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: subjectColor }}
              ></div>
              <span className="font-semibold text-gray-900">{subjectName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Time Studied</p>
                <p className="font-semibold text-lg text-green-600">{elapsedTime}</p>
              </div>
              <div>
                <p className="text-gray-600">Planned Duration</p>
                <p className="font-semibold text-lg text-blue-600">{formatDuration(targetDuration)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Continue Indefinitely */}
            <button
              onClick={() => handleContinueWithExtension()}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Continue Session</span>
            </button>

            {/* Quick Extension Options */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleContinueWithExtension(15)}
                className="flex flex-col items-center p-3 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Clock className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-sm font-medium text-blue-700">+15m</span>
              </button>
              <button
                onClick={() => handleContinueWithExtension(30)}
                className="flex flex-col items-center p-3 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Clock className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-sm font-medium text-blue-700">+30m</span>
              </button>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="flex flex-col items-center p-3 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-lg transition-all duration-200"
              >
                <Timer className="w-4 h-4 text-purple-600 mb-1" />
                <span className="text-xs font-medium text-purple-700">Custom</span>
              </button>
            </div>

            {/* Custom Extension Input */}
            {showCustomInput && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Extension (minutes)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={customExtension}
                    onChange={(e) => setCustomExtension(parseInt(e.target.value) || 15)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="15"
                  />
                  <button
                    onClick={() => handleContinueWithExtension(customExtension)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Complete Session */}
            <button
              onClick={onComplete}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete Session</span>
            </button>

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="w-full flex items-center justify-center space-x-3 p-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>

          {/* Tip */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 Tip: You can adjust time manually after completing the session
            </p>
          </div>
        </div>
      </div>
    </>
  );
}