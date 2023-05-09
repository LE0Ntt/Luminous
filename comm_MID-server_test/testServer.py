from flask import Flask, render_template
from flask_socketio import SocketIO
#from flask_cors import CORS
import threading
import time
from MOTORMIX_driver import Driver

driver = Driver()
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
#CORS(app, resources = {r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins = "*")

@app.route('/')
def mein_endpunkt():
    return render_template('faderTest.html')

@app.route('/members')
def home():
    return {"test": ["test1", "test2"]}

@socketio.on('fader_value', namespace='/test') #test für faderTest.js
def handle_fader_value(data):
    faderValue = int(data['value'])
    #print(faderValue)
    driver.pushFader(0, faderValue)
    socketio.emit('variable_update', {'variable': faderValue}, namespace='/test') # update fader for other clients

@socketio.on("slider_change", namespace='/test') #test für react
def on_volume_change(data):
    #print(f"Slider {data['id']} volume changed to {data['volume']}%")
    faderValue = int(data['volume'])
    driver.pushFader(0, faderValue)
    # Sende geänderte Werte an alle verbundenen Clients
    #socketio.emit("volume_change", data)

@socketio.on('connect', namespace='/test') 
def test_connect(): 
    print('Client connected')

@socketio.on('disconnect', namespace='/test') 
def test_connect(): 
    print('Client disconnected')

def send_variable():
    old_variable = None
    while True: 
        variable = driver.fader_values[0]
        if variable != old_variable:
            print("nu")
            socketio.emit('variable_update', {'variable': variable}, namespace='/test')
            old_variable = variable
        time.sleep(0.01) #je niedriger, desto flüssiger der Fader, aber höher die CPU-Last

if __name__ == '__main__':
    threading.Thread(target=send_variable).start() 
    socketio.run(app)
