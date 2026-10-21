/**
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * @file helpers.ts
 * Pure helper functions without React or DOM dependencies (covered by helpers.test.ts).
 */

export const FADER_MAX = 255;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Keep only digits and decimal separators while typing into a number text field
export const sanitizeDecimalInput = (value: string) => value.replace(/[^0-9.,]+/g, '');

// Parse user input with either a comma or a dot as decimal separator, NaN if there is no number
export const parseDecimal = (value: string) => parseFloat(value.replace(',', '.'));

export const faderToPercent = (value: number) => (value / FADER_MAX) * 100;

export const percentToFader = (percent: number) => Math.round((clamp(percent, 0, 100) / 100) * FADER_MAX);

// crypto.randomUUID only exists in secure contexts, the web version is usually served via http://<ip>
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Same rules as the 'ipv4' format of the electron-store schema (0-255, no leading zeros)
const IPV4_OCTET = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

export function isValidIpv4(ip: string): boolean {
  const octets = ip.split('.');
  return octets.length === 4 && octets.every((octet) => IPV4_OCTET.test(octet));
}

export function isValidPort(port: string): boolean {
  return /^\d{1,5}$/.test(port) && Number(port) >= 1 && Number(port) <= 65535;
}

export interface FaderUpdate {
  deviceId: number;
  channelId: number;
  value: number;
}

export interface DeviceFaderUpdates {
  deviceId: number;
  channels: { channelId: number; value: number }[];
}

// Group single channel updates by device for the 'bulk_fader_values' socket event
export function groupFaderUpdates(updates: FaderUpdate[]): DeviceFaderUpdates[] {
  const byDevice = new Map<number, DeviceFaderUpdates>();
  for (const { deviceId, channelId, value } of updates) {
    let device = byDevice.get(deviceId);
    if (!device) {
      device = { deviceId, channels: [] };
      byDevice.set(deviceId, device);
    }
    device.channels.push({ channelId, value });
  }
  return [...byDevice.values()];
}
