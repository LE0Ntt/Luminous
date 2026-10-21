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

import os

from server import app, led_control
from socket_events import register_socketio_events, socketio

# Setup LED
led_control.setup()

# Setup SocketIO
register_socketio_events(socketio)

# Run app
if __name__ == "__main__":
    # Override with LUMINOUS_PORT, e.g. on macOS where AirPlay Receiver occupies port 5000
    port = int(os.environ.get("LUMINOUS_PORT", 5000))
    print(f"Starting server on: http://localhost:{port}")
    socketio.run(app, host="0.0.0.0", port=port)  # type: ignore     "allow_unsafe_werkzeug=True" für production

