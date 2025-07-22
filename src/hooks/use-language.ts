'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/lib/i18n';
import type { Translation, Language } from '@/lib/types';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState<Translation>(translations.en);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem('kisan-ai-lang') as Language | null;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
      setT(translations[savedLang]);
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    if (translations[newLang]) {
      setLanguage(newLang);
      setT(translations[newLang]);
      localStorage.setItem('kisan-ai-lang', newLang);
      // Force a reload to apply translations throughout the app
      window.location.reload();
    }
  };

  // Prevent returning default 'en' translations on initial server render
  // then hydration mismatch on client.
  const currentTranslations = isMounted ? t : translations.en;

  return { language, t: currentTranslations, handleLanguageChange };
}
