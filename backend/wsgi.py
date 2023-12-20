from server import app, led_control
from socket_events import register_socketio_events, socketio

if __name__ == "__main__":
    app.run()


# gunicorn -k gevent -w 1 wsgi:app
# /usr/local/bin/python3.9 /Library/Frameworks/Python.framework/Versions/3.9/bin/gunicorn -k gevent -w 1 -b 127.0.0.1:5000 server:app
# /usr/local/bin/python3.9 /Library/Frameworks/Python.framework/Versions/3.9/bin/gunicorn -k gevent -w 1 -b 127.0.0.1:5000 wsgi:app
# /usr/local/bin/python3.9 /Library/Frameworks/Python.framework/Versions/3.9/bin/gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 -b 127.0.0.1:5000 wsgi:app
