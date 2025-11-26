import { useEffect, useState } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTipOfTheDay } from '@/data/lerntipps';

export function LerntippBox() {
  const { language, t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const tip = getTipOfTheDay(language);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4 transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex items-center space-x-2 mb-2">
        <FaLightbulb className="text-amber-500 text-lg" />
        <h3 className="text-sm font-semibold text-amber-900">
          {t('lerntipp.title')}
        </h3>
      </div>
      <div className="mb-2">
        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded-full">
          {tip.kategorie}
        </span>
        <span className="ml-2 text-xs font-medium text-amber-700">
          {tip.thema}
        </span>
      </div>
      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">
        {tip.tipp}
      </p>
    </div>
  );
}

export default LerntippBox;
