import sys
import array
import time
from ola.ClientWrapper import ClientWrapper


class ola_handler:
    def __init__(self):
        self.wrapper = ClientWrapper()
        self.master = 1
        self.ignored_channels = {1: [], 2: []}  # ignored channels for master
        self.dmx_data = {1: array.array(
            'B', [0]*512), 2: array.array('B', [0]*512)}
        self.fader_data = {1: array.array(
            'B', [0]*512), 2: array.array('B', [0]*512)}

    def DmxSent(self, status):
        if status.Succeeded():
            print('Success!')
        else:
            print(f'Error: {status.message}', file=sys.stderr)
        self.wrapper.Stop()

    def setup(self):
        print("Setting up...")
        for universe in [1, 2]:
            self.client.SendDmx(universe, self.dmx_data[universe], self.DmxSent)
        self.wrapper.Run()
        print("Setup done")

    def send_dmx(self, universe, channel, faderValue):
        if universe in [1, 2]:
            self.fader_data[universe][channel] = faderValue

            if channel in self.ignored_channels.get(universe, []):  # Check if channel is ignored
                print(f"Channel {channel} is ignoring the master.")
                self.dmx_data[universe][channel] = int(
                    self.fader_data[universe][channel])
                self.send_to_universe(universe)
                
            else:
                self.dmx_data[universe][channel] = int(
                    self.fader_data[universe][channel] * self.master)
                self.send_to_universe(universe)

        else:
            print(f'Error: Invalid universe {universe}', file=sys.stderr)

    def send_to_universe(self, universe):
        self.client.SendDmx(universe, self.dmx_data[universe], self.DmxSent)
        time.sleep(0.002) # Sleep to prevent buffer overflow for scenes, maybe shorter?

    def master_fader(self, faderValue):
        self.master = faderValue / 255
        for universe in [1, 2]:
            for i, value in enumerate(self.fader_data[universe]):
                if i not in self.ignored_channels.get(universe, []):        # ignore channels
                    self.dmx_data[universe][i] = int(value * self.master)
            self.send_to_universe(universe)
