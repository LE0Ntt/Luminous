import sys
import threading
import types


class FakeOlaClient:
    def __init__(self):
        self.sent = []  # (universe, frame) of every SendDmx call

    def SendDmx(self, universe, data, callback):
        self.sent.append((universe, bytes(data)))


class FakeClientWrapper:
    def __init__(self):
        self.client = FakeOlaClient()
        self.events = []  # (delay in ms, callback) of every AddEvent call

    def Client(self):
        return self.client

    def AddEvent(self, delay_ms, callback):
        self.events.append((delay_ms, callback))

    def Run(self):
        threading.Event().wait()  # Like the real event loop, never returns


# Provide `ola.ClientWrapper` without the OLA bindings, the tests call timed_send() themselves
def install_fake_ola():
    ola = types.ModuleType("ola")
    client_wrapper = types.ModuleType("ola.ClientWrapper")
    client_wrapper.ClientWrapper = FakeClientWrapper
    ola.ClientWrapper = client_wrapper
    sys.modules["ola"] = ola
    sys.modules["ola.ClientWrapper"] = client_wrapper
