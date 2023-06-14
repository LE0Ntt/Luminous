from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
from server import app, routes, db
from server.motorMix_driver import Driver
from server.models import Scene
import json

# OLA imports
import sys
import array
# from ola.ClientWrapper import ClientWrapper

# OLA

wrapper = None


def DmxSent(status):  # überprüft, ob die DMX-Daten erfolgreich gesendet wurden
    if status.Succeeded():
        print('Success!')
    else:
        print('Error: %s' % status.message, file=sys.stderr)

    global wrapper
    if wrapper:
        wrapper.Stop()


def setup():  # OLA-Client-Setup, wird dafür benötigt, dass die DMX-Daten gesendet werden können. (arrays für die universen erstellt, usw.)
    print("Setting up...")
    global universe
    global dmx_data
    universe = 2
    dmx_data = array.array('B')
    dmx_data.extend([0] * 256)


def send_dmx(channel, faderValue, universe):  # sendet die DMX-Daten an das OLA-Universum
    # Debug, gibt die Werte der Fader aus
    print("Fader", channel, "Value changed: ", faderValue)
    # Debug, gibt die Länge des Arrays aus
    lenght = len(dmx_data)
    # Debug, gibt die Länge des Arrays aus
    print("len", lenght)
    # setzt den Wert des Faders im Array auf den aktuellen Wert
    dmx_data[channel] = faderValue

    global wrapper
    wrapper = ClientWrapper()
    client = wrapper.Client()
    # send 1 dmx frame mit dem akuellen array
    client.SendDmx(universe, dmx_data, DmxSent)
    wrapper.Run()


connections = 0
socketio = SocketIO(app, cors_allowed_origins="*")


def register_socketio_events(socketio):
    # Mutator method to get updates from driver
    def callback(index, value):
        print("Eintrag", index, "wurde geändert:", value)
        socketio.emit('variable_update', {
                      'id': index, 'value': value}, namespace='/socket')
        sliders = json.loads(routes.sliders)
        sliders[index]["sliderValue"] = value
        routes.sliders = json.dumps(sliders)

    try:
        driver = Driver()
        driver.set_callback(callback)
    except OSError as e:
        print("Possibly the MIDI interface is not connected.", str(e))
        driver = None

    # Update status (on/off) of a scene
    @socketio.on('scene_update', namespace='/socket')
    def update_scene(data):
        status = bool(data['status'])
        scene = int(data['id'])
        scenes = json.loads(routes.scenes)
        if scene < len(scenes):  # Make sure scene exists
            scenes[scene]["status"] = status
        routes.scenes = json.dumps(scenes)
        # Send update to all clients
        global connections
        if connections > 0:
            socketio.emit('scene_update', {
                          'id': scene, 'status': status}, namespace='/socket')

    # Delete a scene and tell every client to update
    @socketio.on('scene_delete', namespace='/socket')
    def delete_scene(data):
        scene = int(data['id'])
        scenes = json.loads(routes.scenes)
        if scene < len(scenes):  # Make sure scene exists
            scenes.pop(scene)
            for entry in scenes:  # Update ID of the following scenes
                if entry['id'] > scene:
                    entry['id'] -= 1
            # Remove from the database and update every other id
            db.session.query(Scene).filter(Scene.id == scene + 1).delete()
            scenes_to_update = db.session.query(
                Scene).filter(Scene.id > scene + 1).all()
            for scene in scenes_to_update:
                scene.id -= 1
            db.session.commit()
        routes.scenes = json.dumps(scenes)
        socketio.emit('scene_reload', namespace='/socket')

    # Add a scene and tell every client to update
    @socketio.on('scene_add', namespace='/socket')
    def add_scene(data):
        scenes = json.loads(routes.scenes)
        scenes.append(data['scene'])
        routes.scenes = json.dumps(scenes)
        if not data['scene']['saved']:
            socketio.emit('scene_reload', namespace='/socket')
        else:
            save_scene(data['scene'])

    # Save a scene to the database
    @socketio.on('scene_save', namespace='/socket')
    def save_scene(data):
        scene = int(data['id'])
        scenes = json.loads(routes.scenes)
        if scene < len(scenes):  # Make sure scene exists
            sceneToSave = scenes.pop(scene)
            lastSavedIndex = Scene.query.count()
            sceneToSave['saved'] = True
            for entry in scenes:
                if entry['id'] < scene and entry['id'] >= lastSavedIndex:
                    entry['id'] += 1
            sceneToSave['id'] = lastSavedIndex
            scenes.insert(lastSavedIndex, sceneToSave)
            # Add scene to the database
            new_scene = Scene(name='Scene1', number=1, color='red', channel=[
                              1, 2, 3])  # beispiel test
            db.session.add(new_scene)
            db.session.commit()
        routes.scenes = json.dumps(scenes)
        socketio.emit('scene_reload', namespace='/socket')

    # Fader value update
    @socketio.on('fader_value', namespace='/socket')
    def handle_fader_value(data):
        faderValue = int(data['value'])
        fader = int(data['id'])
        # print(fader, faderValue)
        sliders = json.loads(routes.sliders)
        if fader < len(sliders):
            sliders[fader]["sliderValue"] = faderValue
        routes.sliders = json.dumps(sliders)
        driver.pushFader(fader, faderValue) if driver is not None else None
        # Send update to all clients
        global connections
        if connections > 1:
            socketio.emit('variable_update', {
                          'id': fader, 'value': faderValue}, namespace='/socket')

        # DMX-Data senden
        send_dmx(fader, faderValue, universe)

    @socketio.on('connect', namespace='/socket')
    def connect():
        global connections
        connections += 1
        print('Client connected', connections)

    @socketio.on('disconnect', namespace='/socket')
    def disconnect():
        global connections
        connections = max(connections - 1, 0)
        print('Client disconnected')
