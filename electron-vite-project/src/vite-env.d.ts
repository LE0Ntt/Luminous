/// <reference types="vite/client" />

interface Window {
    electronAPI: {
      openExternal(newUrl: string): unknown;
      getIp: () => Promise<{ ip: string, port: string }>;
      getPlatform: () => Promise<string>;
      openExternal: (url: string) => void;
    }
  }