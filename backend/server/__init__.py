import json
from flask import Flask
#from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_cors import CORS
#from motorMix_driver import Driver
from server.motorMix_driver import Driver
#from server.motorMix_handler import callback
#from server.socket import *
import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'VerySecretKey'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'database.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = False
    TESTING = False

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/*": {"origins": "*"}})
#socketio = SocketIO(app, cors_allowed_origins = "*")

#socketio.on_namespace(test_connect)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from server import models, routes

@app.before_first_request
def create_tables():
    db.create_all()
