from server import app, Driver, routes
from flask import json
from flask_socketio import SocketIO


socketio = SocketIO(app, cors_allowed_origins = "*")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
