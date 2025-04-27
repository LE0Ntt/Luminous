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
    global scene_stack, fading_active, scenes_solo_state, device_original_values

    # Mutator method to get updates from driver
    def faderSend(index, value, channelId, sender_id=None):
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

        if scene_stack:
            print("Checking sync status")
            threading.Thread(
                target=check_sync_status, args=(index, value, channelId)
            ).start()

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
                update_scene({"id": scene, "status": value > 0})
                break

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

    fade_threads = {}  # Dictionary to keep track of fade threads
    scene_stack = []  # Stack to keep track of the order of active scenes
    fading_active = False  # To prevent check if scene is out of sync while fading

    # Gradually changes the value of a device channel from start_value to end_value
    def fade_device(
        device, channel, start_value, end_value, steps, interval, device_channel
    ):
        device_id = device["id"]
        channel_id = channel["id"]
        change_per_step = (end_value - start_value) / steps
        start_time = time.time()
        global fading_active
        fading_active = True  # Set flag to prevent checking

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

        fading_active = False  # Reset flag after fading is done

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

    # Remove scene from the stack by scene_id
    def remove_scene_from_stack(scene_id):
        scene_stack[:] = [
            scene for scene in scene_stack if scene["scene_id"] != scene_id
        ]

    device_original_values = {}  # To store the pre-scene state of each device

    # Update status (on/off) of a scene
    @socketio.on("scene_update", namespace="/socket")
    def update_scene(data):
        global scene_stack, scenes_solo_state
        try:
            scene_id = int(data["id"])
            status = bool(data["status"])
            solo = bool(data.get("solo", False))
            fade_time = int(data.get("fadeTime", 0))
        except (KeyError, ValueError, TypeError):
            return

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

        interval = 0.02
        steps = max(int(fade_time / interval), 1)
        scene_device_ids = {device["id"] for device in scene_data.get("channel", [])}

        if status:  # Scene is being activated
            existing_scene = next(
                (s for s in scene_stack if s["scene_id"] == scene_id), None
            )
            if existing_scene:
                scene_stack.remove(existing_scene)

            scene_entry = {"scene_id": scene_id, "devices": {}, "out_of_sync": False}

            # Store original device states for this scene
            if "channel" in scene_data:
                for device in scene_data["channel"]:
                    device_id = device["id"]

                    if device_id not in device_original_values:
                        actual_device = next(
                            (d for d in routes.devices if d["id"] == device_id), None
                        )
                        if actual_device:
                            device_original_values[device_id] = {
                                "sliderValue": actual_device["attributes"]["channel"][
                                    0
                                ]["sliderValue"]
                            }

                    scene_entry["devices"][device_id] = {
                        "channels": [
                            ch.copy() for ch in device["attributes"]["channel"]
                        ],
                        "original_state": True,
                    }

            scene_stack.append(scene_entry)

        else:  # Scene is being deactivated
            remove_scene_from_stack(scene_id)

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

        if status:  # Scene activated
            for device in scene_data.get("channel", []):
                device_id = device["id"]
                actual_device = next(
                    (d for d in routes.devices if d["id"] == device_id), None
                )
                if actual_device:
                    master_channel = actual_device["attributes"]["channel"][0]
                    if len([s for s in scene_stack if device_id in s["devices"]]) <= 1:
                        master_channel["backupValue"] = master_channel["sliderValue"]

                    scene_device_slider_value = device["attributes"]["channel"][0][
                        "sliderValue"
                    ]

                    start_value = master_channel["sliderValue"]
                    end_value = scene_device_slider_value

                    if start_value != end_value:
                        start_fade_thread(
                            actual_device,
                            master_channel,
                            start_value,
                            end_value,
                            steps,
                            interval,
                            master_channel,
                        )
                    else:
                        master_channel["sliderValue"] = end_value
                        faderSend(device_id, end_value, master_channel["id"])
        else:  # Scene deactivated
            devices_in_scene = set()
            for device in scene_data.get("channel", []):
                devices_in_scene.add(device["id"])

            remove_scene_from_stack(scene_id)
            device_states = {}  # Track highest priority state for each device

            # Build device states from remaining active scenes
            for active_scene in scene_stack:
                active_scene_id = active_scene["scene_id"]
                active_scene_data = None

                for scene in routes.scenes:
                    if scene["id"] == active_scene_id:
                        active_scene_data = scene
                        break

                if active_scene_data and active_scene_data.get("status", False):
                    for device in active_scene_data.get("channel", []):
                        device_id = device["id"]
                        scene_slider_value = device["attributes"]["channel"][0][
                            "sliderValue"
                        ]
                        device_states[device_id] = {
                            "value": scene_slider_value,
                            "channel_id": 0, 
                        }

            for device_id in devices_in_scene:
                actual_device = next(
                    (d for d in routes.devices if d["id"] == device_id), None
                )
                if not actual_device:
                    continue

                master_channel = actual_device["attributes"]["channel"][0]
                start_value = master_channel["sliderValue"]

                if device_id in device_states:
                    end_value = device_states[device_id]["value"]
                else:
                    end_value = master_channel.get("backupValue", 0)

                if start_value != end_value:
                    start_fade_thread(
                        actual_device,
                        master_channel,
                        start_value,
                        end_value,
                        steps,
                        interval,
                        master_channel,
                    )
                else:
                    master_channel["sliderValue"] = end_value
                    faderSend(device_id, end_value, master_channel["id"])

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
        if fading_active or not scene_stack:
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
                    print(f"Scene {scene['id']} is out of sync")
                else:
                    socketio.emit("in_sync", {"scene_id": scene["id"]}, namespace="/socket")
                    print(f"Scene {scene['id']} is back in sync")


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

    @socketio.on("fader_value", namespace="/socket")
    def handle_fader_value(data):
        fader_value = int(data.get("value", 0))
        fader = int(data["deviceId"])
        channelId = int(data["channelId"])
        send_to_self = data.get("send", False)
        client_id = request.sid  # type: ignore

        device = routes.devices[fader] if fader < len(routes.devices) else None

        if device:
            channels = device["attributes"]["channel"]
            channel = channels[channelId]

            if channel:
                channel["sliderValue"] = fader_value

                if not data.get("from_scene", False):
                    channel["backupValue"] = fader_value

                    if channelId == 0:
                        device_id = device["id"]
                        if device_id not in device_original_values:
                            device_original_values[device_id] = {}
                        device_original_values[device_id]["sliderValue"] = fader_value

                send_dmx(fader, channelId, fader_value, device, channel)
                if driver is not None and channel["channel_type"] == "main":
                    driver.pushFader(fader, fader_value)
                    driver.devices = routes.devices

                if scene_stack and not fading_active:
                    threading.Thread(
                        target=check_sync_status, args=(fader, fader_value, channelId)
                    ).start()

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
