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
 * @file models.py
"""
from sqlalchemy import JSON
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from server import db

ignored_channels = {1: [], 2: []}  # Channels ignored by the OLA master


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        db.session.commit()

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Scene(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    number = db.Column(db.Integer)
    color = db.Column(db.String(50))  # Not used yet
    channel = db.Column(JSON)


class Device(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    number = db.Column(db.Integer)
    device_type = db.Column(db.Integer)
    universe = db.Column(db.Integer)
    attributes = db.Column(JSON)

    def to_dict(self):
        channels = self.set_channel_values(
            self.attributes.get("channel", []), universe=self.universe
        )
        return {
            "id": int(self.number),
            "name": self.name,
            "number": self.number,
            "device_type": self.device_type,
            "universe": self.universe,
            "attributes": {"channel": channels},
        }

    # Initial values for channels
    def set_channel_values(self, channels, universe):
        global ignored_channels
        universe = int(universe[1:])  # Stripping the 'U' and converting to int
        for channel in channels:
            if channel["channel_type"] != "main":
                ignored_channels[universe].append(int(channel["dmx_channel"]))
            if channel["channel_type"] in ["r", "g", "b"]:
                channel["sliderValue"] = 255
                channel["backupValue"] = 255
            elif channel["channel_type"] == "bi":
                channel["sliderValue"] = 128
                channel["backupValue"] = 128
            else:
                channel["sliderValue"] = 0
                channel["backupValue"] = 0
        return channels


class Show(db.Model):  # Not used yet
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.String(50))
    event = db.Column(JSON)
    mute = db.Column(db.Boolean, default=False)
    solo = db.Column(db.Boolean, default=False)

    def get_date(self):
        return self.date.strftime("%d.%m.%y %H:%M")


class Settings(db.Model):  # Not used yet
    id = db.Column(db.Integer, primary_key=True)
    studio_grid = db.Column(JSON, nullable=False)
    language = db.Column(
        db.String(2), default="en"
    )  # Not used as language is handled client-side


## Clear db
# with app.app_context():
#   db.drop_all()
#   db.create_all()
