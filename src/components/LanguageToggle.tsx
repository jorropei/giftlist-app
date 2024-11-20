import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguageStore } from '../store/useLanguageStore';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? 'ES' : 'EN'}
    </button>
  );
}