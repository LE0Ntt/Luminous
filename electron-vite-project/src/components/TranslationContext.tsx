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

/* alternativ
return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
        {React.Children.map(children, (child) => {
        return React.cloneElement(child as React.ReactElement<any>, {
            translations,
            defaultLanguage,
        });
        })}
    </TranslationContext.Provider>
);
*/