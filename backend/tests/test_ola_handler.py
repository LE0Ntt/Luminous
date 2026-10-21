import unittest

from ola_handler import ola_handler


class OlaHandlerTest(unittest.TestCase):
    def setUp(self):
        self.ola = ola_handler()
        # Greenscreen of the studio: bi-colour on DMX 13, intensity on DMX 14 (0-based 12 and 13)
        self.ola.set_ignored_channels({1: {12}})

    def test_master_dims_intensity_but_not_exempt_channels(self):
        self.ola.send_dmx(1, 12, 200)
        self.ola.send_dmx(1, 13, 200)
        self.ola.master_fader(127)
        self.assertEqual(self.ola.dmx_data[1][12], 200)
        self.assertEqual(self.ola.dmx_data[1][13], int(200 * 127 / 255))

    def test_new_values_respect_the_current_master(self):
        self.ola.master_fader(0)
        self.ola.send_dmx(1, 13, 255)
        self.ola.send_dmx(1, 12, 255)
        self.assertEqual(self.ola.dmx_data[1][13], 0)
        self.assertEqual(self.ola.dmx_data[1][12], 255)

    def test_changing_the_exempt_channels_reapplies_the_master(self):
        self.ola.send_dmx(1, 12, 100)
        self.ola.master_fader(0)
        self.ola.set_ignored_channels({1: set()})
        self.assertEqual(self.ola.dmx_data[1][12], 0)

    def test_timed_send_only_sends_changed_universes_and_rearms(self):
        client = self.ola.client
        self.ola.timed_send()
        client.sent.clear()
        self.ola.send_dmx(2, 0, 10)
        events_before = len(self.ola.wrapper.events)
        self.ola.timed_send()
        self.assertEqual([universe for universe, _ in client.sent], [2])
        self.assertEqual(client.sent[0][1][0], 10)
        self.assertEqual(len(self.ola.wrapper.events), events_before + 1)
        client.sent.clear()
        self.ola.timed_send()
        self.assertEqual(client.sent, [])
