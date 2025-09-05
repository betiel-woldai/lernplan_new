import React from 'react';
import { FaCog, FaTimes, FaGlobe } from 'react-icons/fa';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FaCog className="text-gray-600 w-5 h-5" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('settings.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close settings"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Language Settings */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FaGlobe className="text-blue-600 w-4 h-4" />
              <h3 className="text-lg font-medium text-gray-900">
                {t('settings.language')}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('settings.language.description')}
            </p>
            
            <div className="space-y-2">
              {/* Deutsch Option */}
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="de"
                  checked={language === 'de'}
                  onChange={() => handleLanguageChange('de')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇩🇪</span>
                  <span className="text-sm font-medium text-gray-900">
                    {t('settings.language.german')}
                  </span>
                </div>
              </label>

              {/* English Option */}
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={language === 'en'}
                  onChange={() => handleLanguageChange('en')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm font-medium text-gray-900">
                    {t('settings.language.english')}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;