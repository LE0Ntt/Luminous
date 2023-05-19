from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

volume = 0


@app.route('/')
def index():
    return 'volume: ' + str(volume)


@socketio.on('volume', namespace='/test')
def handle_volume(new_volume):
    global volume
    volume = new_volume
    print('Received volume:', volume)
    # Do something with the volume...


@socketio.on('connect', namespace='/test')
def test_connect():
    print('Client connected')


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, host='127.0.0.1', port=5000)
