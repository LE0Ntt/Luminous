import React, { createContext, useContext, useState } from 'react';

interface FaderContextProps {
  faderValues: number[];
  setFaderValue: (id: number, value: number) => void;
}

interface FaderProviderProps {
  children: React.ReactNode;
}

const FaderContext = createContext<FaderContextProps | undefined>(undefined);

export const FaderProvider: React.FC<FaderProviderProps> = ({ children }) => {
  const initialFaderValues = new Array(255).fill(0);
  const [faderValues, setFaderValues] = useState<number[]>(initialFaderValues);

  const setFaderValue = (id: number, value: number) => {
    const newFaderValues = [...faderValues];
    newFaderValues[id] = value;
    setFaderValues(newFaderValues);
  };

  return (
    <FaderContext.Provider value={{ faderValues, setFaderValue }}>
      {children}
    </FaderContext.Provider>
  );
};

export const useFaderContext = () => {
  const context = useContext(FaderContext);
  if (context === undefined) {
    throw new Error('useFaderContext must be used within a FaderProvider');
  }
  return context;
};
