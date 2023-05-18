// FaderValue_Handler.tsx
import React, { createContext, useContext, ReactNode, FC, useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your Flask server URL

type VolumeContextType = {
  volume: number;
  sendVolumeToServer: (volume: number) => void;
}

const VolumeContext = createContext<VolumeContextType | null>(null);

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
    socket.emit('volume', volume);
  };

  useEffect(() => {
    socket.on('volume', (volume: number) => {
      setVolume(volume);
      console.log('Received volume from server:' + volume);
    });
  }, []);

  return (
    <VolumeContext.Provider value={{ volume, sendVolumeToServer }}>
      {children}
    </VolumeContext.Provider>
  );
};
