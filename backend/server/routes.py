from flask import render_template, redirect, flash, url_for, request, abort
from flask_login import login_user, logout_user, current_user
from werkzeug.utils import secure_filename
from flask import Flask, render_template
from flask_socketio import SocketIO
import json
from flask import jsonify
from server import app, db
from server.models import Device, Admin, Scene, Settings


# load devices from database
@app.route('/devices')
def get_devices():
    device_list = []

    master = {
        "id": 0,
        "name": "Master",
        "attributes": {
            "channel": [
                {
                    "id": "0",
                    "sliderValue": 255
                }
            ]
        }
    }
    device_list.append(master)

    with app.app_context():
        devices = Device.query.all()
        for device in devices:
            channels = device.attributes.get("channel", [])
            for channel in channels:
                channel["sliderValue"] = 0
                channel["backupValue"] = 0
            device = {
                "id": device.id,
                "name": device.name,
                "device_type": device.device_type,
                "number": device.number,
                "universe": device.universe,
                "mute": False,
                "attributes": {
                    "channel": channels
                }
            }
            device_list.append(device)
    return device_list


devices = get_devices()


# load scenes from database
def get_scenes():  # wird ersetzt durch db abfrage
    scenes_list = []

    with app.app_context():
        scenes = Scene.query.all()
        for scene in scenes:
            scene = {
                "id": scene.id - 1,
                "statusOn": False,
                "name": scene.name,
                "channel": scene.channel,
                "saved": True
            }
            scenes_list.append(scene)
    return scenes_list


scenes = get_scenes()


@app.route('/')
def mein_endpunkt():
    return render_template('faderTest.html')


@app.route('/fader')
def get_faders():
    global devices
    return jsonify(json.dumps(devices))


@app.route('/scenes')
def get_scenes():
    global scenes
    return jsonify(json.dumps(scenes))


@app.route('/addlight', methods=['POST'])
def add_light():
    data = request.get_json()
    # Check if device number is already in use
    if Device.query.filter_by(number=data['number']).first():
        return {'message': 'number_in_use'}
    device = Device(id=int(data['number']), name=data['name'], number=data['number'], device_type=data['device_type'],
                    universe=data['universe'], attributes=data['attributes'])
    print(device)
    db.session.add(device)
    db.session.commit()
    global devices

    channels = device.attributes.get("channel", [])
    for channel in channels:
        channel["sliderValue"] = 0
        channel["backupValue"] = 0
    device_dict = {
        "id": int(device.number),
        "name": device.name,
        "number": device.number,
        "device_type": device.device_type,
        "universe": device.universe,
        "attributes": {
            "channel": channels
        }
    }
    # Add device to devices list to the right position based on the id
    for i in range(len(devices)):
        if devices[i]['id'] > device_dict['id']:
            devices.insert(i, device_dict)
            break

    return {'message': 'success'}


@app.route('/updatelight', methods=['POST'])
def update_light():
    data = request.get_json()
    deviceId = int(data['id'])
    newNumber = int(data['number'])

    # Check if device exists
    device = Device.query.filter_by(number=deviceId).first()
    if not device:
        return {'message': 'device_not_found'}

    # Update device in the database
    device.id = newNumber
    device.name = data['name']
    device.number = newNumber
    device.device_type = data['device_type']
    device.universe = data['universe']
    device.attributes = data['attributes']
    db.session.commit()

    channels = device.attributes.get("channel", [])
    for channel in channels:
        channel["sliderValue"] = 0
        channel["backupValue"] = 0
    device_dict = {
        "id": int(device.number),
        "name": device.name,
        "number": device.number,
        "device_type": device.device_type,
        "universe": device.universe,
        "attributes": {
            "channel": channels
        }
    }
    print(device_dict)
    global devices
    for i in range(len(devices)):
        if deviceId != newNumber:
            if devices[i]['id'] == deviceId:
                devices.pop(i)
            if devices[i]['id'] > newNumber:
                devices.insert(i, device_dict)
                break
        elif devices[i]['id'] == newNumber:
            devices[i] = device_dict
            break
    return {'message': 'success'}


@app.route('/removelight', methods=['POST'])
def remove_light():
    data = request.get_json()
    deviceId = int(data['id'])
    device = Device.query.get(deviceId)
    db.session.delete(device)
    db.session.commit()
    global devices
    updated_devices = []
    for device in devices:
        if device['id'] != deviceId:
            updated_devices.append(device)
    devices = updated_devices
    return {'message': 'Form submitted successfully'}


@app.route("/changePassword", methods=["POST"])
def change_password():
    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    new_password_confirm = data.get("newPasswordConfirm")

    admin = Admin.query.first()

    if admin:
        if admin.check_password(current_password):
            if new_password == new_password_confirm:
                # Passwort in der Datenbank aktualisieren
                admin.set_password(new_password)
                return jsonify({"message": "Password changed successfully"})
            else:
                return jsonify({"message": "New passwords do not match"})
        else:
            return jsonify({"message": "Current password is incorrect"})
    else:
        if new_password == new_password_confirm:
            new_admin = Admin()
            new_admin.set_password(new_password)
            db.session.add(new_admin)
            db.session.commit()
            return jsonify({"message": "Admin created successfully"})
        else:
            return jsonify({"message": "New passwords do not match"})


@app.route('/checkpassword', methods=['POST'])
def check_password():
    data = request.get_json()
    password = data['password']
    admin = Admin.query.first()
    if admin and admin.check_password(password):
        return {'match': 'true'}
    else:
        return {'match': 'false'}
