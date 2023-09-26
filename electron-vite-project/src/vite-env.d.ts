/// <reference types="vite/client" />

interface Window {
    electronAPI: {
      getIp: () => Promise<{ ip: string, port: string }>;
      getPlatform: () => Promise<string>;
      openExternal: (url: string) => void;
    }
  }