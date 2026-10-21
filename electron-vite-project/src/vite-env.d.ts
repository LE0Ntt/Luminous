/// <reference types="vite/client" />

// Bridge exposed by electron/preload/index.ts. Undefined in the web version.
interface ElectronAPI {
  getIp: () => Promise<{ ip: string; port: number }>;
  getLanguage: () => Promise<string>;
  setLanguage: (language: string) => Promise<void>;
  send: (channel: 'toggle-full-screen' | 'minimize' | 'close' | 'set-ip' | 'set-port' | 'open-OLA', data?: unknown) => void;
  getPlatform: () => Promise<string>;
  openExternal: (url: string) => void;
  getFullScreen: () => Promise<boolean>;
  showAlert: (message: string) => Promise<void>;
}

interface Window {
  electronAPI?: ElectronAPI;
}
