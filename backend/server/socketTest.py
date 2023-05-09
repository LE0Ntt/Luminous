from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/')
def index():
    return 'Hello World!'

@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)

@app.route('/send_message')
def send_message():
    socketio.emit('message', 'Hello from Flask!', namespace='/')
    return 'Message sent!'

if __name__ == '__main__':
    
    socketio.run(app, port=3000)
    socketio.emit('variable_update', {'variable': 20}, namespace='/test')