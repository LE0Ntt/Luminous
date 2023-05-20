from flask import Flask, render_template
from flask_socketio import SocketIO
import threading
import time
from ola.ClientWrapper import ClientWrapper
from MOTORMIX_driver import Driver

driver = Driver()
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# add OLA variables
OLA_UNIVERSE = 1  # replace with your OLA universe
dmx_data = [0]*512


def DmxSent(state):
    wrapper.Stop()


def send_dmx_data():
    # This will call the DmxSent method when complete
    wrapper.Client().SendDmx(OLA_UNIVERSE, dmx_data, DmxSent)


@app.route('/')
def mein_endpunkt():
    return render_template('faderTest.html')


@app.route('/members')
def home():
    return {"test": ["test1", "test2"]}


@socketio.on('fader_value', namespace='/test')  # test für faderTest.js
def handle_fader_value(data):
    faderValue = int(data['value'])
    driver.pushFader(0, faderValue)

    # update DMX data and send
    dmx_data[0] = faderValue
    send_dmx_data()


@socketio.on("slider_change", namespace='/test')  # test für react
def on_volume_change(data):
    faderValue = int(data['volume'])
    driver.pushFader(0, faderValue)

    # update DMX data and send
    dmx_data[0] = faderValue
    send_dmx_data()


@socketio.on('connect', namespace='/test')
def test_connect():
    print('Client connected')


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


def send_variable():
    old_variable = None
    while True:
        variable = driver.fader_values[0]
        if variable != old_variable:
            socketio.emit('variable_update', {
                          'variable': variable}, namespace='/test')
            old_variable = variable
        time.sleep(0.01)


if __name__ == '__main__':
    threading.Thread(target=send_variable).start()
    wrapper = ClientWrapper()
    socketio.run(app, host='192.168.0.251', port=5000)
