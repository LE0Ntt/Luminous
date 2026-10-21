import unittest

from server.fade_engine import FadeEngine


class FadeEngineTest(unittest.TestCase):
    def setUp(self):
        self.now = 0.0
        self.engine = FadeEngine(on_tick=None, clock=lambda: self.now, run_thread=False)
        self.device = {"id": 7}
        self.channel = {"id": 0, "sliderValue": 0}

    def step(self, now):
        self.now = now
        updates, finished, active = self.engine.step(now)
        return [value for _, value in updates], finished, active

    def test_interpolates_linearly_and_ends_exactly_at_the_end_value(self):
        self.engine.start(self.device, 0, self.channel, 0, 255, 1.0)
        self.assertEqual(self.step(0.5)[0], [127])
        values, finished, active = self.step(1.2)
        self.assertEqual(values, [255])
        self.assertEqual(len(finished), 1)
        self.assertFalse(active)
        self.assertFalse(self.engine.is_active())

    def test_unchanged_values_are_not_reported(self):
        self.engine.start(self.device, 0, self.channel, 100, 101, 10.0)
        self.assertEqual(self.step(1.0)[0], [])

    def test_zero_duration_is_applied_on_the_next_tick(self):
        self.engine.start(self.device, 0, self.channel, 30, 0, 0)
        self.assertEqual(self.step(0.0)[0], [0])

    def test_new_fade_replaces_the_running_one_of_the_same_channel(self):
        self.engine.start(self.device, 0, self.channel, 0, 255, 1.0)
        self.engine.start(self.device, 0, self.channel, 255, 0, 1.0)
        values, finished, _ = self.step(1.0)
        self.assertEqual(values, [0])
        self.assertEqual(len(finished), 1)

    def test_fades_of_several_channels_run_together(self):
        self.engine.start(self.device, 0, self.channel, 0, 100, 1.0)
        self.engine.start(self.device, 1, {"id": 1}, 0, 200, 2.0)
        values, finished, active = self.step(1.0)
        self.assertEqual(sorted(values), [100, 100])
        self.assertEqual(len(finished), 1)
        self.assertTrue(active)

    def test_stop_all(self):
        self.engine.start(self.device, 0, self.channel, 0, 255, 1.0)
        self.engine.stop_all()
        self.assertEqual(self.step(1.0)[0], [])
