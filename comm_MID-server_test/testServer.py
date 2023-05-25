from flask import Flask, render_template
from flask_socketio import SocketIO
import time
import json
from flask import jsonify
from MOTORMIX_driver import Driver
from flask_cors import CORS
#from engineio.payload import Payload
#Payload.max_decode_packets = 50

'''
Todo:
-assign a midi to a web fader (server or driver?)
-fader start position (server or driver?)
    -every client-fader to 0, except master > 100, midi gets these values
-double aufruf von /fader ein problem?
'''

# Mutator method to get updates from driver
def callback(index, value):
    print("Eintrag", index, "wurde geändert:", value)
    socketio.emit('variable_update', {'id': index, 'value': value}, namespace='/socket')
    
driver = Driver()
driver.set_callback(callback)
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources = {r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins = "*")
connections = 0

def create_sliders(num_sliders):
    sliders = []
    for i in range(num_sliders):
        slider = {
            "id": i + 1,
            "sliderValue": 0,
            "name": "fader"
        }
        sliders.append(slider)
    return json.dumps(sliders)

@app.route('/')
def mein_endpunkt():
    return render_template('faderTest.html')

@app.route('/fader')
def get_faders():
    sliders = create_sliders(7)
    return jsonify(sliders)

@socketio.on('fader_value', namespace='/socket')
def handle_fader_value(data):
    faderValue = int(data['value'])
    fader = int(data['id'])
    driver.pushFader(fader, faderValue)
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
    socketio.run(app, host='192.168.178.24', port=5000)
