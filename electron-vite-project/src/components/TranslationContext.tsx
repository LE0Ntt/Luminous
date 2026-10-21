/**
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 *
 * @file TranslationContext.tsx
 */
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

interface TranslationProviderProps {
  translations: Record<string, Record<string, string>>;
  children: React.ReactNode;
}

interface TranslationContextType {
  t: (key: string) => string;
  language: string;
  setLanguage: (language: string) => void;
}

export const TranslationContext = createContext<TranslationContextType>({
  t: (key: string) => key,
  language: 'en',
  setLanguage: () => {},
});

const LANGUAGE_KEY = 'language';

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ translations, children }) => {
  const [language, setLanguageState] = useState('en');

  // Electron keeps the language in its store, the web version in localStorage
  useEffect(() => {
    if (!window.electronAPI) {
      setLanguageState(localStorage.getItem(LANGUAGE_KEY) || 'de');
      return;
    }
    window.electronAPI
      .getLanguage()
      .then(setLanguageState)
      .catch((error) => console.error('Could not load the language:', error));
  }, []);

  const setLanguage = useCallback((newLanguage: string) => {
    setLanguageState(newLanguage);
    if (window.electronAPI) {
      window.electronAPI.setLanguage(newLanguage);
    } else {
      localStorage.setItem(LANGUAGE_KEY, newLanguage);
    }
  }, []);

  const t = useCallback((key: string) => translations[language]?.[key] || key, [translations, language]);

  const value = useMemo(() => ({ t, language, setLanguage }), [t, language, setLanguage]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};
