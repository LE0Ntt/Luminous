from sqlalchemy import JSON
# from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import json
from flask import jsonify
from server import db, app


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
    color = db.Column(db.String(50))
    channel = db.Column(JSON)


class Device(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    number = db.Column(db.Integer)
    device_type = db.Column(db.Integer)
    universe = db.Column(db.Integer)
    attributes = db.Column(JSON)


class Show(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.String(50))
    event = db.Column(JSON)
    mute = db.Column(db.Boolean, default=False)
    solo = db.Column(db.Boolean, default=False)

    def get_date(self):
        return self.date.strftime('%d.%m.%y %H:%M')


class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    studio_grid = db.Column(JSON, nullable=False)
    language = db.Column(db.String(2), default='en')

    def switch_language(self):
        self.language = 'de' if self.language == 'en' else 'en'
        db.session.commit()

# Clear db
# with app.app_context():
    # db.drop_all()
    # db.create_all()


'''
Die JSON-Spalte ermöglicht es, komplexe Datenstrukturen wie das JSON-Objekt, das du beschrieben hast, in der Datenbank zu speichern und abzurufen. Wenn du Daten in die Tabelle einfügen möchtest, kannst du dies auf folgende Weise tun:
new_scene = Scene(name='my_scene', number=1, color='red', channel={
    "channel": [
        {"id": 0, "universe": 0, "val": 125},
        {"id": 1, "universe": 0, "val": 0}
    ]
})

db.session.add(new_scene)
db.session.commit()

nullable=False gibt an, dass die betreffende Spalte in der Datenbank nicht leer oder null sein darf. Wenn du versuchst, eine Zeile ohne einen Wert für diese Spalte zu speichern, wird eine IntegrityError-Ausnahme ausgelöst.
index=True gibt an, dass eine Datenbank-Index auf der betreffenden Spalte erstellt werden soll. Ein Index ist eine Datenstruktur, die es der Datenbank ermöglicht, die Datensätze in der Tabelle schneller zu durchsuchen und abzurufen. Wenn du eine Spalte als Index markierst, wird die Abfrage von Datensätzen, die auf dieser Spalte basieren, schneller ausgeführt.


Date:
entry = Entry(content='Dies ist ein Eintrag.')
db.session.add(entry)
db.session.commit()

print(entry.get_date())  # Ausgabe: 26.05.23 14:30






Alter Code als Beipsiel:
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, index=True, unique=True)
    email = db.Column(db.String, index=True, unique=True)
    password_hash = db.Column(db.String(256))
    name = db.Column(db.String, index=True)
    plants = db.relationship('Plant', backref='user', lazy='dynamic')

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


class Plant(db.Model):
    id = db.Column(db.Integer, primary_key=True, unique=True)
    plant_name = db.Column(db.String, index=True)
    plant_species = db.Column(db.String, index=True)
    temp = db.Column(db.Float)
    humidity = db.Column(db.Float)
    water = db.Column(db.Float)
    photo = db.Column(db.String)
    watertime = db.Column(db.Float)
    x = db.Column(db.Integer)
    y = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return '<Plant {}>'.format(self.plant_name)
'''
