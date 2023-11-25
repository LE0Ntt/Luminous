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
 * @file routes.py
"""
from flask import request, jsonify
import json
from server import app, db
from server.models import Device, Admin, Scene


# Initial values for channels
def set_channel_values(channels, universe):
    global ignored_channels
    universe = int(universe[1:])  # Stripping the 'U' and converting to int
    for channel in channels:
        if channel["channel_type"] in ["r", "g", "b", "bi"]:
            print(f"Appending {channel['dmx_channel']} to ignored_channels[{universe}]")
            ignored_channels[universe].append(int(channel["dmx_channel"]))
        if channel["channel_type"] in ["r", "g", "b"]:
            channel["sliderValue"] = 255
            channel["backupValue"] = 255
        elif channel["channel_type"] == "bi":
            channel["sliderValue"] = 128
            channel["backupValue"] = 128
        else:
            channel["sliderValue"] = 0
            channel["backupValue"] = 0
    return channels


ignored_channels = {1: [], 2: []}


# Load devices from database
@app.route("/devices")
def get_devices():
    device_list = []

    master = {
        "id": 0,
        "name": "Master",
        "attributes": {"channel": [{"id": "0", "sliderValue": 255}]},
    }
    device_list.append(master)

    with app.app_context():
        devices = Device.query.all()
        for device in devices:
            channels = set_channel_values(
                device.attributes.get("channel", []), universe=device.universe
            )
            device = {
                "id": device.id,
                "name": device.name,
                "device_type": device.device_type,
                "number": device.number,
                "universe": device.universe,
                "mute": False,
                "attributes": {"channel": channels},
            }
            device_list.append(device)
    return device_list


devices = get_devices()


# Load scenes from database
def load_scenes():
    scenes_list = []

    with app.app_context():
        scenes = Scene.query.all()
        for scene in scenes:
            scene = {
                "id": scene.id - 1,
                "statusOn": False,
                "name": scene.name,
                "channel": scene.channel,
                "saved": True,
            }
            scenes_list.append(scene)
    return scenes_list


scenes = load_scenes()


@app.route("/fader")
def get_faders():
    global devices
    return jsonify(json.dumps(devices))


@app.route("/scenes")
def get_scenes():
    global scenes
    return jsonify(json.dumps(scenes))


# Create a new light and save it to the database
@app.route("/addlight", methods=["POST"])
def add_light():
    data = request.get_json()
    # Check if device number is already in use
    if Device.query.filter_by(number=data["number"]).first():
        return {"message": "number_in_use"}
    device = Device(
        id=int(data["number"]),
        name=data["name"],
        number=data["number"],
        device_type=data["device_type"],
        universe=data["universe"],
        attributes=data["attributes"],
    )
    print(device)
    db.session.add(device)
    db.session.commit()

    channels = set_channel_values(
        device.attributes.get("channel", []), universe=device.universe
    )
    device_dict = {
        "id": int(device.number),
        "name": device.name,
        "number": device.number,
        "device_type": device.device_type,
        "universe": device.universe,
        "attributes": {"channel": channels},
    }

    # Add device to devices list to the right position based on the id
    global devices
    if devices and device_dict["id"] > devices[-1]["id"]:
        devices.append(device_dict)
    else:
        for i in range(len(devices)):
            if devices[i]["id"] > device_dict["id"]:
                devices.insert(i, device_dict)
                break

    return {"message": "success"}


# Updata an existing light and save it to the database
@app.route("/updatelight", methods=["POST"])
def update_light():
    data = request.get_json()
    deviceId = int(data["id"])  # Old device number/id
    newNumber = int(data["number"])  # New device number/id

    # Check if device exists
    device = Device.query.filter_by(number=deviceId).first()
    if not device:
        return {"message": "device_not_found"}, 404

    # Check if new device number is already in use
    if deviceId != newNumber and Device.query.filter_by(number=newNumber).first():
        return {"message": "number_in_use"}, 400

    # Update device in the database
    device.id = newNumber
    device.name = data["name"]
    device.number = newNumber
    device.device_type = data["device_type"]
    device.universe = data["universe"]
    device.attributes = data["attributes"]
    db.session.commit()

    channels = set_channel_values(
        device.attributes.get("channel", []), universe=device.universe
    )
    device_dict = {
        "id": int(device.number),
        "name": device.name,
        "number": device.number,
        "device_type": device.device_type,
        "universe": device.universe,
        "attributes": {"channel": channels},
    }
    print(device_dict)

    global devices
    if deviceId != newNumber:
        # Remove old device
        devices = [d for d in devices if d["id"] != deviceId]
        # Insert new device at the correct position
        insert_index = next(
            (i for i, d in enumerate(devices) if d["id"] > newNumber), len(devices)
        )
        devices.insert(insert_index, device_dict)
    else:
        # Update existing device
        for i, d in enumerate(devices):
            if d["id"] == newNumber:
                devices[i] = device_dict
                break

    return {"message": "success"}


# Delete a light from the database
@app.route("/removelight", methods=["POST"])
def remove_light():
    data = request.get_json()
    deviceId = int(data["id"])
    device = Device.query.get(deviceId)
    db.session.delete(device)
    db.session.commit()
    global devices
    updated_devices = []
    for device in devices:
        if device["id"] != deviceId:
            updated_devices.append(device)
    devices = updated_devices
    return {"message": "Form submitted successfully"}


# Change the admin password
@app.route("/changePassword", methods=["POST"])
def change_password():
    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    new_password_confirm = data.get("newPasswordConfirm")

    if new_password != new_password_confirm:
        return jsonify({"message": "no_match"})

    admin = Admin.query.first()

    # Create new Admin, if none exists
    if not admin:
        admin = Admin()
        admin.set_password(new_password)
        db.session.add(admin)
        db.session.commit()
        return jsonify({"message": "changed_successfully"})

    # Change password, if current password is correct
    if admin.check_password(current_password):
        admin.set_password(new_password)
        db.session.commit()
        return jsonify({"message": "changed_successfully"})
    else:
        return jsonify({"message": "currrent_wrong"})


# Check if the entered admin password is correct
@app.route("/checkpassword", methods=["POST"])
def check_password():
    data = request.get_json()
    password = data["password"]
    admin = Admin.query.first()
    if admin and admin.check_password(password):
        return {"match": "true"}
    else:
        return {"match": "false"}
