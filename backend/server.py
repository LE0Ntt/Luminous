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

from server import app, led_control
from socket_events import register_socketio_events, socketio

# Setup LED
led_control.setup()

# Setup SocketIO
register_socketio_events(socketio)

# Run app
if __name__ == "__main__":
    print("Starting server on: http://localhost:5000")
    socketio.run(app, host="0.0.0.0", port=5000)  # type: ignore     "allow_unsafe_werkzeug=True" für production

