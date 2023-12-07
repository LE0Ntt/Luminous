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


# Load devices from database
@app.route("/devices")
def get_devices():
    device_list = []

    master = {
        "id": 0,
        "name": "Master",
        "attributes": {
            "channel": [{"id": "0", "sliderValue": 255, "channel_type": "main"}]
        },
    }
    device_list.append(master)

    with app.app_context():
        devices = Device.query.all()
        for device in devices:
            channels = device.set_channel_values(
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


devices = get_devices()  # Global devices list


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


scenes = load_scenes()  # Global scenes list


# Access to devices list
@app.route("/fader")
def get_faders():
    global devices
    return jsonify(json.dumps(devices))


# Access to scenes list
@app.route("/scenes")
def get_scenes():
    global scenes
    return jsonify(json.dumps(scenes))


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
