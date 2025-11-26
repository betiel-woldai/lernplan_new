import { useEffect, useState } from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { getQuoteOfTheDay } from '@/data/motivationalQuotes';

export function MotivationalQuoteBox() {
  const { language, t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const quote = getQuoteOfTheDay(language);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4 mb-4 transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex items-start space-x-3">
        <FaQuoteLeft className="text-indigo-400 text-lg flex-shrink-0 mt-1" />
        <p className="text-sm text-indigo-900 leading-relaxed italic">
          &ldquo;{quote.quote}&rdquo;
        </p>
      </div>
    </div>
  );
}

export default MotivationalQuoteBox;
