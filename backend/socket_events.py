"""
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 *
 * @file socket_events.py
"""

from flask import request
from flask_socketio import SocketIO  # type: ignore
from server import app, routes, db
from server.motorMix_driver import Driver
from server.models import Scene, Device
from server.auth import is_valid_admin_token
from server.fade_engine import FadeEngine
from server.helpers import master_exempt_channels, remap_scene_stack, scene_id_changes
import json
import logging
import threading
import bisect

logger = logging.getLogger(__name__)

scenes_solo_state = False
connections = 0
turned_off = False  # The last client closed the app, the next one is asked to recover or reset
scene_stack = []  # Order of the active scenes
# Socket.IO handles every event in its own thread, this guards the scenes, the scene stack and the connection count
state_lock = threading.RLock()

try:
    from ola_handler import ola_handler
    ola = ola_handler()
    ola.setup()
except ModuleNotFoundError:
    logger.warning("OLA module not found. Running without OLA support.")
    ola = None


def safe_ola_call(operation_type, func_or_attr_name, *args, **kwargs):
    if ola is not None:
        if operation_type == "func":
            func = getattr(ola, func_or_attr_name)
            func(*args, **kwargs)
        elif operation_type == "attr":
            setattr(ola, func_or_attr_name, args[0])


socketio = SocketIO(
    app,
    # Set explicitly, otherwise the mode depends on whether eventlet or gevent happen to be installed
    async_mode="threading",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


def send_dmx(
    fader: int, channelId: int, fader_value: int, device: dict, channel: dict
) -> None:
    if fader == 0 and int(channelId) == 0:  # The master channel id is stored as "0"
        safe_ola_call("func", "master_fader", fader_value)  # ola
    else:
        try:
            dmx_channel = int(channel["dmx_channel"])
            universe = int(device["universe"][1:])
            safe_ola_call(
                "func", "send_dmx", universe, dmx_channel - 1, fader_value
            )  # ola
        except KeyError:
            logger.warning("No dmx_channel key for channel %s of device %s", channelId, fader)


def send_dmx_direct(universe: int, value: int, channel: int) -> None:
    safe_ola_call("func", "send_dmx", universe, channel - 1, value)  # ola


# Tell OLA which channels the master fader must not dim, needed whenever the devices change
def update_master_exempt_channels():
    if ola is not None:
        ola.set_ignored_channels(master_exempt_channels(routes.devices))


# Device ids are the user defined device numbers, they are not list positions
def find_device(device_id):
    return next((d for d in routes.devices if d["id"] == device_id), None)


# Channel ids are the position of the channel within its device
def get_channel(device, channel_id):
    channels = device["attributes"]["channel"]
    return channels[channel_id] if 0 <= channel_id < len(channels) else None


def register_socketio_events(socketio):
    driver = None  # MotorMix, connected at the end of this function

    # Send a changed value to all clients (except skip_sid)
    def broadcast_value(device_id, value, channel_id, skip_sid=None):
        socketio.emit(
            "variable_update",
            {"deviceId": device_id, "value": value, "channelId": channel_id},
            namespace="/socket",
            skip_sid=skip_sid,
        )

    # Set a channel value and send it to OLA and the MotorMix
    def apply_value(device, channel_id, channel, value):
        channel["sliderValue"] = value
        send_dmx(device["id"], channel_id, value, device, channel)
        if driver is not None and channel_id == 0:  # The motor faders show the intensity
            driver.pushFader(device["id"], value)

    # The driver keeps references to the lists, which are replaced when devices or scenes are reloaded
    def sync_driver(scene_mapping=False):
        if driver is not None:
            driver.devices = routes.devices
            driver.scenes = routes.scenes
            if scene_mapping:
                driver.sceneMapping()

    # MotorMix fader moved
    def callback(index, value):
        device = find_device(index)
        if device is None:
            return
        channel = get_channel(device, 0)
        channel["sliderValue"] = value
        channel["backupValue"] = value
        send_dmx(index, 0, value, device, channel)
        broadcast_value(index, value, 0)
        check_sync_status(index, value, 0)

    def quickSceneCallback(scene, status):
        update_scene({"id": scene, "status": status})
        if status:
            sceneCallback(scene, 255)
        else:
            sceneCallback(scene, 0)

    def sceneCallback(scene, value):
        for currentScene in routes.scenes:
            if currentScene["id"] == scene:
                update_scene({"id": scene, "status": value > 0})
                break

    def blackoutCallback():
        reset_workspace(True)

    # Admin-only events need the token from /check_password in their payload.
    # Internal callers (e.g. the MotorMix driver) don't go through these events
    def admin_authorized(data, event):
        token = data.get("token") if isinstance(data, dict) else None
        if is_valid_admin_token(token):
            return True
        logger.warning("Rejected unauthorized '%s' event from %s", event, request.sid)  # type: ignore
        return False

    # send every channel of each device to ola on startup
    update_master_exempt_channels()
    for device in routes.devices:
        for channel in device["attributes"]["channel"]:
            send_dmx(
                device["id"], channel["id"], channel["sliderValue"], device, channel
            )

    # Solo for control (LightFX) selection
    @socketio.on("control_solo", namespace="/socket")
    def control_solo(data):
        solo = bool(data["solo"])
        selected_ids = {dev["id"] for dev in data["devices"]}

        def update_device(device, slider_value):
            apply_value(device, 0, device["attributes"]["channel"][0], slider_value)
            broadcast_value(device["id"], slider_value, 0)
            check_sync_status(device["id"], slider_value, 0)

        with state_lock:
            # Create a set of devices controlled by active scenes
            scene_controlled_devices = set()
            for scene in scene_stack:
                scene_id = scene["scene_id"]
                # Find the scene data
                scene_data = next((s for s in routes.scenes if s["id"] == scene_id), None)
                if scene_data and scene_data.get("status", False):
                    for device in scene_data.get("channel", []):
                        scene_controlled_devices.add(device["id"])

            for device in routes.devices:
                device_id = device["id"]
                if device_id == 0:
                    continue

                channel_attrs = device["attributes"]["channel"][0]
                slider_value = channel_attrs["sliderValue"]
                backup_value = channel_attrs.get("backupValue", 0)

                if solo and device_id not in selected_ids and slider_value > 0:
                    if device_id not in scene_controlled_devices:
                        channel_attrs["backupValue"] = slider_value
                        channel_attrs["sliderValue"] = 0
                        update_device(device, 0)
                elif not solo and slider_value == 0:
                    if backup_value > 0:
                        if device_id not in scene_controlled_devices:
                            channel_attrs["sliderValue"] = backup_value
                            update_device(device, backup_value)

    # ------------------- Begin of Scene status (on/off) -------------------

    # Apply the values of one fade tick and send them to the clients in a single message
    def apply_fade_tick(updates, finished, active):
        for fade, value in updates:
            apply_value(fade.device, fade.channel_id, fade.channel, value)
        socketio.emit(
            "bulk_variable_update",
            [
                {"deviceId": fade.device["id"], "channelId": fade.channel_id, "value": value}
                for fade, value in updates
            ],
            namespace="/socket",
        )
        # Values are only compared with the scenes once all fades are done
        if not active:
            for fade in finished:
                check_sync_status(fade.device["id"], fade.end_value, fade.channel_id)

    fade_engine = FadeEngine(apply_fade_tick)

    # Fade a device channel from start_value to end_value, replaces a running fade of the same channel
    def start_fade(device, channel, start_value, end_value, fade_time):
        fade_engine.start(device, int(channel["id"]), channel, start_value, end_value, fade_time)

    # Turns off all scenes except the current one
    def turn_off_other_scenes(current_scene_id):
        for scene in routes.scenes:
            if scene["id"] != current_scene_id and scene.get("status", False):
                scene["status"] = False
                remove_scene_from_stack(
                    scene["id"]
                )  # Ensure the scene is removed from the stack
                socketio.emit(
                    "scene_update",
                    {"id": scene["id"], "status": False},
                    namespace="/socket",
                )
                scene["out_of_sync"] = False
                socketio.emit("in_sync", {"scene_id": scene["id"]}, namespace="/socket")

    # Updates devices based on the solo mode
    def update_devices(solo_active, scene_device_ids, fade_time):
        for device in routes.devices:
            device_id = device["id"]
            if device_id not in scene_device_ids and device_id != 0:
                master_channel = device["attributes"]["channel"][0]
                start_value = master_channel["sliderValue"]
                end_value = 0 if solo_active else master_channel.get("backupValue", 0)

                if start_value != end_value:
                    start_fade(device, master_channel, start_value, end_value, fade_time)

    # Remove scene from the stack by scene_id
    def remove_scene_from_stack(scene_id):
        scene_stack[:] = [
            scene for scene in scene_stack if scene["scene_id"] != scene_id
        ]

    # Update status (on/off) of a scene
    @socketio.on("scene_update", namespace="/socket")
    def update_scene(data):
        global scenes_solo_state
        try:
            scene_id = int(data["id"])
            status = bool(data["status"])
            solo = bool(data.get("solo", False))
            fade_time = int(data.get("fadeTime", 0))
        except (KeyError, ValueError, TypeError):
            return

        with state_lock:
            # Find the scene in our routes
            scene_data = None
            for scene in routes.scenes:
                if scene["id"] == scene_id:
                    scene["status"] = status

                    # Always reset out_of_sync flag when turning off a scene
                    if not status and scene.get("out_of_sync", False):
                        scene["out_of_sync"] = False
                        socketio.emit(
                            "in_sync", {"scene_id": scene_id}, namespace="/socket"
                        )

                    scene_data = scene
                    break

            if not scene_data:
                return

            scene_device_ids = {device["id"] for device in scene_data.get("channel", [])}

            if status:  # Scene is being activated
                existing_scene = next(
                    (s for s in scene_stack if s["scene_id"] == scene_id), None
                )
                if existing_scene:
                    scene_stack.remove(existing_scene)

                scene_entry = {"scene_id": scene_id, "devices": {}, "out_of_sync": False}

                for device in scene_data.get("channel", []):
                    scene_entry["devices"][device["id"]] = {
                        "channels": [
                            ch.copy() for ch in device["attributes"]["channel"]
                        ],
                        "original_state": True,
                    }

                scene_stack.append(scene_entry)

            else:  # Scene is being deactivated
                devices_in_scene = set()
                for device_in_scene in scene_data.get("channel", []):
                    devices_in_scene.add(device_in_scene["id"])
                remove_scene_from_stack(scene_id)
                target_channel_states = {}  # Structure: {device_id: {channel_id: value}}

                # Determine target state from remaining active scenes (if any)
                for active_scene_entry in reversed(scene_stack):
                    active_scene_id = active_scene_entry["scene_id"]
                    active_scene_data = next((s for s in routes.scenes if s["id"] == active_scene_id), None)

                    if active_scene_data and active_scene_data.get("status", False):
                        for device_in_active_scene in active_scene_data.get("channel", []):
                            device_id = device_in_active_scene["id"]
                            if device_id in devices_in_scene:
                                if device_id not in target_channel_states:
                                    target_channel_states[device_id] = {}

                                for channel_data in device_in_active_scene["attributes"]["channel"]:
                                    channel_id = channel_data["id"]
                                    if channel_id not in target_channel_states[device_id]:
                                        target_channel_states[device_id][channel_id] = channel_data["sliderValue"]

                # Apply target states or fallback values
                for device_id in devices_in_scene:
                    actual_device = find_device(device_id)
                    if not actual_device:
                        continue
                    for actual_channel in actual_device["attributes"]["channel"]:
                        channel_id = actual_channel["id"]
                        start_value = actual_channel["sliderValue"]
                        device_target_states = target_channel_states.get(device_id, {})

                        if channel_id in device_target_states:
                            end_value = device_target_states[channel_id]
                        else:
                            if scenes_solo_state and not scene_stack:
                                end_value = 0
                            else:
                                end_value = actual_channel.get("backupValue", 0)
                        if start_value != end_value:
                            start_fade(actual_device, actual_channel, start_value, end_value, fade_time)
                        else:
                            actual_channel["sliderValue"] = end_value

            if solo and status:
                scenes_solo_state = True
                turn_off_other_scenes(scene_id)
                update_devices(
                    solo_active=True,
                    scene_device_ids=scene_device_ids,
                    fade_time=fade_time,
                )
            elif (scenes_solo_state and not solo) or (not status and solo):
                scenes_solo_state = False
                update_devices(
                    solo_active=False,
                    scene_device_ids=scene_device_ids,
                    fade_time=fade_time,
                )

            if status:  # Scene activated
                for device_in_scene in scene_data.get("channel", []):
                    device_id = device_in_scene["id"]
                    actual_device = find_device(device_id)
                    if actual_device:
                        for scene_channel_data in device_in_scene["attributes"]["channel"]:
                            channel_id = scene_channel_data["id"]
                            actual_channel = next((ch for ch in actual_device["attributes"]["channel"] if ch["id"] == channel_id), None)
                            if actual_channel:
                                if channel_id == 0 and len([s for s in scene_stack if device_id in s["devices"]]) <= 1:
                                    actual_channel["backupValue"] = actual_channel["sliderValue"]

                                start_value = actual_channel["sliderValue"]
                                end_value = scene_channel_data["sliderValue"]

                                if start_value != end_value:
                                    start_fade(actual_device, actual_channel, start_value, end_value, fade_time)
                                else:
                                    apply_value(actual_device, channel_id, actual_channel, end_value)
                                    broadcast_value(device_id, end_value, channel_id)
                                    check_sync_status(device_id, end_value, channel_id)
                            else:
                                logger.warning("Channel ID %s from scene %s not found in device %s", channel_id, scene_id, device_id)

            # Update MotorMix controller if available
            if driver and scene_id is not None:
                driver.quickSceneButtonUpdate(scene_id, status)

        # Notify all clients about the scene update
        if connections > 0:
            socketio.emit(
                "scene_update", {"id": scene_id, "status": status}, namespace="/socket"
            )

    # Check if any active scene is out of sync with current device state
    def check_sync_status(fader, fader_value, channelId):
        with state_lock:
            if fade_engine.is_active() or not scene_stack:
                return

            for scene in routes.scenes:
                if not scene.get("status", False):
                    continue

                scene_device = next((d for d in scene.get("channel", []) if d["id"] == fader), None)
                if not scene_device:
                    continue

                try:
                    expected_value = scene_device["attributes"]["channel"][channelId]["sliderValue"]
                except (KeyError, IndexError):
                    continue  # Skip if channel not found

                was_out_of_sync = scene.get("out_of_sync", False)
                is_out_of_sync = abs(expected_value - fader_value) > 5  # Threshold

                # Update scene status if it changed
                if is_out_of_sync != was_out_of_sync:
                    scene["out_of_sync"] = is_out_of_sync

                    for stack_scene in scene_stack:
                        if stack_scene["scene_id"] == scene["id"]:
                            stack_scene["out_of_sync"] = is_out_of_sync
                            break

                    if is_out_of_sync:
                        socketio.emit("out_of_sync", {"scene_id": scene["id"]}, namespace="/socket")
                        logger.info("Scene %s is out of sync", scene["id"])
                    else:
                        socketio.emit("in_sync", {"scene_id": scene["id"]}, namespace="/socket")
                        logger.info("Scene %s is back in sync", scene["id"])

    # Delete a scene and tell every client to update
    @socketio.on("scene_delete", namespace="/socket")
    def delete_scene(data):
        try:
            scene = int(data["id"])
        except (KeyError, ValueError, TypeError):
            return

        with state_lock:
            scene_exists = 0 <= scene < len(routes.scenes)

            # Saved scenes can only be deleted by an admin
            if scene_exists and routes.scenes[scene].get("saved") and not admin_authorized(data, "scene_delete"):
                return

            if scene_exists:
                before = [(entry, entry["id"]) for entry in routes.scenes]
                routes.scenes.pop(scene)
                for entry in routes.scenes:  # Update ID of the following scenes
                    if entry["id"] > scene:
                        entry["id"] -= 1
                scene_stack[:] = remap_scene_stack(scene_stack, scene_id_changes(before, routes.scenes))

                # Remove from the database and update every other id (database ids start at 1)
                db.session.query(Scene).filter(Scene.id == scene + 1).delete()
                db.session.flush()
                for stored_scene in db.session.query(Scene).filter(Scene.id > scene + 1).order_by(Scene.id).all():
                    stored_scene.id -= 1
                    db.session.flush()  # One at a time in ascending order, the ids have to stay unique
                db.session.commit()

            # update scenes on MotorMix
            sync_driver(scene_mapping=True)

        socketio.emit("scene_reload", namespace="/socket")

    # Add a scene and tell every client to update
    @socketio.on("scene_add", namespace="/socket")
    def add_scene(data):
        scene = data["scene"]

        # Saving the scene to the database is admin-only
        if scene.get("saved") and not admin_authorized(data, "scene_add"):
            return

        with state_lock:
            scene["id"] = len(routes.scenes)

            # Filter devices with sliderValue 0
            filtered_devices = [
                device
                for device in routes.devices[1:]  # Skip master fader
                if device["attributes"]["channel"][0]["sliderValue"] > 0
            ]
            scene["channel"] = json.loads(json.dumps(filtered_devices))
            scene["status"] = True
            routes.scenes.append(scene)

            if not scene["saved"]:  # If scene is not saved, don't add to database
                sync_driver(scene_mapping=True)
                socketio.emit("scene_reload", namespace="/socket")
            else:
                store_scene(scene)

    # Save an existing scene to the database
    @socketio.on("scene_save", namespace="/socket")
    def save_scene(data):
        if not admin_authorized(data, "scene_save"):
            return
        store_scene(data)

    # Move the scene behind the other saved scenes and write it to the database
    def store_scene(data):
        scene = int(data["id"])

        with state_lock:
            if scene < len(routes.scenes):  # Make sure scene exists
                before = [(entry, entry["id"]) for entry in routes.scenes]
                sceneToSave = routes.scenes.pop(scene)
                lastSavedIndex = Scene.query.count()
                sceneToSave["saved"] = True
                for entry in routes.scenes:
                    if entry["id"] < scene and entry["id"] >= lastSavedIndex:
                        entry["id"] += 1
                sceneToSave["id"] = lastSavedIndex
                routes.scenes.insert(lastSavedIndex, sceneToSave)
                scene_stack[:] = remap_scene_stack(scene_stack, scene_id_changes(before, routes.scenes))

                # Store the scene as it was captured, not the current state of the devices
                new_scene = Scene(
                    name=sceneToSave["name"],
                    number=lastSavedIndex,
                    color="default",
                    channel=sceneToSave.get("channel", []),
                )
                db.session.add(new_scene)
                db.session.commit()

            # update scenes on MotorMix
            sync_driver(scene_mapping=True)

        socketio.emit("scene_reload", namespace="/socket")

    # Delete a light from the database
    @socketio.on("light_delete", namespace="/socket")
    def delete_light(data):
        if not admin_authorized(data, "light_delete"):
            return
        deviceId = int(data["id"])
        # Remove from the database
        deleted_count = Device.query.filter_by(id=deviceId).delete()
        db.session.commit()
        # Remove from the devices list and send update to all clients
        if deleted_count > 0:
            routes.devices = [
                device for device in routes.devices if device["id"] != deviceId
            ]
            update_master_exempt_channels()
            sync_driver()
            socketio.emit("light_deleted", {"id": deviceId}, namespace="/socket")

    # Create a new light and save it to the database
    @socketio.on("light_add", namespace="/socket")
    def add_light(data):
        if not admin_authorized(data, "light_add"):
            return
        # Check if device number is already in use
        if Device.query.filter_by(number=data["number"]).first():
            socketio.emit(
                "light_response", {"message": "number_in_use"}, namespace="/socket"
            )
            return

        # New device object
        device = Device(
            id=int(data["number"]),
            name=data["name"],
            number=data["number"],
            device_type=data["device_type"],
            universe=data["universe"],
            attributes=data["attributes"],
        )

        db.session.add(device)
        db.session.commit()

        # Set initial channel values
        channels = device.set_channel_values(
            device.attributes.get("channel", []), universe=device.universe
        )
        device.attributes["channel"] = channels

        # Add device to devices list to the right position based on the id
        insert_index = bisect.bisect_left(
            [device["id"] for device in routes.devices], int(data["number"])
        )
        routes.devices.insert(insert_index, device.to_dict())
        update_master_exempt_channels()

        socketio.emit("light_response", {"message": "success"}, namespace="/socket")

    # Update an existing light and save it to the database
    @socketio.on("light_update", namespace="/socket")
    def update_light(data):
        if not admin_authorized(data, "light_update"):
            return
        deviceId = int(data["id"])
        newNumber = int(data["number"])

        # Check if device exists
        device = Device.query.filter_by(number=deviceId).first()
        if not device:
            socketio.emit(
                "light_response", {"message": "device_not_found"}, namespace="/socket"
            )
            return

        # Check if new device number is already in use
        if deviceId != newNumber and Device.query.filter_by(number=newNumber).first():
            socketio.emit(
                "light_response", {"message": "number_in_use"}, namespace="/socket"
            )
            return

        # Update device in the database
        device.id = newNumber
        device.name = data["name"]
        device.number = newNumber
        device.device_type = data["device_type"]
        device.universe = data["universe"]
        device.attributes = data["attributes"]
        db.session.commit()

        routes.devices = [d for d in routes.devices if d["id"] != deviceId]
        insert_index = bisect.bisect_left([d["id"] for d in routes.devices], newNumber)
        routes.devices.insert(insert_index, device.to_dict())
        update_master_exempt_channels()
        sync_driver()

        socketio.emit("light_response", {"message": "success"}, namespace="/socket")

    @socketio.on("fader_value", namespace="/socket")
    def handle_fader_value(data):
        fader_value = int(data.get("value", 0))
        fader = int(data["deviceId"])
        channelId = int(data["channelId"])
        send_to_self = data.get("send", False)
        client_id = request.sid  # type: ignore

        device = find_device(fader)

        if device:
            channels = device["attributes"]["channel"]
            channel = get_channel(device, channelId)

            if channel:
                channel["sliderValue"] = fader_value

                if not data.get("from_scene", False):
                    channel["backupValue"] = fader_value

                send_dmx(fader, channelId, fader_value, device, channel)
                if driver is not None and channel["channel_type"] == "main":
                    driver.pushFader(fader, fader_value)

                if scene_stack and not fade_engine.is_active():
                    check_sync_status(fader, fader_value, channelId)

            # HMI lights have an extra on/off channel
            if device.get("device_type", "") == "HMI" and len(channels) > 1:
                if (
                    channelId == 0
                    and fader_value > 0
                    and channels[1]["sliderValue"] == 0
                ):
                    handle_fader_value(
                        {"deviceId": fader, "channelId": 1, "value": 255, "send": True}
                    )
                elif channelId == 1 and fader_value == 0:
                    handle_fader_value(
                        {"deviceId": fader, "channelId": 0, "value": 0, "send": True}
                    )

        # Faders of the DMX channel view without a device
        fader_to_universe = {692: 1, 693: 2}
        universe = fader_to_universe.get(fader)
        if universe is not None:
            send_dmx_direct(universe, fader_value, channelId)

        if connections > 1 or send_to_self:
            broadcast_value(
                fader, fader_value, channelId, client_id if not send_to_self else None
            )

    @socketio.on("bulk_fader_values", namespace="/socket")
    def handle_bulk_fader_values(data):
        for deviceData in data:
            fader = int(deviceData["deviceId"])

            for channelData in deviceData["channels"]:
                channelId = int(channelData["channelId"])
                fader_value = int(channelData["value"])

                # Call handle_fader_value for each channel of each device
                handle_fader_value(
                    {
                        "deviceId": fader,
                        "channelId": channelId,
                        "value": fader_value,
                    }
                )

    @socketio.on("turn_off", namespace="/socket")
    def turn_off(data=None):
        global turned_off
        if connections <= 1:
            logger.info("Turning off...")
            safe_ola_call("func", "everything_off")
            turned_off = True
            if driver is not None:
                driver.reset()

    @socketio.on("recover", namespace="/socket")
    def recover(data=None):
        global turned_off
        turned_off = False
        for device in routes.devices:
            for channel in device["attributes"]["channel"]:
                send_dmx(
                    device["id"], channel["id"], channel["sliderValue"], device, channel
                )
                if driver is not None and channel["channel_type"] == "main":
                    driver.pushFader(device["id"], channel["sliderValue"])

    # Reload devices and scenes from the database
    @socketio.on("reset", namespace="/socket")
    def reset_workspace(data=None):
        global turned_off, scenes_solo_state
        turned_off = False
        with state_lock:
            fade_engine.stop_all()
            scene_stack.clear()
            scenes_solo_state = False
            routes.devices = routes.get_devices()
            update_master_exempt_channels()
            for device in routes.devices:
                for channel in device["attributes"]["channel"]:
                    send_dmx(
                        device["id"], channel["id"], channel["sliderValue"], device, channel
                    )
                    if driver is not None and channel["channel_type"] == "main":
                        driver.pushFader(device["id"], channel["sliderValue"])
            routes.scenes = routes.load_scenes()
            sync_driver(scene_mapping=True)
        socketio.emit("scene_reload", namespace="/socket")
        socketio.emit("light_response", {"message": "success"}, namespace="/socket")

    @socketio.on("connect", namespace="/socket")
    def connect():
        global connections
        with state_lock:
            if turned_off and connections == 0:
                logger.info("Recovering...")
                socketio.emit("recover_dialog", namespace="/socket")
            connections += 1
            logger.info("Client connected (%d)", connections)

    @socketio.on("disconnect", namespace="/socket")
    def disconnect():
        global connections
        with state_lock:
            connections = max(connections - 1, 0)
            logger.info("Client disconnected (%d)", connections)

    # Created last: the MIDI input thread starts right away and calls the functions defined above
    try:
        driver = Driver()
        driver.set_callback(callback)
        driver.set_sceneQuickCallback(quickSceneCallback)
        driver.set_sceneCallback(sceneCallback)
        driver.set_blackoutCallback(blackoutCallback)
        driver.devices = routes.devices
        driver.scenes = routes.scenes
        driver.deviceMapping()
        driver.sceneMapping()
        driver.socketio = socketio
    except OSError as e:
        logger.warning("Possibly the MIDI interface is not connected. %s", e)
        driver = None
