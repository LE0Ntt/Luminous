/**
 * Connection.tsx
 * @author Leon Hölzel
 */

import React, { useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = React.createContext<Socket | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (context === null) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket>(io('http://localhost:5000'));

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};
