import React, { createContext, useContext, useState } from 'react';

interface FaderContextProps {
  faderValues: number[];
  //faderValues: number[][];
  //setFaderValue: (universeId: number, faderId: number, value: number) => void;
  setFaderValue: (id: number, value: number) => void;
}

interface FaderProviderProps {
  children: React.ReactNode;
}

const FaderContext = createContext<FaderContextProps | undefined>(undefined);

export const FaderProvider: React.FC<FaderProviderProps> = ({ children }) => {
  // const universes = 3;
  // const initialFaderValues = new Array(universes).fill(new Array(256).fill(0));
  // const [faderValues, setFaderValues] = useState<number[][]>(initialFaderValues);
  // const initialFaderValues = Array.from({ length: universes }, () => new Array(256).fill(0));

  const initialFaderValues = new Array(255).fill(0);
  const [faderValues, setFaderValues] = useState<number[]>(initialFaderValues);

  const setFaderValue = (id: number, value: number) => {
    setFaderValues(prevFaderValues => {
      const updatedFaderValues = [...prevFaderValues];
      updatedFaderValues[id] = value;
      return updatedFaderValues;
    });
  };

  /* const setFaderValue = (universeId: number, faderId: number, value: number) => {
    const newFaderValues = [...faderValues];
    newFaderValues[universeId][faderId] = value;
    setFaderValues(newFaderValues);
  }; */

  // Benutzung:
  /* const { faderValues, setFaderValue } = useFaderContext();
  setFaderValue(0, 1, 100); // Setzt den Wert von Fader 1 im Universe 0 auf 100 */

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
