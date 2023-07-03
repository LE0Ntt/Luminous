from server import app, Driver, routes
from flask import json
from flask_socketio import SocketIO
import socket_events
from socket_events import socketio
import signal
import sys
import motorMix_handler
# from socket_events import setup
socketio = SocketIO(app, cors_allowed_origins = "*")


def signal_handler(sig, frame):
    print('Server stopped.')
    sys.exit(0)

#motorMix_handler.motorMix_updateDevices()

signal.signal(signal.SIGINT, signal_handler)


socket_events.register_socketio_events(socketio)

if __name__ == '__main__':
    # setup()
    socketio.run(app, host='127.0.0.1', port=5000)
