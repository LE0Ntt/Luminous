#
#Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
#Martrikelnummer : 1111 0647
#Stand : 13.03.2019
#

from flask import Flask, render_template, send_from_directory, request, url_for, jsonify,Response,escape
from flask_socketio   import SocketIO, send, emit
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow  import Marshmallow
from flask_login      import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import check_password_hash
from sqlalchemy_utils import JSONType, ColorType
from sqlalchemy.exc   import IntegrityError

from ola.ClientWrapper import ClientWrapper
from ola.OlaClient     import Universe

from marshmallow import fields, Schema

import array
import random
import requests
import traceback
import RPi.GPIO as GPIO

app = Flask(__name__, static_url_path='/static')
app.config['SECRET_KEY'] = 'mysecret'
login_manager = LoginManager()
login_manager.init_app(app)
socketio = SocketIO(app)

#OLA Client wrapper to better communicate with OLA
wrapper = ClientWrapper()
data = array.array("B")

current_dmx_frames = {}

mapped_dmx_frames = {}

current_universes = []

current_master_value = 255

#Get the sqlite database
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///nocdata.db"

db = SQLAlchemy(app)
ma = Marshmallow(app)

class User( UserMixin, db.Model ):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column( db.String(15), unique=True )
    password = db.Column( db.String(80) )

@login_manager.user_loader
def loadUser( userID ):
    return User.query.get( int( userID ) )

#Define the database models
class Profile(db.Model):
    id     = db.Column(db.Integer, primary_key= True)
    name   = db.Column(db.String(20), unique=True, nullable = False)
    fader  = db.Column(JSONType)
    groups = db.Column(JSONType)
    scenes = db.relationship("Scene", backref="profile")

class Scene(db.Model):
    id    = db.Column(db.Integer, primary_key = True)
    name  = db.Column(db.String())
    color = db.Column(ColorType)
    faderValues = db.Column(JSONType)
    profile_id   = db.Column(db.Integer,db.ForeignKey("profile.id"))

#The schemas are needed for marschmallow to convert the database entries to JSON
class SceneSchema(Schema):
    id           = fields.Integer()
    name         = fields.String()
    color        = fields.String()
    faderValues = fields.Raw()


class ProfileSchema(ma.ModelSchema):
    #This entry creates the realion to the SceneSchema
    id      = fields.Integer()
    name    = fields.String()
    fader   = fields.Raw()
    groups  = fields.Raw()
    scenes  = ma.Nested(SceneSchema, many=True)


#Create the table!
db.create_all()

#Serve the index page
@app.route('/')
def index_serve():
    return render_template('index.html', universes = current_universes, uniLength= len(current_universes))

#Largely copied from the quickstart page of the flask documentation
#http://flask.pocoo.org/docs/1.0/quickstart/#accessing-request-data
@app.route('/login', methods=['POST', 'GET'])
def login():
    error = None
    if request.method == 'POST':
        input = request.get_json()
        username = input.get('username')
        password = input.get('password')
        user = User.query.filter_by( username=username ).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user, remember="False")
                return Response(status=200)
            else:
                return "Wrong username or password!", 400
        else:
            return Response(status=400)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return Response(status=200)

#Giveback the manifest for setting up a very basic PWA
@app.route('/manifest')
def manifestReturn():
    print(url_for('static', filename='manifest.json'))
    return app.send_static_file('manifest.json')

#This serves the current DMX Status of all universes
@app.route('/dmxstatus')
def dmxStatus():
    output = {}
    for uni in current_universes:
        output[uni["id"]] = requests.get("http://localhost:9090/get_dmx?u="+str(uni["id"])).json()
    output["master"] = current_master_value
    return jsonify(output)

@app.route("/universes")
def getUniverses():
    global current_universes
    return jsonify(current_universes)

#return all profiles as an JSON array
@app.route("/profiles", methods=["GET"])
def get_all_profiles():
    output = []
    for specificProfile in Profile.query.all():
        output.append({"profile_name":specificProfile.name, "profile_id":specificProfile.id});
    return jsonify(output)

#Return the one profile corresponding to the profile_id
@app.route("/profiles/<profile_id>" ,methods=["GET"])
def get_one_profile(profile_id):
    try:
        save_profile_id = int(profile_id)
    except:
        return Response(status=400)
    profile = Profile.query.filter_by(id=save_profile_id).first()
    if profile is not None:
        profile_schema = ProfileSchema()
        output = profile_schema.dump(profile).data
        #output["profile_fader"] = profile.fader
        return jsonify(output)
    else:
        return Response(status=400)

