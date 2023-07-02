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
  const sliderGroupId = 693;
  const initialFaderValues = Array.from({ length: sliderGroupId }, () => new Array(10).fill(0));
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
      console.log("Received data from server:", data);
      if (!isDragging && data.deviceId !== undefined) { 
        console.log("Received data from server:", data.value);
        setFaderValue(data.deviceId, 0, data.value); // 0 ist platzhalter
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
