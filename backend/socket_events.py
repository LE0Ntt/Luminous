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
import json
import time
import threading
import bisect

scenes_solo_state = False
connections = 0
last_send_time = 0
reset = False

try:
    from ola_handler import ola_handler  # ola

    ola = ola_handler()  # ola
    ola.setup()  # ola
except ModuleNotFoundError:
    print("OLA module not found. Running without OLA support.")
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
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


def send_dmx(
    fader: int, channelId: int, fader_value: int, device: dict, channel: dict
) -> None:
    if fader == 0 and channelId == 0:
        safe_ola_call("func", "master_fader", fader_value)  # ola
    else:
        try:
            dmx_channel = int(channel["dmx_channel"])
            universe = int(device["universe"][1:])
            safe_ola_call(
                "func", "send_dmx", universe, dmx_channel - 1, fader_value
            )  # ola
            # print(f"dmx {dmx_channel}, value {fader_value}, universe {universe}")
        except KeyError:
            print("No dmx_channel key for non-master channel")


def send_dmx_direct(universe: int, value: int, channel: int) -> None:
    safe_ola_call("func", "send_dmx", universe, channel - 1, value)  # ola
    return


def register_socketio_events(socketio):
    # Mutator method to get updates from driver
    def faderSend(index, value, channelId, sender_id=None):
        global last_send_time
        global last_change

        if sender_id:
            socketio.emit(
                "variable_update",
                {"deviceId": index, "value": value, "channelId": channelId},
                namespace="/socket",
                skip_sid=sender_id,
            )
        else:
            socketio.emit(
                "variable_update",
                {"deviceId": index, "value": value, "channelId": channelId},
                namespace="/socket",
            )

        send_dmx(
            index,
            channelId,
            value,
            routes.devices[index],
            routes.devices[index]["attributes"]["channel"][channelId],
        )

    def callback(index, value):
        faderSend(index, value, 0)  # invokes the corresponding socket event

        # sets the updated value in the device list
        for i, device in enumerate(routes.devices):
            if device["id"] == index:
                index = i
                routes.devices[index]["attributes"]["channel"][0]["sliderValue"] = value
                routes.devices[index]["attributes"]["channel"][0]["backupValue"] = value

    def quickSceneCallback(scene, status):
        update_scene({"id": scene, "status": status})
        if status:
            sceneCallback(scene, 255)
        else:
            sceneCallback(scene, 0)

    def sceneCallback(scene, value):
        for currentScene in routes.scenes:
            if currentScene["id"] == scene:
                if value > 0:
                    update_scene({"id": scene, "status": True})
                else:
                    update_scene({"id": scene, "status": False})
                for device in currentScene["channel"]:
                    device_id = device["id"]
                    master_channel = device["attributes"]["channel"][0]

                    master_channel["backupValue"] = master_channel["sliderValue"]
                    if master_channel["backupValue"] <= 5:
                        master_channel["backupValue"] = 0

                    if value > 0:
                        master_channel["sliderValue"] = value
                        faderSend(device_id, value, master_channel["id"])

                    else:
                        master_channel["sliderValue"] = master_channel["backupValue"]
                        faderSend(
                            device_id,
                            device["attributes"]["channel"][0]["backupValue"],
                            master_channel["id"],
                        )

    def blackoutCallback():
        # call reset function
        reset(True)

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
        print("Possibly the MIDI interface is not connected.", str(e))
        driver = None

    # send every channel of each device to ola on startup
    for device in routes.devices:
        for channel in device["attributes"]["channel"]:
            send_dmx(
                device["id"], channel["id"], channel["sliderValue"], device, channel
            )

    # Solo for control (LightFX) selection
    @socketio.on("controlSolo", namespace="/socket")
    def controlSolo(data):
        solo = bool(data["solo"])
        selected_ids = {dev["id"] for dev in data["devices"]}

        def update_device(device, slider_value):
            faderSend(device["id"], slider_value, 0)
            send_dmx(
                device["id"],
                0,
                slider_value,
                device,
                device["attributes"]["channel"][0],
            )
            if driver is not None:
                driver.pushFader(device["id"], slider_value)
                driver.devices = routes.devices

        for device in routes.devices:
            device_id = device["id"]
            if device_id == 0:
                continue

            channel_attrs = device["attributes"]["channel"][0]
            slider_value = channel_attrs["sliderValue"]
            backup_value = channel_attrs.get("backupValue", 0)

            if solo and device_id not in selected_ids and slider_value > 0:
                channel_attrs["sliderValue"] = 0
                update_device(device, 0)
            elif not solo and slider_value == 0:
                if 0 <= device_id < len(routes.devices):
                    channel_attrs["sliderValue"] = backup_value
                    update_device(device, backup_value)
                else:
                    print(f"Unknown device_id: {device_id}")

    # ------------------- Begin of Scene status (on/off) -------------------

    fade_threads = {}

    # Gradually changes the value of a device channel from start_value to end_value
    def fade_device(
        device, channel, start_value, end_value, steps, interval, device_channel
    ):
        device_id = device["id"]
        channel_id = channel["id"]
        change_per_step = (end_value - start_value) / steps
        start_time = time.time()

        for step in range(1, steps + 1):
            thread_info = fade_threads.get((device_id, channel_id))
            if thread_info and thread_info.get("stop"):
                break

            current_value = int(start_value + (change_per_step * step))
            device_channel["sliderValue"] = current_value
            faderSend(device_id, current_value, channel_id)
            send_dmx(device_id, channel_id, current_value, device, channel)

            if driver and getattr(driver, "light_mode", False):
                driver.pushFader(device_id, current_value)
                driver.devices = routes.devices

            elapsed_time = time.time() - start_time
            expected_time = step * interval
            sleep_time = expected_time - elapsed_time
            if sleep_time > 0:
                time.sleep(sleep_time)

        # Set the final value if the fade was not stopped
        if not (fade_threads.get((device_id, channel_id), {}).get("stop")):
            device_channel["sliderValue"] = end_value
            faderSend(device_id, end_value, channel_id)
            send_dmx(device_id, channel_id, end_value, device, channel)
            if driver and getattr(driver, "light_mode", False):
                driver.pushFader(device_id, end_value)
                driver.devices = routes.devices

    # Stops the fade thread for the specified device and channel
    def stop_fade_thread(device_id, channel_id):
        thread_key = (device_id, channel_id)
        thread_info = fade_threads.get(thread_key)
        if thread_info:
            thread_info["stop"] = True
            thread = thread_info.get("thread")
            if thread and thread.is_alive():
                thread.join()
            del fade_threads[thread_key]

    # Starts a new fade thread for the specified device and channel and stops any existing fade thread for the same device and channel before starting
    def start_fade_thread(
        device, channel, start_value, end_value, steps, interval, device_channel
    ):
        fade_thread_key = (device["id"], channel["id"])
        stop_fade_thread(*fade_thread_key)

        thread = threading.Thread(
            target=fade_device,
            args=(
                device,
                channel,
                start_value,
                end_value,
                steps,
                interval,
                device_channel,
            ),
            daemon=True,  # Ensure threads exit when the main program does
        )
        fade_threads[fade_thread_key] = {"thread": thread, "stop": False}
        thread.start()

    # Turns off all scenes except the current one
    def turn_off_other_scenes(current_scene_id):
        for scene in routes.scenes:
            if scene["id"] != current_scene_id and scene.get("status", False):
                scene["status"] = False
                socketio.emit(
                    "scene_update",
                    {"id": scene["id"], "status": False},
                    namespace="/socket",
                )

    # Updates devices based on the solo mode
    def update_devices(solo_active, scene_device_ids, steps, interval):
        for device in routes.devices:
            device_id = device["id"]
            if device_id not in scene_device_ids and device_id != 0:
                master_channel = device["attributes"]["channel"][0]
                start_value = master_channel["sliderValue"]
                end_value = 0 if solo_active else master_channel.get("backupValue", 0)

                if start_value != end_value:
                    device_channel = master_channel
                    start_fade_thread(
                        device,
                        master_channel,
                        start_value,
                        end_value,
                        steps,
                        interval,
                        device_channel,
                    )

    # Update status (on/off) of a scene
    @socketio.on("scene_update", namespace="/socket")
    def update_scene(data):
        global scenes_solo_state

        try:
            status = bool(data["status"])
            scene_id = int(data["id"])
            solo = bool(data.get("solo", False))
            fade_time = int(data.get("fadeTime", 0))
        except (KeyError, ValueError, TypeError):
            return

        interval = 0.02
        steps = max(int(fade_time / interval), 1)

        if scene_id >= len(routes.scenes):
            return

        scene = routes.scenes[scene_id]
        scene_device_ids = {device["id"] for device in scene["channel"]}

        if solo and status:
            scenes_solo_state = True
            turn_off_other_scenes(scene_id)
            update_devices(
                solo_active=True,
                scene_device_ids=scene_device_ids,
                steps=steps,
                interval=interval,
            )
        elif (scenes_solo_state and not solo) or (not status and solo):
            scenes_solo_state = False
            update_devices(
                solo_active=False,
                scene_device_ids=scene_device_ids,
                steps=steps,
                interval=interval,
            )

        if driver and scene_id is not None:
            driver.quickSceneButtonUpdate(scene_id, status)

        scene["status"] = status
        for device in scene["channel"]:
            device_obj = next(
                (d for d in routes.devices if d["id"] == device["id"]), None
            )
            if not device_obj:
                continue

            for channel in device["attributes"]["channel"]:
                # Skip turning off the power channel for HMI devices
                if (
                    not status
                    and device_obj.get("device_type") == "HMI"
                    and channel.get("channel_type") == "power"
                ):
                    continue

                device_channel = device_obj["attributes"]["channel"][channel["id"]]

                start_value = device_channel["sliderValue"]
                end_value = (
                    channel["sliderValue"]
                    if status
                    else device_channel.get("backupValue", 0)
                )

                if start_value != end_value:
                    start_fade_thread(
                        device_obj,
                        channel,
                        start_value,
                        end_value,
                        steps,
                        interval,
                        device_channel,
                    )

        if connections > 0:
            socketio.emit(
                "scene_update", {"id": scene_id, "status": status}, namespace="/socket"
            )

    # ------------------- End of Scene status (on/off) -------------------

    # Delete a scene and tell every client to update
    @socketio.on("scene_delete", namespace="/socket")
    def delete_scene(data):
        scene = int(data["id"])

        # update scenes on MotorMix
        if driver is not None:
            driver.scenes = routes.scenes
            driver.sceneMapping()

        if scene < len(routes.scenes):  # Make sure scene exists
            routes.scenes.pop(scene)
            for entry in routes.scenes:  # Update ID of the following scenes
                if entry["id"] > scene:
                    entry["id"] -= 1
            # Remove from the database and update every other id
            db.session.query(Scene).filter(Scene.id == scene + 1).delete()
            scenes_to_update = (
                db.session.query(Scene).filter(Scene.id > scene + 1).all()
            )
            for scene in scenes_to_update:
                scene.id -= 1
            db.session.commit()
        socketio.emit("scene_reload", namespace="/socket")

    # Add a scene and tell every client to update
    @socketio.on("scene_add", namespace="/socket")
    def add_scene(data):
        scene = data["scene"]
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
            socketio.emit("scene_reload", namespace="/socket")
        else:
            save_scene(scene)

    # Save a scene to the database
    @socketio.on("scene_save", namespace="/socket")
    def save_scene(data):
        scene = int(data["id"])

        # update scenes on MotorMix
        if driver is not None:
            driver.scenes = routes.scenes
            driver.sceneMapping()

        if scene < len(routes.scenes):  # Make sure scene exists
            sceneToSave = routes.scenes.pop(scene)
            lastSavedIndex = Scene.query.count()
            sceneToSave["saved"] = True
            for entry in routes.scenes:
                if entry["id"] < scene and entry["id"] >= lastSavedIndex:
                    entry["id"] += 1
            sceneToSave["id"] = lastSavedIndex
            routes.scenes.insert(lastSavedIndex, sceneToSave)

            try:
                if "channel" in data:
                    filtered_devices = data["channel"]
                else:
                    filtered_devices = [
                        # Skip master fader
                        device
                        for device in routes.devices[1:]
                        if device["attributes"]["channel"][0]["sliderValue"] > 0
                    ]
                    data["name"] = routes.scenes[scene]["name"]
            except KeyError:
                print("No channel key for scene")
            # Add scene to the database
            filtered_devices = [
                device
                for device in routes.devices[1:]  # Skip master fader
                if device["attributes"]["channel"][0]["sliderValue"] > 0
            ]
            new_scene = Scene(
                name=data["name"],
                number=scene,
                color="default",
                channel=filtered_devices,
            )
            db.session.add(new_scene)
            db.session.commit()
        socketio.emit("scene_reload", namespace="/socket")

    # Delete a light from the database
    @socketio.on("light_delete", namespace="/socket")
    def delete_light(data):
        deviceId = int(data["id"])
        # Remove from the database
        deleted_count = Device.query.filter_by(id=deviceId).delete()
        db.session.commit()
        # Remove from the devices list and send update to all clients
        if deleted_count > 0:
            routes.devices = [
                device for device in routes.devices if device["id"] != deviceId
            ]
            socketio.emit("light_deleted", {"id": deviceId}, namespace="/socket")

    # Create a new light and save it to the database
    @socketio.on("light_add", namespace="/socket")
    def add_light(data):
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

        # Add device to devices list to the right position based on the id
        insert_index = bisect.bisect_left(
            [device["id"] for device in routes.devices], int(data["number"])
        )
        routes.devices.insert(insert_index, device.to_dict())

        socketio.emit("light_response", {"message": "success"}, namespace="/socket")

    # Update an existing light and save it to the database
    @socketio.on("light_update", namespace="/socket")
    def update_light(data):
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

        socketio.emit("light_response", {"message": "success"}, namespace="/socket")

    # Fader value update
    @socketio.on("fader_value", namespace="/socket")
    def handle_fader_value(data):
        fader_value = int(data.get("value", 0))
        fader = int(data["deviceId"])
        channelId = int(data["channelId"])
        send_to_self = data.get("send", False)
        client_id = request.sid  # type: ignore # Get the sending client's ID

        device = next((d for d in routes.devices if d["id"] == fader), None)

        if device:
            channels = device["attributes"]["channel"]
            channel = next((c for c in channels if int(c["id"]) == channelId), None)
            if channel:
                channel["sliderValue"] = channel["backupValue"] = fader_value
                send_dmx(fader, channelId, fader_value, device, channel)
                if driver is not None and channel["channel_type"] == "main":
                    driver.pushFader(fader, fader_value)
                    driver.devices = routes.devices

            if device.get("device_type", "") == "HMI":
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

        fader_to_universe = {692: 1, 693: 2}
        universe = fader_to_universe.get(fader)
        if universe is not None:
            send_dmx_direct(universe, fader_value, channelId)

        if connections > 1 or send_to_self:
            faderSend(
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
    def turn_off(data):
        global connections
        if connections <= 1:
            print("Turning off...")
            safe_ola_call("func", "everything_off")
            global reset
            reset = True
            if driver is not None:
                driver.reset()

    @socketio.on("recover", namespace="/socket")
    def recover(data):
        global reset
        reset = False
        for device in routes.devices:
            for channel in device["attributes"]["channel"]:
                send_dmx(
                    device["id"], channel["id"], channel["sliderValue"], device, channel
                )
                if driver is not None and channel["channel_type"] == "main":
                    driver.pushFader(device["id"], channel["sliderValue"])
                    driver.devices = routes.devices

    @socketio.on("reset", namespace="/socket")
    def reset(data):
        global reset
        reset = False
        routes.devices = routes.get_devices()
        for device in routes.devices:
            for channel in device["attributes"]["channel"]:
                send_dmx(
                    device["id"], channel["id"], channel["sliderValue"], device, channel
                )
                if driver is not None and channel["channel_type"] == "main":
                    driver.pushFader(device["id"], channel["sliderValue"])
                    driver.devices = routes.devices
        routes.scenes = routes.load_scenes()
        socketio.emit("scene_reload", namespace="/socket")
        socketio.emit("light_response", {"message": "success"}, namespace="/socket")

    @socketio.on("connect", namespace="/socket")
    def connect():
        global connections
        global reset
        if reset and connections == 0:
            print("Recovering...")
            socketio.emit("recover_dialog", namespace="/socket")
        connections += 1
        print("Client connected", connections)

    @socketio.on("disconnect", namespace="/socket")
    def disconnect():
        global connections
        connections = max(connections - 1, 0)
        print("Client disconnected")