#Post one new profile
@app.route("/profiles" ,methods=["POST"])
@login_required
def add_profile():
    input = request.get_json()
    new_profile = Profile()
    new_profile.name = input.get("name")
    new_profile.fader = input.get("fader")
    new_profile.groups= input.get("groups")

    #Build the scenes
    scenes_input = input.get("scenes")

    try:
        #create a scene entry for every scene and add it to the session
        for scene in scenes_input:
            new_scene = Scene()
            print("Scene name : %s" %scenes_input[scene].get("name"))
            print("Scene color: %s" %scenes_input[scene].get("color"))
            print("Scene fader: %s" %scenes_input[scene].get("faderValues"))
            new_scene.name = scenes_input[scene].get("name")
            new_scene.color= scenes_input[scene].get("color")
            new_scene.faderValues= scenes_input[scene].get("faderValues")
            new_scene.profile=new_profile
            db.session.add(new_scene)

        db.session.add(new_profile)
        db.session.flush()
        db.session.refresh(new_profile)
        db.session.commit()
    except Exception as e:
        print(e)
        return Response(status=400)
    return jsonify({"profileID":new_profile.id}), 200

#Update one profile
@app.route("/profiles/<profile_id>" ,methods=["PUT"])
@login_required
def update_profile(profile_id):
    input = request.get_json()
    try:
        save_profile_id = int(profile_id)
        profile_to_update = Profile.query.filter_by(id=save_profile_id).first()
        if profile_to_update is None:
            print("No Profile found")
            return Response(status=400)

        profile_to_update.fader = input.get("fader")
        profile_to_update.groups= input.get("groups")
        input_scenes = input.get("scenes")
        added_scenes = input.get("scene_changes").get("added")
        modified_scenes = input.get("scene_changes").get("modified")
        removed_scenes  = input.get("scene_changes").get("removed")

        print("Added scenes : %s" %added_scenes)
        print("Modified scenes : %s" %modified_scenes)
        print("Removed scenes : %s" %removed_scenes)

        for scene in input_scenes:
            print("The scene %s" %scene)
            print(scene)
            #Adding scenes
            if int(scene) in added_scenes:
                new_scene = Scene()
                new_scene.name = input_scenes[scene].get("name")
                new_scene.color = input_scenes[scene].get("color")
                new_scene.faderValues = input_scenes[scene].get("faderValues")
                new_scene.profile = profile_to_update
                db.session.add(new_scene)
                print("- Added new Scene %s -" %input_scenes[scene].get("name"))

            #Modifying scenes
            elif input_scenes[scene].get("id") in modified_scenes:
                print("One scene to modify!")
                print(input_scenes[scene])
                scene_to_modify = Scene.query.filter_by(id=input_scenes[scene].get("id")).first()
                if scene_to_modify is not None:
                    scene_to_modify.name = input_scenes[scene].get("name")
                    scene_to_modify.color = input_scenes[scene].get("color")
                    scene_to_modify.faderValues = input_scenes[scene].get("faderValues")
                else:
                    print("- Scene not found!!! -")
                #get scenes
                #modify scene

        #Removing scenes
        for tmpSceneID in removed_scenes:
            scene_to_remove = Scene.query.filter_by(id=tmpSceneID).first()
            if scene_to_remove is not None:
                db.session.delete(scene_to_remove)
            else:
                print("- Scene not found!!! -")
            print("Removing Scene : %s" %scene_to_remove.name)

        db.session.commit()
        return Response(status=200)

    except Exception as e:
        print(e)
        traceback.print_exc()
        return Response(status=400)

#Delete the profile with the corresponding ID
@app.route("/profiles/<profile_id>" ,methods=["DELETE"])
@login_required
def delete_profile(profile_id):
    #Try to get the profile with the profile id
    try:
        #Parse the profile id and make sure that it is an Integer
        secure_profile_id = int(profile_id)
        profile_to_delete = Profile.query.filter_by(id=secure_profile_id).first()

        #if the profile hasnt been found -> Exit
        if profile_to_delete is None:
            return Response(status=400)

        #get all scenes and delete them :(
        scenes_to_delete = profile_to_delete.scenes

        #delete all profiles assigned to the profile
        for scene in scenes_to_delete:
            db.session.delete(scene)

        #Delete the profile
        db.session.delete(profile_to_delete)
        db.session.commit()
        return Response(status=200)

    #If the profile hasn't been found, respond with an HTTP status of 400
    except:
        db.session.rollback()
        return Response(status=400)

@socketio.on('message')
def handleMessage(msg):
    universe = 0


