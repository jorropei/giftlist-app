import { useLanguageStore, translations } from '../store/useLanguageStore';

type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const { language } = useLanguageStore();
  
  const t = (key: TranslationKey): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation;
  };

  return { t, language };
}