/**
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * @file platform.ts
 * Access to the Electron bridge with fallbacks for the web version, where window.electronAPI is undefined.
 */

export function showAlert(message: string) {
  if (window.electronAPI) {
    window.electronAPI.showAlert(message);
  } else {
    window.alert(message);
  }
}
