import unittest

from server.helpers import AttemptLimiter, master_exempt_channels, remap_scene_stack, scene_id_changes


def device(device_id, universe, *channels):
    return {
        "id": device_id,
        "universe": universe,
        "attributes": {"channel": [{"channel_type": t, "dmx_channel": str(c)} for t, c in channels]},
    }


class MasterExemptChannelsTest(unittest.TestCase):
    def test_non_intensity_channels_are_exempt_and_zero_based(self):
        devices = [
            {"id": 0, "attributes": {"channel": [{"id": "0", "channel_type": "main"}]}},  # Master
            device(13, "U1", ("main", 15), ("power", 16)),  # HMI
            device(14, "U1", ("main", 14), ("bi", 13)),  # Bi-colour
            device(15, "U2", ("main", 200), ("r", 201), ("g", 202), ("b", 203)),
        ]
        self.assertEqual(master_exempt_channels(devices), {1: {15, 12}, 2: {200, 201, 202}})

    def test_invalid_entries_are_skipped(self):
        devices = [device(1, "U1", ("bi", "")), {"id": 2, "attributes": {"channel": []}}]
        self.assertEqual(master_exempt_channels(devices), {1: set(), 2: set()})


class SceneIdTest(unittest.TestCase):
    def test_delete_drops_the_scene_and_shifts_the_following_ids(self):
        scenes = [{"id": i} for i in range(4)]
        before = [(s, s["id"]) for s in scenes]
        scenes.pop(1)
        for s in scenes:
            if s["id"] > 1:
                s["id"] -= 1
        stack = [{"scene_id": 1}, {"scene_id": 3}, {"scene_id": 0}]
        self.assertEqual(remap_scene_stack(stack, scene_id_changes(before, scenes)), [{"scene_id": 2}, {"scene_id": 0}])

    def test_moved_scene_keeps_its_stack_entry(self):
        scenes = [{"id": 0, "name": "saved"}, {"id": 1, "name": "a"}, {"id": 2, "name": "b"}]
        before = [(s, s["id"]) for s in scenes]
        moved = scenes.pop(2)  # Save 'b' right behind the saved scenes
        scenes[1]["id"] = 2
        moved["id"] = 1
        scenes.insert(1, moved)
        stack = [{"scene_id": 2}, {"scene_id": 1}]
        self.assertEqual(remap_scene_stack(stack, scene_id_changes(before, scenes)), [{"scene_id": 1}, {"scene_id": 2}])


class AttemptLimiterTest(unittest.TestCase):
    def test_blocks_after_max_attempts_until_the_window_passed(self):
        now = [0.0]
        limiter = AttemptLimiter(max_attempts=3, window_seconds=60, clock=lambda: now[0])
        for _ in range(3):
            self.assertFalse(limiter.is_blocked("a"))
            limiter.record_failure("a")
        self.assertTrue(limiter.is_blocked("a"))
        self.assertFalse(limiter.is_blocked("b"))
        now[0] = 61
        self.assertFalse(limiter.is_blocked("a"))

    def test_reset_clears_the_failures(self):
        limiter = AttemptLimiter(max_attempts=1, window_seconds=60)
        limiter.record_failure("a")
        limiter.reset("a")
        self.assertFalse(limiter.is_blocked("a"))
