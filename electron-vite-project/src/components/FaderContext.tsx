import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnectionContext } from "./ConnectionContext";

interface FaderContextProps {
  faderValues: number[][];
  setFaderValue: (sliderGroupId: number, faderId: number, value: number) => void;
  
  isDragging?: boolean;
  setIsDragging: (isDragging: boolean) => void;
}

interface FaderProviderProps {
  children: React.ReactNode;
}

const FaderContext = createContext<FaderContextProps | undefined>(undefined);

export const FaderProvider: React.FC<FaderProviderProps> = ({ children }) => {
  const sliderGroupId = 3;
  /* für die aktualisierung der faderwerte beim laden der seite
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch(url + '/fader');
        const data = await response.json();
        
        console.log(JSON.parse(data).map(item => item.faderValue));
        setFaderValues(JSON.parse(data).map(item => item.faderValue));
      } catch (error) {
        console.log(error);
      }
    };

    fetchSliders();
  }, []); 
  */
  const initialFaderValues = Array.from({ length: sliderGroupId }, () => new Array(512).fill(0));
  const [faderValues, setFaderValues] = useState<number[][]>(initialFaderValues);
  const [isDragging, setIsDragging] = useState(false);
  const { on, off, url} = useConnectionContext();

  const setFaderValue = (sliderGroupId: number, faderId: number, value: number) => {
    const newFaderValues = [...faderValues];
    newFaderValues[sliderGroupId][faderId] = value;
    setFaderValues(newFaderValues);
  };

  useEffect(() => {
    const eventListener = (data: any) => {
      if (!isDragging && data.id !== undefined) { 
        console.log("Received data from server:", data.value);
        setFaderValue(1, data.id, data.value); // 0 ist platzhalter
      }
    };
  
    on("variable_update", eventListener);
  
    return () => off("variable_update", eventListener);
  }, [on, off, setFaderValue, isDragging]);

  return (
    <FaderContext.Provider value={{ faderValues, setFaderValue, isDragging, setIsDragging }}>
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
