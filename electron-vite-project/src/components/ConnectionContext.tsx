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
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
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
  // The web version is served by the server itself (relative URLs), Electron loads the address from its store first
  const [url, setUrl] = useState<string | null>(window.electronAPI ? null : '');

  useEffect(() => {
    window.electronAPI
      ?.getIp()
      .then(({ ip, port }) => setUrl(`http://${ip}:${port}`))
      .catch((error) => console.error('Could not load the server address:', error));
  }, []);

  // change url to your server address
  const changeUrl = useCallback((newUrl: string) => {
    const { hostname, port } = new URL(newUrl); // Throws on invalid input before anything is changed
    setUrl(newUrl);
    window.electronAPI?.send('set-ip', hostname);
    window.electronAPI?.send('set-port', port ? parseInt(port, 10) : 80); // URL omits the default port
  }, []);

  useEffect(() => {
    if (url === null) return;

    const socketInstance = io(`${url}/socket`);
    setSocket(socketInstance);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [url]);

  // Stable while the socket stays the same, so consumers only resubscribe when the socket is replaced
  const emit = useCallback<EmitFunction>((event, data) => socket?.emit(event, data), [socket]);
  const on = useCallback<OnFunction>((event, callback) => socket?.on(event, callback), [socket]);
  const off = useCallback<OffFunction>((event, callback) => socket?.off(event, callback), [socket]);

  const contextValue = useMemo<ConnectionContextType>(
    () => ({ connected, emit, on, off, url: url ?? '', changeUrl }),
    [connected, emit, on, off, url, changeUrl]
  );

  return <ConnectionContext.Provider value={contextValue}>{children}</ConnectionContext.Provider>;
}
