import time
import unittest

from server import app, routes
from server.auth import create_admin_token
from server.models import Scene
import socket_events
from socket_events import find_device, register_socketio_events, socketio

register_socketio_events(socketio)

NAMESPACE = "/socket"


def received(client, name):
    return [event["args"][0] if event["args"] else None for event in client.get_received(NAMESPACE) if event["name"] == name]


def scene_index(name):
    return next(scene["id"] for scene in routes.scenes if scene["name"] == name)


class SocketEventsTest(unittest.TestCase):
    def setUp(self):
        self.a = socketio.test_client(app, namespace=NAMESPACE)
        self.b = socketio.test_client(app, namespace=NAMESPACE)
        self.a.get_received(NAMESPACE)
        self.b.get_received(NAMESPACE)

    def tearDown(self):
        self.a.disconnect(namespace=NAMESPACE)
        self.b.disconnect(namespace=NAMESPACE)

    def emit(self, event, data):
        self.a.emit(event, data, namespace=NAMESPACE)

    def set_scene(self, name, status, fade_time=0):
        self.emit("scene_update", {"id": scene_index(name), "status": status, "fadeTime": fade_time})
        time.sleep(fade_time + 0.2)

    def test_fader_value_reaches_dmx_and_the_other_clients(self):
        self.emit("fader_value", {"deviceId": 1, "channelId": 0, "value": 200})
        self.assertEqual(find_device(1)["attributes"]["channel"][0]["sliderValue"], 200)
        self.assertEqual(socket_events.ola.fader_data[1][0], 200)  # D 1 is on DMX 1
        self.assertEqual(received(self.b, "variable_update"), [{"deviceId": 1, "value": 200, "channelId": 0}])
        self.assertEqual(received(self.a, "variable_update"), [])

    def test_master_dims_intensity_but_not_the_bicolor_temperature(self):
        self.emit("fader_value", {"deviceId": 14, "channelId": 0, "value": 255})  # Greenscreen intensity, DMX 14
        self.emit("fader_value", {"deviceId": 14, "channelId": 1, "value": 128})  # Bi-colour, DMX 13
        self.emit("fader_value", {"deviceId": 0, "channelId": 0, "value": 51})  # Master 20 %
        try:
            self.assertEqual(socket_events.ola.dmx_data[1][13], 51)
            self.assertEqual(socket_events.ola.dmx_data[1][12], 128)
        finally:
            self.emit("fader_value", {"deviceId": 0, "channelId": 0, "value": 255})

    def test_dmx_channel_fader_without_device_with_two_clients(self):
        self.emit("fader_value", {"deviceId": 692, "channelId": 5, "value": 77})
        self.assertEqual(socket_events.ola.fader_data[1][4], 77)
        self.assertEqual(received(self.b, "variable_update"), [{"deviceId": 692, "value": 77, "channelId": 5}])

    def test_scene_fade_is_sent_in_batches_and_ends_at_the_scene_values(self):
        name = "Traversen - Party"
        self.set_scene(name, True, fade_time=1)
        try:
            messages = self.b.get_received(NAMESPACE)
            batches = [m for m in messages if m["name"] == "bulk_variable_update"]
            singles = [m for m in messages if m["name"] == "variable_update"]
            # Before: one message per channel and 20 ms step, about 2000 per second for this scene
            self.assertTrue(10 <= len(batches) <= 80, len(batches))
            self.assertLessEqual(len(singles), 50)

            scene = routes.scenes[scene_index(name)]
            for scene_device in scene["channel"]:
                actual = find_device(scene_device["id"])["attributes"]["channel"]
                for channel in scene_device["attributes"]["channel"]:
                    self.assertEqual(actual[channel["id"]]["sliderValue"], channel["sliderValue"])
        finally:
            self.set_scene(name, False)

    def test_deleting_a_scene_keeps_the_active_scene_stack_consistent(self):
        self.set_scene("Traversen - Türkis", True)
        self.set_scene("Traversen - Party", True)
        try:
            self.emit("scene_delete", {"id": scene_index("Traversen - Türkis"), "token": create_admin_token()})

            party = scene_index("Traversen - Party")
            self.assertEqual([entry["scene_id"] for entry in socket_events.scene_stack], [party])
            with app.app_context():
                stored = Scene.query.order_by(Scene.id).all()
            self.assertEqual([scene.id for scene in stored], list(range(1, len(stored) + 1)))
            self.assertEqual([scene.name for scene in stored], [scene["name"] for scene in routes.scenes[: len(stored)]])
        finally:
            self.set_scene("Traversen - Party", False)

    def test_deleting_a_saved_scene_needs_the_admin_token(self):
        count = len(routes.scenes)
        self.emit("scene_delete", {"id": 0})
        self.assertEqual(len(routes.scenes), count)

    def test_saving_a_scene_stores_its_own_name(self):
        self.emit("scene_add", {"scene": {"name": "Audit A", "saved": False}})
        self.emit("scene_add", {"scene": {"name": "Audit B", "saved": False}})
        self.emit("scene_save", {"id": scene_index("Audit B"), "token": create_admin_token()})

        with app.app_context():
            stored = Scene.query.order_by(Scene.id.desc()).first()
            saved_count = Scene.query.count()
        self.assertEqual(stored.name, "Audit B")
        self.assertEqual(routes.scenes[saved_count - 1]["name"], "Audit B")
        self.assertEqual(routes.scenes[saved_count]["name"], "Audit A")


class CheckPasswordTest(unittest.TestCase):
    def test_wrong_passwords_are_rate_limited(self):
        client = app.test_client()
        try:
            for _ in range(5):
                response = client.post("/check_password", json={"password": "definitely wrong"})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.get_json()["match"], "false")
            self.assertEqual(client.post("/check_password", json={"password": "definitely wrong"}).status_code, 429)
        finally:
            routes.password_attempts.reset("127.0.0.1")
