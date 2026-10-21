"""
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
 * @file ola_handler.py
"""

import array
import logging
import threading
from ola.ClientWrapper import ClientWrapper  # type: ignore

logger = logging.getLogger(__name__)

UNIVERSES = (1, 2)
SEND_INTERVAL_MS = 20


class ola_handler:
    def __init__(self):
        self.wrapper = ClientWrapper()
        self.client = self.wrapper.Client()
        self.master = 1.0
        # 0-based channels per universe the master doesn't dim (see helpers.master_exempt_channels)
        self.ignored_channels = {universe: set() for universe in UNIVERSES}
        self.dmx_data = {universe: array.array("B", [0] * 512) for universe in UNIVERSES}
        self.fader_data = {universe: array.array("B", [0] * 512) for universe in UNIVERSES}
        self.send_buffer = {universe: False for universe in UNIVERSES}  # Universes with unsent changes
        self.lock = threading.Lock()

        # The OLA client is not thread-safe: all frames are sent from the wrapper's event loop,
        # which also processes the replies of olad. Other threads only change the buffers.
        self.wrapper.AddEvent(SEND_INTERVAL_MS, self.timed_send)
        self.thread = threading.Thread(target=self.run, name="ola", daemon=True)
        self.thread.start()

    def run(self):
        try:
            self.wrapper.Run()
        except Exception:
            logger.exception("OLA event loop stopped")
        else:
            logger.error("OLA event loop stopped, DMX output is no longer sent")

    def DmxSent(self, status):
        if not status.Succeeded():
            logger.error("Sending DMX failed: %s", status.message)

    def setup(self):
        with self.lock:
            for universe in UNIVERSES:
                self.send_buffer[universe] = True

    def set_ignored_channels(self, ignored_channels):
        with self.lock:
            self.ignored_channels = {universe: set(ignored_channels.get(universe, ())) for universe in UNIVERSES}
            self._apply_master()

    def send_dmx(self, universe, channel, faderValue):
        if universe not in UNIVERSES:
            logger.error("Invalid universe %s", universe)
            return
        with self.lock:
            self.fader_data[universe][channel] = faderValue
            if channel in self.ignored_channels[universe]:
                self.dmx_data[universe][channel] = faderValue
            else:
                self.dmx_data[universe][channel] = int(faderValue * self.master)
            self.send_buffer[universe] = True

    def timed_send(self):
        try:
            with self.lock:
                frames = [(universe, array.array("B", self.dmx_data[universe])) for universe in UNIVERSES if self.send_buffer[universe]]
                for universe, _ in frames:
                    self.send_buffer[universe] = False
            for universe, data in frames:
                self.client.SendDmx(universe, data, self.DmxSent)
        except Exception:
            logger.exception("Sending DMX failed")
        finally:
            self.wrapper.AddEvent(SEND_INTERVAL_MS, self.timed_send)

    def master_fader(self, faderValue):
        with self.lock:
            self.master = faderValue / 255
            self._apply_master()

    # Recalculate all dimmable channels, needs self.lock
    def _apply_master(self):
        for universe in UNIVERSES:
            ignored = self.ignored_channels[universe]
            for channel in range(512):
                value = self.fader_data[universe][channel]
                self.dmx_data[universe][channel] = value if channel in ignored else int(value * self.master)
            self.send_buffer[universe] = True

    def everything_off(self):
        with self.lock:
            for universe in UNIVERSES:
                self.dmx_data[universe] = array.array("B", [0] * 512)
                self.send_buffer[universe] = True
