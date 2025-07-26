
'use client';

import { useState, useEffect } from 'react';
import { translations } from '@/lib/i18n';
import type { Translation, Language } from '@/lib/types';

const stateToLang: Record<string, Language> = {
  'Maharashtra': 'mr',
  'Karnataka': 'kn',
  'Uttar Pradesh': 'hi',
  'Bihar': 'hi',
  'Delhi': 'hi',
  'Madhya Pradesh': 'hi',
  'Rajasthan': 'hi',
  'Haryana': 'hi',
  'Himachal Pradesh': 'hi',
  'Jharkhand': 'hi',
  'Chhattisgarh': 'hi',
  'Uttarakhand': 'hi',
};


export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState<Translation>(translations.en);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const detectAndSetLanguage = () => {
      const savedLang = localStorage.getItem('kisan-ai-lang') as Language | null;
      if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
        setT(translations[savedLang]);
        setIsMounted(true);
      } else {
        // If no language is saved, try to detect from location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              if (response.ok && data.state) {
                const detectedLang = stateToLang[data.state];
                if (detectedLang) {
                  handleLanguageChange(detectedLang, false); // Don't reload, just set
                  setIsMounted(true);
                  return;
                }
              }
            } catch (error) {
              console.error("Could not auto-detect language based on location.", error);
            }
            // Fallback to English if detection fails
            setLanguage('en');
            setT(translations.en);
            setIsMounted(true);
          },
          () => {
             // Geolocation denied or failed, default to English
            setLanguage('en');
            setT(translations.en);
            setIsMounted(true);
          }
        );
      }
    };

    detectAndSetLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (newLang: Language, shouldReload = true) => {
    if (translations[newLang]) {
      setLanguage(newLang);
      setT(translations[newLang]);
      localStorage.setItem('kisan-ai-lang', newLang);
      if (shouldReload) {
        window.location.reload();
      }
    }
  };

  // Prevent returning default 'en' translations on initial server render
  // then hydration mismatch on client.
  const currentTranslations = isMounted ? t : translations.en;

  return { language, t: currentTranslations, handleLanguageChange };
}
