from server import app, Driver, routes
from flask import json
from flask_socketio import SocketIO
import socket_events
from socket_events import socketio
import signal
import sys
# from socket_events import setup
# socketio = SocketIO(app, cors_allowed_origins = "*")


def signal_handler(sig, frame):
    print('Server stopped.')
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)


socket_events.register_socketio_events(socketio)

if __name__ == '__main__':
    # setup()
    socketio.run(app, host='192.168.0.251', port=5000)
