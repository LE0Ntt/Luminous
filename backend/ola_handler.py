import sys
import array
import time
import threading
from ola.ClientWrapper import ClientWrapper
import server.routes

class ola_handler:
    def __init__(self):
        self.wrapper = ClientWrapper()
        self.client = self.wrapper.Client()
        self.master = 1
        self.ignored_channels = server.routes.ignored_channels   # ignored channels for master
        print(f"Ignored channels when checking: {self.ignored_channels}")
        self.dmx_data = {1: array.array('B', [0]*512), 2: array.array('B', [0]*512)}
        self.fader_data = {1: array.array('B', [0]*512), 2: array.array('B', [0]*512)}
        #test
        self.send_buffer = {1: False, 2: False}
        self.send_timer = threading.Timer(0.0, self.timed_send)  # 20 ms Timer
        self.send_timer.start()

    def DmxSent(self, status):
        if status.Succeeded():
            print('Success!')
        else:
            print(f'Error: {status.message}', file=sys.stderr)

    def setup(self):
        print("Setting up...")
        for universe in [1, 2]:
            self.client.SendDmx(universe, self.dmx_data[universe], self.DmxSent)
        print("Setup done")

    def send_dmx(self, universe, channel, faderValue):
        if universe in [1, 2]:
            self.fader_data[universe][channel] = faderValue

            if channel in self.ignored_channels.get(universe, []):  # Check if channel is ignored
                print(f"Channel {channel} is ignoring the master.")
                self.dmx_data[universe][channel] = int(self.fader_data[universe][channel])
                self.send_to_universe(universe)
                
            else:
                self.dmx_data[universe][channel] = int(self.fader_data[universe][channel] * self.master)
                self.send_to_universe(universe)

        else:
            print(f'Error: Invalid universe {universe}', file=sys.stderr)

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
            for i, value in enumerate(self.fader_data[universe]):
                if i+1 not in self.ignored_channels.get(universe, []):        # ignore channels
                    self.dmx_data[universe][i] = int(value * self.master)
            self.send_to_universe(universe)
