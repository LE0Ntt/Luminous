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
 * @file routes.py
"""

from flask import request, jsonify, send_file
import json
from server import app, db  # type: ignore
from server.models import Device, Admin, Scene
import os
import shutil
from datetime import datetime


# Load devices from database
@app.route("/devices")
def get_devices():
    device_list = []

    master = {
        "id": 0,
        "name": "Master",
        "attributes": {
            "channel": [{"id": "0", "sliderValue": 255, "channel_type": "main"}]
        },
    }
    device_list.append(master)

    with app.app_context():
        devices = Device.query.all()
        for device in devices:
            channels = device.set_channel_values(
                device.attributes.get("channel", []), universe=device.universe
            )
            device = {
                "id": device.id,
                "name": device.name,
                "device_type": device.device_type,
                "number": device.number,
                "universe": device.universe,
                "mute": False,
                "attributes": {"channel": channels},
            }
            device_list.append(device)
    return device_list


devices = get_devices()  # Global devices list


# Load scenes from database
def load_scenes():
    scenes_list = []

    with app.app_context():
        scenes = Scene.query.all()
        for scene in scenes:
            scene = {
                "id": scene.id - 1,
                "name": scene.name,
                "channel": scene.channel,
                "saved": True,
                "out_of_sync": False,
            }
            scenes_list.append(scene)
    return scenes_list


scenes = load_scenes()  # Global scenes list


# Access to devices list
@app.route("/fader")
def get_faders():
    global devices
    return jsonify(json.dumps(devices))


# Access to scenes list
@app.route("/scenes")
def get_scenes():
    global scenes
    return jsonify(json.dumps(scenes))


# Change the admin password
@app.route("/changePassword", methods=["POST"])
def change_password():
    data = request.get_json()
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")
    new_password_confirm = data.get("newPasswordConfirm")

    if new_password != new_password_confirm:
        return jsonify({"message": "no_match"})

    admin = Admin.query.first()

    # Create new Admin, if none exists
    if not admin:
        admin = Admin()
        admin.set_password(new_password)
        db.session.add(admin)
        db.session.commit()
        return jsonify({"message": "changed_successfully"})

    # Change password, if current password is correct
    if admin.check_password(current_password):
        admin.set_password(new_password)
        db.session.commit()
        return jsonify({"message": "changed_successfully"})
    else:
        return jsonify({"message": "currrent_wrong"})


# Check if the entered admin password is correct
@app.route("/checkpassword", methods=["POST"])
def check_password():
    data = request.get_json()
    password = data.get("password", "")
    admin = Admin.query.first()

    if admin:
        return {"match": "true" if admin.check_password(password) else "false"}
    else:  # If no admin exists in DB, allow access for empty password
        return {"match": "true" if password == "" else "false"}


# Send the database file to the client
@app.route("/download_db", methods=["GET"])
def download_db():
    try:
        return send_file("database.db", as_attachment=True)
    except Exception as e:
        return str(e), 500


DATABASE_PATH = os.path.join(os.path.dirname(__file__), "database.db")
BACKUP_FOLDER = os.path.join(os.path.dirname(__file__), "backups")
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Create a backup and then reset the database
@app.route("/reset_db", methods=["POST"])
def reset_db():
    try:
        if not os.path.exists(BACKUP_FOLDER):
            os.makedirs(BACKUP_FOLDER)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_db_path = os.path.join(BACKUP_FOLDER, f"database_{timestamp}.db")

        # Create backup of current database
        shutil.copy(DATABASE_PATH, backup_db_path)

        # Create new database
        with app.app_context():
            db.drop_all()
            db.create_all()

        return (
            jsonify({"message": "Database reset successful", "backup": backup_db_path}),
            200,
        )
    except Exception as e:
        return jsonify({"message": "Error resetting database", "error": str(e)}), 500


# Upload a new database file, create a backup of the current database and replace it with the uploaded file
@app.route("/upload_db", methods=["POST"])
def upload_db():
    try:
        # Backup the current database
        if not os.path.exists(BACKUP_FOLDER):
            os.makedirs(BACKUP_FOLDER)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_db_path = os.path.join(BACKUP_FOLDER, f"database_{timestamp}.db")

        # Ensure the database session is removed before copying
        db.session.remove()

        shutil.copy(DATABASE_PATH, backup_db_path)
        print(f"Database backed up to: {backup_db_path}")

        # Save the uploaded file
        if "file" not in request.files:
            return jsonify({"message": "No file part in the request"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"message": "No file selected for uploading"}), 400

        if file and file.filename.endswith(".db"):  # type: ignore
            uploaded_db_path = os.path.join(UPLOAD_FOLDER, "uploaded_database.db")
            file.save(uploaded_db_path)
            print(f"Uploaded database path: {uploaded_db_path}")

            # Ensure the database session is removed before replacing
            db.session.remove()
            db.session.close_all()
            db.engine.dispose()

            # Replace the current database with the uploaded one
            os.remove(DATABASE_PATH)
            shutil.move(uploaded_db_path, DATABASE_PATH)

            return (
                jsonify({"message": "Database uploaded and replaced successfully"}),
                200,
            )
        else:
            return (
                jsonify({"message": "Invalid file type. Only .db files are allowed"}),
                400,
            )

    except Exception as e:
        print(f"Error: {e}")
        return (
            jsonify(
                {"message": "Error uploading and replacing database", "error": str(e)}
            ),
            500,
        )
