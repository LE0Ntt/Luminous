from flask import render_template, redirect, flash, url_for, request, abort
from flask_login import login_user, logout_user, current_user
from werkzeug.utils import secure_filename
from flask import Flask, render_template
from flask_socketio import SocketIO
import json
from flask import jsonify
from server import app, db
from server.models import Device, Admin

'''
def create_sliders(num_sliders): # wird ersetzt durch db abfrage
    sliders = []

    master = {
        "id": 0,
        "sliderValue": 255,
        "name": "Master"
    }
    sliders.append(master)

    for i in range(num_sliders):
        slider = {
            "id": i + 1,
            "sliderValue": 0,
            "name": "Fader" + str(i + 1)
        }
        sliders.append(slider)
    return json.dumps(sliders)

sliders = create_sliders(16)
'''

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

def create_scenes(num_scenes): # wird ersetzt durch db abfrage
    scenes = []

    for i in range(num_scenes):
        scene = {
            "id": i,
            "statusOn": False,
            "name": "Scene" + str(i + 1)
        }
        scenes.append(scene)
    return scenes

scenes = create_scenes(6)



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
    # name = data['name']
    # number = data['number']
    # device_type = data['device_typ']
    # universe = data['universe']
    # attributes = data['attributes']
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

@app.route('/submit', methods=['POST']) # nur zum testen
def handle_form_submission():
    data = request.get_json()
    username = data['username']
    password = data['password']
    print(username, password)
    
    return {'message': 'Form submitted successfully'}


@app.route('/checkpassword', methods=['POST']) 
def check_password():
    data = request.get_json()
    password = data['password']
    admin = Admin.query.get(1)
    if admin.check_password(password):
        return {'match': 'true'}
    else:
        return {'match': 'false'}