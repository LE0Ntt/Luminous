from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

volume = 0


@app.route('/')
def index():
    return 'volume: ' + str(volume)


@socketio.on('volume')
def handle_volume(new_volume):
    global volume
    volume = new_volume
    print('Received volume:', volume)
    # Do something with the volume...

@socketio.on('volume')
def sendvariable():
    while True:
        socketio.emit('volume', volume, broadcast=True)
        print('Sent volume:', volume)
        time.sleep(1)


if __name__ == '__main__':
    socketio.run(app, host='127.0.0.1', port=5000)
