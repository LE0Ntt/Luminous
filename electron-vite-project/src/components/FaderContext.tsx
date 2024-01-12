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
import React, { createContext, useContext, useReducer, useEffect, Dispatch, useCallback } from 'react';
import { useConnectionContext } from './ConnectionContext';
import { eventBus } from './EventBus';

interface FaderAction {
  type: 'SET_FADER_VALUE';
  payload: { sliderGroupId: number; faderId: number; value: number };
}

interface FaderContextProps {
  getFaderValue: (sliderGroupId: number, faderId: number) => number;
  setFaderValue: (sliderGroupId: number, faderId: number, value: number) => void;
  dispatch: Dispatch<FaderAction>;
}

const FaderContext = createContext<
  | {
      setGlobalFaderValue: (sliderGroupId: number, faderId: number, value: number) => void;
    }
  | undefined
>(undefined);

export const FaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setGlobalFaderValue = (sliderGroupId: number, faderId: number, value: number) => {
    // Hier die Logik zum Aktualisieren des globalen Zustands
    eventBus.emit(`globalFaderValueChange-${sliderGroupId}-${faderId}`, value);
  };

  return <FaderContext.Provider value={{ setGlobalFaderValue }}>{children}</FaderContext.Provider>;
};

export const useFaderContext = () => {
  const context = useContext(FaderContext);
  if (!context) {
    throw new Error('useFaderContext must be used within a FaderProvider');
  }
  return context;
};
