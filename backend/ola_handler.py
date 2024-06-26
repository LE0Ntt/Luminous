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

import sys
import array
import threading
from ola.ClientWrapper import ClientWrapper  # type: ignore
from server.models import ignored_channels


class ola_handler:
    def __init__(self):
        self.wrapper = ClientWrapper()
        self.client = self.wrapper.Client()
        self.master = 1.0
        self.ignored_channels = ignored_channels  # ignored channels for master
        print(f"Ignored channels when checking: {self.ignored_channels}")
        self.dmx_data = {1: array.array("B", [0] * 512), 2: array.array("B", [0] * 512)}
        self.fader_data = {
            1: array.array("B", [0] * 512),
            2: array.array("B", [0] * 512),
        }
        # test
        self.send_buffer = {1: False, 2: False}
        self.send_timer = threading.Timer(0.0, self.timed_send)  # 20 ms Timer
        self.send_timer.start()

    def DmxSent(self, status):
        if status.Succeeded():
            print("Success!")
        else:
            print(f"Error: {status.message}", file=sys.stderr)

    def setup(self):
        print("Setting up...")
        for universe in [1, 2]:
            self.client.SendDmx(universe, self.dmx_data[universe], self.DmxSent)
        print("Setup done")

    def send_dmx(self, universe, channel, faderValue):
        if universe in [1, 2]:
            self.fader_data[universe][channel] = faderValue

            if channel in self.ignored_channels.get(universe, []):
                self.dmx_data[universe][channel] = faderValue
            else:
                self.dmx_data[universe][channel] = int(faderValue * self.master)

            self.send_to_universe(universe)
        else:
            print(f"Error: Invalid universe {universe}", file=sys.stderr)

    def send_to_universe(self, universe):
        self.send_buffer[universe] = True

    def timed_send(self):
        for universe, ready in self.send_buffer.items():
            if ready:
                self.client.SendDmx(universe, self.dmx_data[universe], self.DmxSent)
                self.send_buffer[universe] = False
        self.send_timer = threading.Timer(0.02, self.timed_send)  # Restart the timer
        self.send_timer.start()

    def master_fader(self, faderValue):
        self.master = faderValue / 255
        for universe in [1, 2]:
            for channel in range(512):
                if channel not in self.ignored_channels.get(universe, []):
                    self.dmx_data[universe][channel] = int(
                        self.fader_data[universe][channel] * self.master
                    )
            self.send_to_universe(universe)

    def everything_off(self):
        for universe in self.dmx_data:
            self.dmx_data[universe] = array.array("B", [0] * 512)
            self.send_to_universe(universe)
