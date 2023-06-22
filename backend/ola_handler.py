# dmx.py
import sys
import array
from ola.ClientWrapper import ClientWrapper


class ola_handler:
    def __init__(self):
        self.wrapper = None
        self.universe = 2
        self.dmx_data = array.array('B', [0]*256)

    def DmxSent(self, status):
        if status.Succeeded():
            print('Success!')
        else:
            print('Error: %s' % status.message, file=sys.stderr)

        if self.wrapper:
            self.wrapper.Stop()

    def setup(self):
        print("Setting up...")

    def send_dmx(self, channel, faderValue):
        print("Fader", channel, "Value changed: ", faderValue)
        length = len(self.dmx_data)
        print("len", length)
        self.dmx_data[channel] = faderValue

        self.wrapper = ClientWrapper()
        client = self.wrapper.Client()
        client.SendDmx(self.universe, self.dmx_data, self.DmxSent)
        self.wrapper.Run()
