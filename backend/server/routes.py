from flask import render_template, redirect, flash, url_for, request, abort
from flask_login import login_user, logout_user, current_user
from werkzeug.utils import secure_filename

from server import app, db
from server.models import Plant, User


@app.before_request
def before():
    url = request.endpoint
    unauthenticated = ("login", "register")
    exception = ("index", "static")
    if url not in exception:
        if not current_user.is_authenticated and url not in unauthenticated:
            return redirect(url_for('login'))
        elif current_user.is_authenticated and url in unauthenticated:
            return redirect(url_for('plants'))


@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
        return redirect(url_for('plants'))
    
