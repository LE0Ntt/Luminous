from flask import Flask, render_template
from flask_socketio import SocketIO
import time
import json
from flask import jsonify
from MOTORMIX_driver import Driver
from flask_cors import CORS
#from engineio.payload import Payload
#Payload.max_decode_packets = 25

# Mutator method to get updates from driver
def callback(index, value):
    print("Eintrag", index, "wurde geändert:", value)
    socketio.emit('variable_update', {'id': index, 'value': value}, namespace='/socket')
    global sliders
    sliders = json.loads(sliders)
    sliders[index]["sliderValue"] = value
    sliders = json.dumps(sliders)
    
try:
    driver = Driver()
    driver.set_callback(callback)
except OSError as e:
    print("Fehler beim Initialisieren des Drivers:", str(e))
    driver = None
    
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources = {r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins = "*")

connections = 0 

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

@socketio.on('scene_update', namespace='/socket')
def handle_scene(data):
    print(int(data['id']), str(data['status']))
    # Sende geänderte Werte an alle verbundenen Clients
    #global connections
    #if connections > 1:
        #socketio.emit('scene_update', {'id': fader, 'value': faderValue}, namespace='/socket') # falsch

@socketio.on('fader_value', namespace='/socket')
def handle_fader_value(data):
    faderValue = int(data['value'])
    fader = int(data['id'])
    print(fader, faderValue)
    global sliders
    sliders = json.loads(sliders)
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

if __name__ == '__main__': 
    socketio.run(app) #, host='192.168.178.24', port=5000)
