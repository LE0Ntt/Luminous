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
 * @file EventBus.tsx
 */
type EventCallback = (data?: any) => void;

class EventBus {
  events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const eventCallbacks = this.events[event];
    if (eventCallbacks) {
      this.events[event] = eventCallbacks.filter((cb) => cb !== callback);
    }
  }

  emit(event: string, data?: any): void {
    const eventCallbacks = this.events[event];
    if (eventCallbacks) {
      eventCallbacks.forEach((callback) => callback(data));
    }
  }
}

export const eventBus = new EventBus();
