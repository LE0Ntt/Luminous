"""
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * @file helpers.py
 * Helper functions without Flask, Socket.IO or hardware dependencies (covered by tests/).
"""

import threading
import time


# DMX channels (0-based, per universe) the master fader must not dim: everything except the
# intensity ('main') channels, e.g. colour, bi-colour temperature or the on/off channel of HMIs
def master_exempt_channels(devices):
    exempt = {1: set(), 2: set()}
    for device in devices:
        if device.get("id") == 0:  # Master
            continue
        try:
            universe = int(str(device["universe"])[1:])  # 'U1' -> 1
        except (KeyError, ValueError):
            continue
        for channel in device.get("attributes", {}).get("channel", []):
            if channel.get("channel_type") == "main":
                continue
            try:
                exempt.setdefault(universe, set()).add(int(channel["dmx_channel"]) - 1)
            except (KeyError, ValueError, TypeError):
                continue
    return exempt


# Scene ids are list positions and change when scenes are deleted or saved.
# `before` holds (scene, id) pairs captured before the change, the result maps old to new ids
# for all scenes that still exist.
def scene_id_changes(before, scenes):
    remaining = {id(scene) for scene in scenes}
    return {old_id: scene["id"] for scene, old_id in before if id(scene) in remaining}


# Update the scene ids of the active scene stack, entries of removed scenes are dropped
def remap_scene_stack(scene_stack, id_map):
    remapped = []
    for entry in scene_stack:
        if entry["scene_id"] in id_map:
            entry["scene_id"] = id_map[entry["scene_id"]]
            remapped.append(entry)
    return remapped


# Blocks a client (e.g. by IP) after too many failed attempts within a time window
class AttemptLimiter:
    def __init__(self, max_attempts=5, window_seconds=60, clock=time.monotonic):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._clock = clock
        self._failures = {}
        self._lock = threading.Lock()

    def _recent(self, key):
        cutoff = self._clock() - self.window_seconds
        failures = [t for t in self._failures.get(key, []) if t > cutoff]
        if failures:
            self._failures[key] = failures
        else:
            self._failures.pop(key, None)
        return failures

    def is_blocked(self, key):
        with self._lock:
            return len(self._recent(key)) >= self.max_attempts

    def record_failure(self, key):
        with self._lock:
            self._failures[key] = self._recent(key) + [self._clock()]

    def reset(self, key):
        with self._lock:
            self._failures.pop(key, None)
