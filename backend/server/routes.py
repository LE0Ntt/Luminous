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
def get_devices():
    device_list = []
    
    master = {
        "id": 0,
        "sliderValue": 255,
        "name": "Master"
    }
    device_list.append(master)
    
    with app.app_context():
        devices = Device.query.all()
        for device in devices:
            device = {
                "id": device.id,
                "sliderValue": 0,
                "name": device.name,
                "deviceType": device.device_type,
                "universe": device.universe,
                "attributes": device.attributes
            }
            device_list.append(device)  
    return device_list

devices = get_devices()


# load scenes from database
def get_scenes(): # wird ersetzt durch db abfrage
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
    device = Device(name = data['name'], number = data['number'], device_type = data['device_type'], universe = data['universe'], attributes = data['attributes'])
    print(device)
    db.session.add(device)
    db.session.commit()
    global devices
    device_dict = {
        "id": device.id,
        "name": device.name,
        "sliderValue": 0,
        "deviceType": device.device_type,
        "universe": device.universe,
        "attributes": device.attributes
    }
    devices.append(device_dict)
    return {'message': 'Form submitted successfully'}


@app.route("/changePassword", methods=["POST"])
def change_password():
    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    new_password_confirm = data.get("newPasswordConfirm")

    admin = Admin.query.first()

    if admin:
        if check_password_hash(admin.password_hash, current_password):
            if new_password == new_password_confirm:
                admin.set_password(new_password)
                db.session.commit()
                return jsonify({"message": "Password changed successfully"})
            else:
                return jsonify({"message": "New passwords do not match"})
        else:
            return jsonify({"message": "Incorrect current password"})
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
    admin = Admin.query.get(1)
    if admin.check_password(password):
        return {'match': 'true'}
    else:
        return {'match': 'false'}