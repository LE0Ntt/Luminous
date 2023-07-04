import sys
import array
from ola.ClientWrapper import ClientWrapper


class ola_handler:
    def __init__(self):
        self.wrapper = None
        self.dmx_data = array.array('B', [0]*256)
        self.master = 1
        self.fader_data = array.array('B', [0]*256)

    def DmxSent(self, status):
        if status.Succeeded():
            print('Success!')
        else:
            print('Error: %s' % status.message, file=sys.stderr)

        if self.wrapper:
            self.wrapper.Stop()

    def setup(self):
        print("Setting up...")

    def send_dmx(self, universe, channel, faderValue):
        self.fader_data[channel] = faderValue
        # print("fader Data: ", self.fader_data)
        # print("Universe", universe, "Fader", channel, "Value changed: ", faderValue)
        length = len(self.dmx_data)
        # print("len", length)
        fader_value = int(faderValue * self.master)

        # print( "new Dmx data: ", int(self.fader_data[channel] * self.master))
        # print( "sel master: ", self.master)
        self.dmx_data[channel] = int(self.fader_data[channel] * self.master)

        self.wrapper = ClientWrapper()
        client = self.wrapper.Client()
        client.SendDmx(universe, self.dmx_data, self.DmxSent)
        self.wrapper.Run()

    def master_fader(self, faderValue):
        # print("Masterfader")
        # print("Fader Value: ", faderValue)
        # print("DMX Data: ", self.dmx_data)
        self.master = faderValue / 255
        for i, value in enumerate(self.fader_data):
            self.dmx_data[i] = int(value * self.master)

        self.wrapper = ClientWrapper()
        client = self.wrapper.Client()
        client.SendDmx(1, self.dmx_data, self.DmxSent)
        self.wrapper.Run()
