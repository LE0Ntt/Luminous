from server import app, Driver, routes
from flask import json
from flask_socketio import SocketIO
import socket_events
from socket_events import socketio
from socket_events import setup
# socketio = SocketIO(app, cors_allowed_origins = "*")

socket_events.register_socketio_events(socketio)

if __name__ == '__main__':
    setup()
    socketio.run(app, host='0.0.0.0', port=5000)
