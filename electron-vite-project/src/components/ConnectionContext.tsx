import React, { useState, useEffect, createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

type EmitFunction = (event: string, data?: any) => void;
type OnFunction = (event: string, callback: (data?: any) => void) => void;

interface ConnectionContextType {
  connected: boolean;
  emit: EmitFunction;
  on: OnFunction;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function useConnectionContext(): ConnectionContextType {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnectionContext must be used within a ConnectionProvider");
  }
  return context;
}

interface ConnectionProviderProps {
  children: React.ReactNode;
  url: string;
}

export function ConnectionProvider({ children, url }: ConnectionProviderProps) {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(url);
    setSocket(socketInstance);
    socketInstance.on("connect", () => {
      setConnected(true);
    });
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [url]);

  const emit: EmitFunction = (event, data) => {
    socket?.emit(event, data);
  };

  const on: OnFunction = (event, callback) => {
    socket?.on(event, callback);
  };

  const contextValue: ConnectionContextType = {
    connected,
    emit,
    on,
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
}
