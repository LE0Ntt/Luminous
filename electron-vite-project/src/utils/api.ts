/**
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * @file api.ts
 */

// Most server routes return `jsonify(json.dumps(...))`, i.e. JSON encoded twice
export async function fetchServerJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  const data = await response.json();
  return typeof data === 'string' ? JSON.parse(data) : data;
}

// Admin-only routes expect the token from /check_password in this header (socket events in a 'token' field)
export const ADMIN_TOKEN_HEADER = 'X-Admin-Token';
