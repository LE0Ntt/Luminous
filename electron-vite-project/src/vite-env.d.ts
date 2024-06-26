/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    [x: string]: any;
    openExternal(newUrl: string): unknown;
    getIp: () => Promise<{ ip: string; port: string }>;
    getLanguage: () => Promise<string>;
    getPlatform: () => Promise<string>;
    openExternal: (url: string) => void;
  };
}
