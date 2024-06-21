import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';

interface FaderState {
  [key: string]: number;
}

interface FaderContextType {
  getFaderValue: (groupId: number, faderId: number) => number;
  setFaderValue: (groupId: number, faderId: number, value: number) => void;
}

const FaderContext = createContext<FaderContextType | undefined>(undefined);

class FaderStore {
  private state: FaderState = {};
  private listeners = new Set<() => void>();

  getFaderValue = (groupId: number, faderId: number): number => {
    const key = `${groupId}-${faderId}`;
    return this.state[key] ?? 0;
  };

  setFaderValue = (groupId: number, faderId: number, value: number): void => {
    const key = `${groupId}-${faderId}`;
    if (this.state[key] !== value) {
      this.state[key] = value;
      this.listeners.forEach((listener) => listener());
    }
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}

const faderStore = new FaderStore();

export const FaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getFaderValue = useCallback(faderStore.getFaderValue, []);
  const setFaderValue = useCallback(faderStore.setFaderValue, []);

  const value = { getFaderValue, setFaderValue };

  return <FaderContext.Provider value={value}>{children}</FaderContext.Provider>;
};

export const useFaderContext = () => {
  const context = useContext(FaderContext);
  if (context === undefined) {
    throw new Error('useFaderContext must be used within a FaderProvider');
  }
  return context;
};

export const useFaderValue = (groupId: number, faderId: number) => {
  const { getFaderValue } = useFaderContext();
  return useSyncExternalStore(faderStore.subscribe, () => getFaderValue(groupId, faderId));
};
