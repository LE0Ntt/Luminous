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

import logging
import os
from importlib.metadata import version

# Configured before the other imports, they already log while loading. LUMINOUS_LOG_LEVEL=DEBUG for more details
logging.basicConfig(
    level=os.environ.get("LUMINOUS_LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

from server import app, led_control  # noqa: E402
from socket_events import register_socketio_events, socketio  # noqa: E402

# Setup LED
led_control.setup()

# Setup SocketIO
register_socketio_events(socketio)

# Run app
if __name__ == "__main__":
    # Override with LUMINOUS_PORT, e.g. on macOS where AirPlay Receiver occupies port 5000
    port = int(os.environ.get("LUMINOUS_PORT", 5000))
    logging.getLogger(__name__).info("Starting server on: http://localhost:%d", port)
    # Werkzeug serves the few clients of the studio fine. Since 5.3 Flask-SocketIO refuses to start it
    # without a terminal (e.g. as systemd service) unless this flag is set, older versions don't know it
    options = {}
    if tuple(int(part) for part in version("Flask-SocketIO").split(".")[:2]) >= (5, 3):
        options["allow_unsafe_werkzeug"] = True
    socketio.run(app, host="0.0.0.0", port=port, **options)  # type: ignore

