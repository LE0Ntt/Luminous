from flask import Flask, render_template
from flask_socketio import SocketIO
from server import app, routes, db, motorMix_driver
from server.motorMix_driver import Driver
from server.models import Scene
import json
import time
# OLA imports
#from ola_handler import ola_handler

#ola = ola_handler()
#ola.setup()
connections = 0
global socketio
socketio = SocketIO(app, cors_allowed_origins="*",
                    logger=False, engineio_logger=False)

last_send_time = 0
def send_dmx(fader: int, channelId: int, fader_value: int, device: dict, channel: dict) -> None:
    if fader == 0 and channelId == 0:
        print("Masterfader")
        #ola.master_fader(fader_value)
    else:
        try:
            dmx_channel = int(channel['dmx_channel'])
            universe = int(device['universe'][1:])
            #ola.send_dmx(universe, dmx_channel - 1, fader_value)
            # print(f"dmx {dmx_channel}, value {fader_value}, universe {universe}")
        except KeyError:
            print('No dmx_channel key for non-master channel')


def send_dmx_direct(universe: int, value: int, channel: int) -> None:
    # ola.send_dmx(universe, channel - 1, value)
    print(f"dmx {channel}, value {value}, universe {universe}")


def register_socketio_events(socketio):
    # Mutator method to get updates from driver
    def faderSend(index, value, channelId):
        global last_send_time
        current_time = time.time() * 1000
        socketio.emit('variable_update', {
            'deviceId': index, 'value': value, 'channelId': channelId}, namespace='/socket')
        
        if current_time - last_send_time >= 20:
            # Den Zeitstempel für den aktuellen Aufruf aktualisieren
            last_send_time = current_time
            
            # Die "send" Funktion aufrufen
            send_dmx(index, channelId, value, routes.devices[index], routes.devices[index]["attributes"]["channel"][channelId])

    def callback(index, value):
        print("Eintrag", index, "wurde geändert:", value)
        faderSend(index, value, 0)
        # muss noch getestet werden

        for i, device in enumerate(routes.devices):
            if device["id"] == index:
                index = i
                routes.devices[index]["attributes"]["channel"][0]["sliderValue"] = value
    
    def quickSceneCallback(scene, status):
        update_scene({"id": scene, "status": status})

    def sceneCallback(scene, value):
        print("Scene", scene, "wurde geändert:", value)
    
    try:
        driver = Driver()
        driver.set_callback(callback)
        driver.set_sceneQuickCallback(quickSceneCallback)
        driver.set_sceneCallback(sceneCallback)
        driver.devices = routes.devices
        driver.scenes = routes.scenes
        driver.deviceMapping()
        driver.sceneMapping()
        driver.socketio = socketio
    except OSError as e:
        print("Possibly the MIDI interface is not connected.", str(e))
        driver = None
        
        # send every channel of each device to ola on starqup
        for device in routes.devices:
            for channel in device["attributes"]["channel"]:
                send_dmx(device["id"], channel["id"], channel["sliderValue"], device, channel)

    # Update status (on/off) of a scene
    @socketio.on('scene_update', namespace='/socket')
    def update_scene(data):
        status = bool(data['status'])
        scene = int(data['id'])
        driver.quickSceneButtonUpdate(scene, status)
        if scene < len(routes.scenes):  # Make sure scene exists
            routes.scenes[scene]["status"] = status
            print(routes.scenes[scene])
            # Send every channel to the device to the client
            for device in routes.scenes[scene]["channel"]:
                for channel in device["attributes"]["channel"]:
                    if channel['id'] == 0: # !!! muss raus um alle channel zu schicken !!!
                        device1 = next((device1 for device1 in routes.devices if device1['id'] == device['id']), None)
                        deviceChannel = device1["attributes"]["channel"][channel['id']]
                        if status: # on
                            faderSend(device["id"], channel["sliderValue"], channel["id"])
                            send_dmx(device["id"], channel["id"],
                                    channel["sliderValue"], device, channel)
                            deviceChannel["sliderValue"] = channel["sliderValue"]
                            if driver.light_mode:
                                driver.pushFader(device["id"], deviceChannel["sliderValue"] if device else 0)
                            driver.devices = routes.devices
                        else:      # off
                            deviceChannel["sliderValue"] = deviceChannel["backupValue"]
                            send_dmx(device["id"], channel["id"],
                                    deviceChannel["backupValue"], device, channel)
                            faderSend(device["id"], deviceChannel["backupValue"] if device else 0, channel["id"])
                            if driver.light_mode:
                                driver.pushFader(device["id"], deviceChannel["backupValue"] if device else 0)
                            driver.devices = routes.devices


        # Send update to all clients
        global connections
        if connections > 0:
            socketio.emit('scene_update', {
                'id': scene, 'status': status}, namespace='/socket')

    # Delete a scene and tell every client to update
    @socketio.on('scene_delete', namespace='/socket')
    def delete_scene(data):
        scene = int(data['id'])
        
        #update scenes on MotorMix
        if driver is not None:
            driver.scenes = routes.scenes
            driver.scenesMapping()
        
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

        # Filter devices with sliderValue 0
        filtered_devices = [
            device for device in routes.devices[1:]  # Skip master fader
            if device["attributes"]["channel"][0]["sliderValue"] > 0
        ]
        scene['channel'] = json.loads(json.dumps(filtered_devices))
        routes.scenes.append(scene)
        if not scene['saved']:  # If scene is not saved, don't add to database
            socketio.emit('scene_reload', namespace='/socket')
        else:
            save_scene(scene)

    # Save a scene to the database
    @socketio.on('scene_save', namespace='/socket')
    def save_scene(data):
        scene = int(data['id'])

        #update scenes on MotorMix
        if driver is not None:
            driver.scenes = routes.scenes
            driver.scenesMapping()

        if scene < len(routes.scenes):  # Make sure scene exists
            sceneToSave = routes.scenes.pop(scene)
            lastSavedIndex = Scene.query.count()
            sceneToSave['saved'] = True
            for entry in routes.scenes:
                if entry['id'] < scene and entry['id'] >= lastSavedIndex:
                    entry['id'] += 1
            sceneToSave['id'] = lastSavedIndex
            routes.scenes.insert(lastSavedIndex, sceneToSave)

            try:
                if 'channel' in data:
                    filtered_devices = data['channel']
                else:
                    filtered_devices = [
                        # Skip master fader
                        device for device in routes.devices[1:]
                        if device["attributes"]["channel"][0]["sliderValue"] > 0
                    ]
                    data['name'] = routes.scenes[scene]['name']
            except KeyError:
                print('No channel key for scene')
            # Add scene to the database
            new_scene = Scene(
                name=data['name'], number=scene, color='default', channel=filtered_devices)
            db.session.add(new_scene)
            db.session.commit()
        socketio.emit('scene_reload', namespace='/socket')

    # Fader value update
    @socketio.on('fader_value', namespace='/socket')
    def handle_fader_value(data):
        fader_value = int(data['value'])
        fader = int(data['deviceId'])
        channelId = int(data['channelId'])
        device = next((device for device in routes.devices if device['id'] == fader), None)
        if device:
            channels = device["attributes"]["channel"]
            for channel in channels:
                if int(channel["id"]) == channelId:
                    channel["sliderValue"] = fader_value
                    channel["backupValue"] = fader_value
                    send_dmx(fader, channelId, fader_value, device, channel)
                    break        
            device["attributes"]["channel"] = channels
            routes.devices[fader] = device
        else: # Non device DMX channel
            if fader == 692:
                universe = 1
            elif fader == 693:
                universe = 2    
            send_dmx_direct(universe, fader_value, channelId)
                
        if driver is not None:
            driver.pushFader(fader, fader_value)
            driver.devices = routes.devices

        if connections > 1:
            faderSend(fader, fader_value, channelId)

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
