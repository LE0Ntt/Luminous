from flask import render_template, redirect, flash, url_for, request, abort
from flask_login import login_user, logout_user, current_user
from werkzeug.utils import secure_filename
from flask import Flask, render_template
from flask_socketio import SocketIO
import json
from flask import jsonify
from server import app, db
#from server.models import User

def create_sliders(num_sliders): # wird nachher ersetzt durch db abfrage
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

def create_scenes(num_scenes): # wird nachher ersetzt durch db abfrage
    scenes = []

    for i in range(num_scenes):
        scene = {
            "id": i,
            "statusOn": False,
            "name": "Scene" + str(i + 1)
        }
        scenes.append(scene)
    return json.dumps(scenes)

scenes = create_scenes(6)



@app.route('/')
def mein_endpunkt():
    return render_template('faderTest.html')

@app.route('/fader')
def get_faders():
    global sliders
    return jsonify(sliders)

@app.route('/scenes')
def get_scenes():
    global scenes
    return jsonify(scenes)



@app.route('/submit', methods=['POST'])
def handle_form_submission():
    data = request.get_json()
    username = data['username']
    password = data['password']
    print(username, password)
    
    return {'message': 'Form submitted successfully'}