#listen for change of one dimmer
@socketio.on("dimmer_msg")
def handleDimmer(json):
    global current_universes
    global current_dmx_frames
    global mapped_dmx_frames
    tmpID = current_universes[int(json["universe"])].get("id")

    current_dmx_frames[tmpID][int(json["faderID"])] = int(json["faderValue"])
    mapped_dmx_frames[tmpID][int(json["faderID"])] = mapMasterValue(json["faderValue"])

    client = wrapper.Client()
    client.SendDmx(tmpID, mapped_dmx_frames[tmpID], DmxSent)
    #Emit a message to all connected clients to inform over dmx change
    emit('dmx_change', json , broadcast=True, include_self = False)

#Listen for a change of all_fader values (e.g. in case of a clicked scene)
@socketio.on("all_fader_values")
def getAllFaderValues(json):
    global current_dmx_frames
    global current_universes
    client = wrapper.Client()
    for i in json["data"]:
        tmpID = current_universes[int(i)].get("id")

        newArray = array.array("B")
        newArray.fromlist(json["data"][i])
        current_dmx_frames[tmpID] = newArray

        newMappedArray = array.array("B")
        mappedList = map(mapMasterValue ,json["data"][i])
        newMappedArray.fromlist(mappedList)
        mapped_dmx_frames[tmpID] =newMappedArray

        client.SendDmx(tmpID,mapped_dmx_frames[tmpID], DmxSent)

# Listen for a change of the master_val
@socketio.on("master_val")
def setMasterValue(json):
    global current_master_value
    global current_dmx_frames
    current_master_value = json["data"]

    for uni in current_dmx_frames:
        tmpList = current_dmx_frames[uni]
        tmpList = map(mapMasterValue,tmpList.tolist())
        newArray = array.array("B")
        newArray.fromlist(tmpList)
        mapped_dmx_frames[uni] = newArray
        client.SendDmx(uni, mapped_dmx_frames[uni], DmxSent)

    emit('master_val', current_master_value , broadcast=True, include_self = False)

# Listen for a change of one or more Fader -> e.g. when changing a group fader
@socketio.on("some_fader_change")
def setSomeFader(json):
    global current_dmx_frames
    global current_universes
    data = json["data"]

    for uniID in data:
        realUniID = current_universes[ int(uniID) ]["id"]
        print(realUniID)
        for faderID in data[uniID]:
            current_dmx_frames[ realUniID ][ int(faderID) ] = data[ uniID ][ faderID ]

        client.SendDmx( realUniID, current_dmx_frames[ realUniID ], DmxSent)

    emit('some_fader_change', data , broadcast=True, include_self = False)




def mapMasterValue(oldValue):
    newValue = int((oldValue/255.0) * current_master_value)
    return newValue

#Stop the wrapper after sending the dmx state
def DmxSent(state):
    wrapper.Stop()

# The callback function for processing the received DMX-Values
def DmxReceiverPrint(stateObject, universeNumber, dataInput):
    global mapped_dmx_frames

    data = dataInput
    tmpFrame = array.array("B")
    mappedFrame = array.array("B")
    if dataInput is None:
        print("No dmx data found :(")
        for i in range(512):
            tmpFrame.append(0)
        current_dmx_frames[universeNumber] = tmpFrame
        mapped_dmx_frames[universeNumber] = tmpFrame
        return data

    for i in range(len(dataInput)):
        tmpFrame.append(dataInput[i])
        mappedFrame.append(mapMasterValue(dataInput[i]))
    for j in range(len(dataInput),512):
        tmpFrame.append(0)
        mappedFrame.append(0)
    current_dmx_frames[universeNumber] = tmpFrame
    mapped_dmx_frames[universeNumber] = mappedFrame
    print("succes! universe : " + str(universeNumber) + " data size : " + str(len(tmpFrame)))
    wrapper.Stop()
    return data

def DmxRec(newData):
    print("Received DMX")
    wrapper.Stop()

# The callback function for processing received Universe values
def Universes(status, universes):
    client = wrapper.Client()
    if status.Succeeded():
        global current_universes
        for uni in universes:
            tmp_uni = {}
            tmp_uni["name"] = uni.name
            tmp_uni["id"] = uni.id
            print('Universe %d' % uni.id)
            print('  - Name: %s' % uni.name)
            print('  - Merge mode: %s' %('LTP' if uni.merge_mode == Universe.LTP else 'HTP'))
            current_universes.append(tmp_uni)
            client.FetchDmx(uni.id, DmxReceiverPrint)

        print(current_universes)
    else:
        print('Error: %s' %(status.message))

if __name__ == '__main__':
    client = wrapper.Client()
    current_universes
    client.FetchUniverses(Universes)
    # Turn on the green LED
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(24, GPIO.OUT)
    GPIO.output(24, GPIO.HIGH)

    wrapper.Run()
    socketio.run(app, "0.0.0.0", 5000, debug=True)
