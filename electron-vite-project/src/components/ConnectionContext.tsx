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
import React, { useState, useEffect, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

type EmitFunction = (event: string, data?: any) => void;
type OnFunction = (event: string, callback: (data?: any) => void) => void;
type OffFunction = (event: string, callback: (data?: any) => void) => void;

interface ConnectionContextType {
  connected: boolean;
  emit: EmitFunction;
  on: OnFunction;
  off: OffFunction;
  url: string;
  changeUrl: (newUrl: string) => void;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function useConnectionContext(): ConnectionContextType {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnectionContext must be used within a ConnectionProvider');
  }
  return context;
}

interface ConnectionProviderProps {
  children: React.ReactNode;
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
    const url = new URL(newUrl);
    const ip = url.hostname;
    (window as any).electronAPI.send('set-ip', ip);
  }

  useEffect(() => {
    const socketInstance = io('ws://127.0.0.1:3000/socket'); // testing change for rust : default /socket
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socketInstance.on('reconnect', () => {
      console.log('Reconnected to server');
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

  useEffect(() => {
    socket?.on('test', () => {
      console.log('Test event received');
    });
  });

  const contextValue: ConnectionContextType = {
    connected,
    emit,
    on,
    off,
    url,
    changeUrl,
  };

  return <ConnectionContext.Provider value={contextValue}>{children}</ConnectionContext.Provider>;
}
