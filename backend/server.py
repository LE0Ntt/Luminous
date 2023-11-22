"""
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 *
 * @file server.py
"""
from server import app
from flask_socketio import SocketIO
import socket_events
from socket_events import socketio
import sys

# --------------LED-----------------#
try:
    import RPi.GPIO as GPIO  # type: ignore

    LED_PIN = 24
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(LED_PIN, GPIO.OUT)

    def turn_on_led():
        GPIO.output(LED_PIN, GPIO.HIGH)

    def turn_off_led():
        GPIO.output(LED_PIN, GPIO.LOW)

    def signal_handler(sig, frame):
        print("Server stopped.")
        turn_off_led()
        GPIO.cleanup()
        sys.exit(0)

    turn_on_led()

except ModuleNotFoundError:
    print("RPi.GPIO module not found. Running without GPIO support.")

# -------------LED-END----------------#


socketio = SocketIO(app, cors_allowed_origins="*")
socket_events.register_socketio_events(socketio)


def run_server():
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)  # type: ignore     "allow_unsafe_werkzeug=True" für production


if __name__ == "__main__":
    run_server()
