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
import React, { createContext, useEffect, useState } from 'react';

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

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ translations, children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const fetchLanguage = async () => {
      if (!window.electronAPI) {
        setLanguage('de');
      } else {
        const data = await window.electronAPI.getLanguage();
        setLanguage(data);
      }     
    };
    fetchLanguage();
  }, []);

  const t = (key: string) => translations[language]?.[key] || key;

  return <TranslationContext.Provider value={{ t, language, setLanguage }}>{children}</TranslationContext.Provider>;
};
