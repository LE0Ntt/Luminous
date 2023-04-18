from flask import Flask, render_template
from flask_socketio import SocketIO
import threading
import time
from MOTORMIX_driver import Driver

driver = Driver()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def mein_endpunkt():
    return render_template('faderTest.html')


@socketio.on('fader_value', namespace='/test')
def handle_fader_value(data):
    faderValue = int(data['value'])
    #print(faderValue)
    driver.pushFader(0, faderValue)
    #socketio.emit('variable_update', {'variable': faderValue}, namespace='/test') # update fader for other clients


@socketio.on('connect', namespace='/test') 
def test_connect(): 
    print('Client connected')


def send_variable():
    old_variable = None
    while True: 
        variable = driver.fader_values[0]
        if variable != old_variable:
            socketio.emit('variable_update', {'variable': variable}, namespace='/test')
            old_variable = variable
        time.sleep(0.01) #je niedriger, desto flüssiger der Fader, aber höher die CPU-Last


if __name__ == '__main__':
    variable_thread = threading.Thread(target=send_variable) 
    variable_thread.start() 
    socketio.run(app)
