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
 * @file auth.py
"""

import logging
from functools import wraps
from flask import request, jsonify
from itsdangerous import URLSafeTimedSerializer, BadSignature
from server import app

# After entering the admin password, the client receives a signed token that
# admin-only HTTP routes expect in this header and socket events in "token"
ADMIN_TOKEN_HEADER = "X-Admin-Token"
ADMIN_TOKEN_MAX_AGE = 30 * 60  # Seconds, covers one visit of the admin settings

logger = logging.getLogger(__name__)

_serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"], salt="admin-token")


# Create a token after the admin password has been checked successfully
def create_admin_token():
    return _serializer.dumps("admin")


# Check that the token was issued by this server and has not expired yet
def is_valid_admin_token(token):
    if not isinstance(token, str) or not token:
        return False
    try:
        return _serializer.loads(token, max_age=ADMIN_TOKEN_MAX_AGE) == "admin"
    except BadSignature:  # Also covers SignatureExpired
        return False


# Decorator for HTTP routes that may only be used with a valid admin token
def admin_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not is_valid_admin_token(request.headers.get(ADMIN_TOKEN_HEADER)):
            logger.warning("Rejected unauthorized request to %s from %s", request.path, request.remote_addr)
            return jsonify({"message": "unauthorized"}), 401
        return view(*args, **kwargs)

    return wrapper
