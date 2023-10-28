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
 * @file ConnectionContext.tsx
 */
import React, { useState, useEffect, createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

type EmitFunction = (event: string, data?: any) => void;
type OnFunction = (event: string, callback: (data?: any) => void) => void;
type OffFunction = (event: string, callback: (data?: any) => void) => void;

interface ConnectionContextType {
  connected: boolean;
  emit: EmitFunction;
  on: OnFunction;
  off: OffFunction;
  url: string;
  /* changeUrl: (newUrl: string) => void; */
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

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [ip, setIp] = useState<string>('');
  const [port, setPort] = useState<string>('');

  useEffect(() => {
    async function fetchIpAndPort() {
      const [data] = await Promise.all([window.electronAPI.getIp()]);
      const { ip: fetchedIp, port: fetchedPort } = data;
      setIp(fetchedIp);
      setPort(fetchedPort);
      setUrl(`http://${fetchedIp}:${fetchedPort}`);
    }
    fetchIpAndPort();
  }, []);

  // change url to your server address
  const [url, setUrl] = useState<string>(''); // Default value
  
  function changeUrl(newUrl: string) {
    setUrl(newUrl);
  }
  


  useEffect(() => {
    const socketInstance = io(url + '/socket');
    setSocket(socketInstance);
  
    socketInstance.on("connect", () => {
      setConnected(true);
    });
  
    socketInstance.on("disconnect", () => {
      setConnected(false);
    });
  
    socketInstance.on("reconnect", () => {
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

  const off: OffFunction = (event, callback) => {
    socket?.off(event, callback);
  };

  const contextValue: ConnectionContextType = {
    connected,
    emit,
    on,
    off,
    url,
    /* changeUrl ,*/
  };

  return (
    <ConnectionContext.Provider value={contextValue}>
      {children}
    </ConnectionContext.Provider>
  );
}