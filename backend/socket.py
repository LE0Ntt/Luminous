from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
import json
from server import driver, app, socketio, routes
from server.motorMix_driver import Driver

#socketio = SocketIO(app, cors_allowed_origins = "*")

connections = 0 

# Mutator method to get updates from driver
def callback(index, value):
    print("Eintrag", index, "wurde geändert:", value)
    socketio.emit('variable_update', {'id': index, 'value': value}, namespace='/socket')
    sliders = routes.sliders
    sliders = json.loads(sliders)
    sliders[index]["sliderValue"] = value
    routes.sliders = json.dumps(sliders)

try:
    driver = Driver()
    driver.set_callback(callback)
except OSError as e:
    print("Fehler beim Initialisieren des Drivers:", str(e))
    driver = None

@socketio.on('scene_update', namespace='/socket')
def handle_scene(data):
    status = bool(data['status'])
    scene = int(data['id'])
    print(scene, status)
    scenes = routes.scenes
    scenes = json.loads(scenes)
    if scene < len(scenes): # Make sure scene exists
        scenes[scene]["status"] = status
    routes.scenes = json.dumps(scenes)
    # Sende geänderte Werte an alle verbundenen Clients
    global connections
    if connections > 0:
        socketio.emit('scene_update', {'id': scene, 'status': status}, namespace='/socket')

@socketio.on('fader_value', namespace='/socket')
def handle_fader_value(data):
    faderValue = int(data['value'])
    fader = int(data['id'])
    print(fader, faderValue)
    sliders = routes.sliders
    sliders = json.loads(sliders)
    if fader < len(sliders):
        sliders[fader]["sliderValue"] = faderValue
    routes.sliders = json.dumps(sliders)
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
