from flask import Flask, jsonify, request, render_template
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


@app.route('/update_fader_value', methods=['POST'])
def update_fader_value():
    faderValue = int(request.json['faderValue'])
    print(faderValue)
    mmix.pushFader(0,faderValue)
    return jsonify({'success': True, 'fader_value': faderValue})


def send_variable():
    while True: 
        variable = 50
        socketio.emit('variable_update', {'variable': variable}, namespace='/test')
        time.sleep(1) 


@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)


@socketio.on('connect', namespace='/test') 
def test_connect(): 
    print('Client connected')


if __name__ == '__main__':
    variable_thread = threading.Thread(target=send_variable) 
    variable_thread.start() 
    socketio.run(app)

