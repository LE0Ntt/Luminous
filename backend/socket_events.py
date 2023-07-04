from flask import Flask, render_template
from flask_socketio import SocketIO
from server import app, routes, db
from server.motorMix_driver import Driver
from server.models import Scene
import asyncio

# OLA imports
# from ola_handler import ola_handler

# ola = ola_handler()
# ola.setup()
connections = 0
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True, async_mode='threading')

def register_socketio_events(socketio):
    # Mutator method to get updates from driver
    def faderSend(index, value, channelid):
         socketio.emit('variable_update', {
                        'deviceId': index, 'value': value, 'channelId': channelid}, namespace='/socket')
        
    
    def callback(index, value):
        print("Eintrag", index, "wurde geändert:", value)
        faderSend(index, value, 0)
        routes.devices[index]["attributes"]["channel"][0]["sliderValue"] = value

    try:
        driver = Driver()
        driver.set_callback(callback)
        driver.devices = routes.devices if driver is not None else None
    except OSError as e:
        print("Possibly the MIDI interface is not connected.", str(e))
        driver = None

    # Update status (on/off) of a scene
    @socketio.on('scene_update', namespace='/socket')
    def update_scene(data):
        status = bool(data['status'])
        scene = int(data['id'])
        if scene < len(routes.scenes):  # Make sure scene exists
            routes.scenes[scene]["status"] = status
        # Send update to all clients
        global connections
        if connections > 0:
            socketio.emit('scene_update', {
                          'id': scene, 'status': status}, namespace='/socket')

    # Delete a scene and tell every client to update
    @socketio.on('scene_delete', namespace='/socket')
    def delete_scene(data):
        scene = int(data['id'])
        if scene < len(routes.scenes):  # Make sure scene exists
            routes.scenes.pop(scene)
            for entry in routes.scenes:  # Update ID of the following scenes
                if entry['id'] > scene:
                    entry['id'] -= 1
            # Remove from the database and update every other id
            db.session.query(Scene).filter(Scene.id == scene + 1).delete()
            scenes_to_update = db.session.query(
                Scene).filter(Scene.id > scene + 1).all()
            for scene in scenes_to_update:
                scene.id -= 1
            db.session.commit()
        socketio.emit('scene_reload', namespace='/socket')

    # Add a scene and tell every client to update
    @socketio.on('scene_add', namespace='/socket')
    def add_scene(data):
        scene = data['scene']
        scene['id'] = len(routes.scenes)
        routes.scenes.append(scene)
        if not scene['saved']:
            socketio.emit('scene_reload', namespace='/socket')
        else:
            save_scene(scene)

    # Save a scene to the database
    @socketio.on('scene_save', namespace='/socket')
    def save_scene(data):
        scene = int(data['id'])
        if scene < len(routes.scenes):  # Make sure scene exists
            sceneToSave = routes.scenes.pop(scene)
            lastSavedIndex = Scene.query.count()
            sceneToSave['saved'] = True
            for entry in routes.scenes:
                if entry['id'] < scene and entry['id'] >= lastSavedIndex:
                    entry['id'] += 1
            sceneToSave['id'] = lastSavedIndex
            routes.scenes.insert(lastSavedIndex, sceneToSave)
            # Add scene to the database
            new_scene = Scene(name='Scene1', number=1, color='red', channel=[
                              1, 2, 3])  # beispiel test
            db.session.add(new_scene)
            db.session.commit()
        socketio.emit('scene_reload', namespace='/socket')

    # Fader value update
    @socketio.on('fader_value', namespace='/socket')
    def handle_fader_value(data):
        faderValue = int(data['value'])
        fader = int(data['deviceId'])
        channelId = int(data['channelId'])

        if fader < len(routes.devices):
            device = routes.devices[fader]
            channels = device["attributes"]["channel"]
            for channel in channels:
                if int(channel["id"]) - 1 == channelId:
                    channel["sliderValue"] = faderValue
                    break

            device["attributes"]["channel"] = channels
            routes.devices[fader] = device

        driver.pushFader(fader, faderValue) if driver is not None else None
        driver.devices = routes.devices if driver is not None else None
        # Send update to all clients
        if connections > 1:
            faderSend(fader, faderValue, channelId)

        # DMX-Data senden
        # ola.send_dmx(fader, faderValue)

    @socketio.on('connect', namespace='/socket')
    async def connect():
        global connections
        connections += 1
        print('Client connected', connections)

    @socketio.on('disconnect', namespace='/socket')
    async def disconnect():
        global connections
        connections = max(connections - 1, 0)
        print('Client disconnected')
