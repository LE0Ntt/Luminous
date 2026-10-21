"""
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * @file fade_engine.py
"""

import logging
import threading
import time

logger = logging.getLogger(__name__)


class Fade:
    def __init__(self, device, channel_id, channel, start_value, end_value, duration, start_time):
        self.device = device
        self.channel_id = channel_id
        self.channel = channel
        self.start_value = start_value
        self.end_value = end_value
        self.duration = duration
        self.start_time = start_time
        self.last_value = start_value


# Runs all fades in a single loop instead of one thread per channel and hands the
# changed values of each tick to `on_tick(updates, finished, active)` in one batch:
# updates = [(fade, value)], finished = fades completed in this tick, active = fades left
class FadeEngine:
    def __init__(self, on_tick, interval=0.02, clock=time.monotonic, run_thread=True):
        self._on_tick = on_tick
        self._interval = interval
        self._clock = clock
        self._run_thread = run_thread
        self._fades = {}  # (device_id, channel_id) -> Fade
        self._lock = threading.Lock()
        self._wakeup = threading.Condition(self._lock)
        self._thread = None

    # Start a fade, an existing fade of the same channel is replaced (without setting its end value)
    def start(self, device, channel_id, channel, start_value, end_value, duration):
        with self._lock:
            key = (device["id"], channel_id)
            self._fades[key] = Fade(
                device, channel_id, channel, start_value, end_value, max(0.0, duration), self._clock()
            )
            if self._run_thread and self._thread is None:
                self._thread = threading.Thread(target=self._run, name="fade-engine", daemon=True)
                self._thread.start()
            self._wakeup.notify()

    def stop_all(self):
        with self._lock:
            self._fades.clear()

    def is_active(self):
        with self._lock:
            return bool(self._fades)

    # Advance all fades to `now`, only values that changed are reported
    def step(self, now):
        updates = []
        finished = []
        with self._lock:
            for key, fade in list(self._fades.items()):
                progress = 1.0 if fade.duration <= 0 else min(1.0, (now - fade.start_time) / fade.duration)
                if progress >= 1.0:
                    value = fade.end_value
                    del self._fades[key]
                    finished.append(fade)
                else:
                    value = int(fade.start_value + (fade.end_value - fade.start_value) * progress)
                if value != fade.last_value or progress >= 1.0:
                    fade.last_value = value
                    updates.append((fade, value))
            active = bool(self._fades)
        return updates, finished, active

    def _run(self):
        next_tick = self._clock()
        while True:
            with self._lock:
                while not self._fades:
                    self._wakeup.wait()
                    next_tick = self._clock()

            updates, finished, active = self.step(self._clock())
            if updates:
                try:
                    self._on_tick(updates, finished, active)
                except Exception:
                    logger.exception("Error while applying fade values")

            next_tick += self._interval
            delay = next_tick - self._clock()
            if delay > 0:
                time.sleep(delay)
            else:
                next_tick = self._clock()  # Running late, don't try to catch up
