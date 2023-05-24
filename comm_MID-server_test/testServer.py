from flask import Flask, render_template
from flask_socketio import SocketIO
import time
from MOTORMIX_driver import Driver
#from engineio.payload import Payload
#Payload.max_decode_packets = 50

'''
Todo:
-send fader value to client again
    -active fader may not be updated again
-assign a midi to a web fader 
-fader start position (server or driver?)
    -every client-fader to 0, except master > 100, midi gets these values
'''

# Mutator method to get updates from driver
def callback(index, value):
    print("Eintrag", index, "wurde geändert:", value)
    socketio.emit('variable_update', {'variable': value}, namespace='/socket')
    
driver = Driver()
driver.set_callback(callback)
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins = "*")

@app.route('/')
def mein_endpunkt():
    return render_template('faderTest.html')

@app.route('/fader')
def home():
    return {"test": ["test1", "test2"]}

@socketio.on('fader_value', namespace='/test') #test für faderTest.js
def handle_fader_value(data):
    faderValue = int(data['value'])
    driver.pushFader(0, faderValue)
    
@socketio.on("slider_change", namespace='/socket') #test für react
def on_volume_change(data):
    #print(f"Slider {data['id']} volume changed to {data['volume']}%")
    faderValue = int(data['volume'])
    driver.pushFader(0, faderValue)
    # Sende geänderte Werte an alle verbundenen Clients
    socketio.emit('variable_update', {'variable': faderValue}, namespace='/socket') # update fader for other clients

@socketio.on('connect', namespace='/socket') 
def test_connect(): 
    print('Client connected')

@socketio.on('disconnect', namespace='/socket') 
def test_disconnect(): 
    print('Client disconnected')

if __name__ == '__main__': 
    socketio.run(app, host='192.168.178.24', port=5000)
