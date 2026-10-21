"""
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * @file wsgi.py
 * Entry point for a WSGI server, the socket server runs in threading mode:
 * gunicorn -w 1 --threads 100 -b 0.0.0.0:5000 wsgi:app
"""

import logging
import os

logging.basicConfig(
    level=os.environ.get("LUMINOUS_LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

from server import app, led_control  # noqa: E402,F401
from socket_events import register_socketio_events, socketio  # noqa: E402

led_control.setup()
register_socketio_events(socketio)
