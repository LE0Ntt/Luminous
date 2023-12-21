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
 * @file FaderContext.tsx
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConnectionContext } from './ConnectionContext';

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

const createInitialFaderValues = (sliderGroupId: number) => {
  return Array.from({ length: sliderGroupId }, (_, x) => {
    if (x >= sliderGroupId - 2) {
      return new Array(513).fill(0);
    } else {
      return new Array(6).fill(0);
    }
  });
};

export const FaderProvider: React.FC<FaderProviderProps> = ({ children }) => {
  const sliderGroupId = 694;
  const initialFaderValues = createInitialFaderValues(sliderGroupId);

  // Values for the Control.tsx
  initialFaderValues[0][1] = 255; // Master fader
  initialFaderValues[0][2] = 128; // Bi-color fader
  initialFaderValues[0][3] = 255; // Red fader
  initialFaderValues[0][4] = 255; // Green fader
  initialFaderValues[0][5] = 255; // Blue fader

  const [faderValues, setFaderValues] = useState<number[][]>(initialFaderValues);
  const [isDragging, setIsDragging] = useState(false);
  const { on, off } = useConnectionContext();

  const setFaderValue = useCallback(async (sliderGroupId: number, faderId: number, value: number) => {
    // Simuliere eine asynchrone Operation
    await new Promise((resolve) => setTimeout(resolve, 0));

    setFaderValues((prevFaderValues) => {
      const newFaderValues = [...prevFaderValues];
      newFaderValues[sliderGroupId] = [...newFaderValues[sliderGroupId]];
      newFaderValues[sliderGroupId][faderId] = value;
      return newFaderValues;
    });
  }, []);

  useEffect(() => {
    const eventListener = (data: any) => {
      if (!isDragging && data.deviceId !== undefined) {
        setFaderValue(data.deviceId, data.channelId, data.value);
      }
    };

    on('variable_update', eventListener);

    return () => off('variable_update', eventListener);
  }, [on, off, setFaderValue, isDragging]);

  return <FaderContext.Provider value={{ faderValues, setFaderValue, isDragging, setIsDragging }}>{children}</FaderContext.Provider>;
};

export const useFaderContext = () => {
  const context = useContext(FaderContext);
  if (context === undefined) {
    throw new Error('useFaderContext must be used within a FaderProvider');
  }
  return context;
};
