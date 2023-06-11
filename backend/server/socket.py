from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
import json
from server import driver, app, socketio

#socketio = SocketIO(app, cors_allowed_origins = "*")

connections = 0 

@socketio.on('scene_update', namespace='/socket')
def handle_scene(data):
    status = bool(data['status'])
    scene = int(data['id'])
    print(scene, status)
    global scenes
    scenes = json.loads(scenes)
    if scene < len(scenes): # Make sure scene exists
        scenes[scene]["status"] = status
    scenes = json.dumps(scenes)
    # Sende geänderte Werte an alle verbundenen Clients
    global connections
    if connections > 0:
        socketio.emit('scene_update', {'id': scene, 'status': status}, namespace='/socket')

@socketio.on('fader_value', namespace='/socket')
def handle_fader_value(data):
    faderValue = int(data['value'])
    fader = int(data['id'])
    print(fader, faderValue)
    global sliders
    sliders = json.loads(sliders)
    if fader < len(sliders):
        sliders[fader]["sliderValue"] = faderValue
    sliders = json.dumps(sliders)
    driver.pushFader(fader, faderValue) if driver is not None else None
    # Sende geänderte Werte an alle verbundenen Clients
    global connections
    if connections > 1:
        socketio.emit('variable_update', {'id': fader, 'value': faderValue}, namespace='/socket')

@socketio.on('connect', namespace='/socket') 
def test_connect(): 
    global connections
    connections += 1
    print('Client connected', connections)

@socketio.on('disconnect', namespace='/socket') 
def test_disconnect(): 
    global connections
    connections = max(connections - 1, 0)
    print('Client disconnected')