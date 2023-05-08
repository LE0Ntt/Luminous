from server import db, login
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


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

# db.drop_all()
# db.create_all()
