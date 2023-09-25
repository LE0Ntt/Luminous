from server import app, Driver, routes
from flask import json
from flask_socketio import SocketIO
import socket_events
from socket_events import socketio
import signal
import sys
""" import RPi.GPIO as GPIO """

socketio = SocketIO(app, cors_allowed_origins="*")

# --------------LED-----------------#
""" LED_PIN = 24
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)

def turn_on_led():
    GPIO.output(LED_PIN, GPIO.HIGH)

def turn_off_led():
    GPIO.output(LED_PIN, GPIO.LOW)

def signal_handler(sig, frame):
    print('Server stopped.')
    turn_off_led()
    GPIO.cleanup()
    sys.exit(0) """
# -------------LED-END----------------#



def signal_handler(sig, frame):
    print('Server stopped.')
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)

socket_events.register_socketio_events(socketio)

if __name__ == '__main__':
    # LED einschalten
    # turn_on_led()
    socketio.run(app, host='0.0.0.0', port=5000)
