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
import React, { createContext, useState } from "react";

interface TranslationProviderProps {
  translations: Record<string, Record<string, string>>;
  defaultLanguage: string;
  children: React.ReactNode;
}

interface TranslationContextType {
  t: (key: string) => string;
  language: string;
  setLanguage: (language: string) => void;
}

export const TranslationContext = createContext<TranslationContextType>({
  t: (key: string) => key,
  language: "",
  setLanguage: () => {},
});

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  translations,
  defaultLanguage,
  children,
}) => {
  const [language, setLanguage] = useState(defaultLanguage);

  const t = (key: string) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return key;
  };

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};
