// FaderValue_Handler.tsx


//NOT USED


import React, { createContext, useContext, ReactNode, FC, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useConnectionContext } from "./ConnectionContext";

type VolumeContextType = {
  volume: number;
  sendVolumeToServer: (volume: number) => void;
}

const VolumeContext = createContext<VolumeContextType | null>(null);
const { emit, on } = useConnectionContext();

export const useVolume = () => {
  const context = useContext(VolumeContext);
  if (!context) {
    throw new Error('useVolume must be used within a VolumeProvider');
  }
  return context;
};

interface VolumeProviderProps {
  children: ReactNode;
}

export const VolumeProvider: FC<VolumeProviderProps> = ({ children }) => {
  const [volume, setVolume] = useState<number>(0);

  const sendVolumeToServer = (volume: number) => {
    emit("fader_value", {value: volume });
  };

  useEffect(() => {
    const eventListener = (data: any) => {
      setVolume(volume);
      console.log("Received data from server:", data);
    };
  
    on("variable_update", eventListener);
  
    return () => {
      on("variable_update", eventListener);
    };
  }, [on]);

  return (
    <VolumeContext.Provider value={{ volume, sendVolumeToServer }}>
      {children}
    </VolumeContext.Provider>
  );
};
