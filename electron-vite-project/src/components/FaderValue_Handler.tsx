// FaderValue_Handler.tsx
import React, { createContext, useContext, ReactNode, FC } from 'react';

const FLASK_SERVER_URL = 'http://localhost:5000'; // Replace with your Flask server URL

type VolumeContextType = {
  sendVolumeToServer: (volume: number) => Promise<any>;
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
  const sendVolumeToServer = async (volume: number) => {
    try {
      const response = await axios.post(`${FLASK_SERVER_URL}/volume`, { volume });
      return response.data;
    } catch (error) {
      console.error('Failed to send volume to server:', error);
    }
  };

  return (
    <VolumeContext.Provider value={{ sendVolumeToServer }}>
      {children}
    </VolumeContext.Provider>
  );
};
