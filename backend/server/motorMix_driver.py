"""
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 *
 * @file motorMix_driver.py
"""
import threading
import mido
import time


class Driver:
    # -------------- Essential and Setup -----------------#
    def __init__(self):
        self.fader_values = [0] * 8  # values of MotorMix faders
        self.devices = []
        self.scenes = []
        self.socketio = None
        self.sceneQuickSelectStatus = [False] * 15

        # routing array for devices
        self.num_pages = 99
        self.num_devices_per_page = 7

        self.deviceRouting = [
            [None] * self.num_devices_per_page for _ in range(self.num_pages)
        ]
        self.sceneRouting = [
            [None] * self.num_devices_per_page for _ in range(self.num_pages)
        ]
        self.quickSceneButtonRouting = [
            ["LEFT", 7],
            ["LEFT", 6],
            ["LEFT", 5],
            ["LEFT", 4],
            ["LEFT", 3],
            ["LEFT", 2],
            ["LEFT", 1],
            ["LEFT", 0],
            ["RIGHT", 7],
            ["RIGHT", 6],
            ["RIGHT", 5],
            ["RIGHT", 4],
            ["RIGHT", 3],
            ["RIGHT", 2],
            ["RIGHT", 1],
        ]

        self.current_flagged_channel = 0
        self.left_button_flag = False
        self.right_button_flag = False
        self.navigation_button_flag = False
        self.fader_touch = [False] * 8
        self.channel_flag = False

        # self.outport = mido.open_output('USB MIDI Interface 1')
        # self.inport  = mido.open_input( 'USB MIDI Interface 0')
        # self.outport = mido.open_output("USB MIDI Interface MIDI 1")  # type: ignore
        # self.inport = mido.open_input("USB MIDI Interface MIDI 1")  # type: ignore
        # --MMix Config--#
        self.inport = None
        try:
            input_ports = mido.get_input_names()  # type: ignore
            for port in input_ports:
                print(port)
                self.inport = mido.open_input(port)  # type: ignore

            output_ports = mido.get_output_names()  # type: ignore
            for port in output_ports:
                print(port)
                self.outport = mido.open_output(port)  # type: ignore
        except:
            print("ERROR: Could not open MIDI Ports!")

        self.current_page = 1

        self.light_mode = True  # False: Scene mode
        self.callback = None
        self.sceneQuickCallback = None
        self.sceneCallback = None

        self.last_value = [0] * 8
        self.last_time = [float()] * 8
        self.current_time = [float()] * 8
        self.thread_interpolation = None
        self.last_active = None

        if self.inport is not None:
            threading.Thread(target=self.input).start()
            self.setup()
            print("Driver Initiated")
        # self.outport.send(mido.Message.from_hex('90 00 00')) # ping

    def input(self):
        if self.inport is None:
            return
        for message in self.inport:
            hex_message = "".join(format(byte, "02X") for byte in message.bytes())

            if hex_message.startswith(
                "B04"
            ):  # Checks if MototMix was restarted and sends fader positions again
                for faderIndex, value in enumerate(self.fader_values):
                    msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[0], 16)
                    lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[1], 16)
                    faderIndex = int(str(faderIndex), 16)
                    msg1 = mido.Message(
                        "control_change",
                        channel=0,
                        control=int(str(faderIndex), 16),
                        value=msb,
                        time=0,
                    )
                    msg2 = mido.Message(
                        "control_change",
                        channel=0,
                        control=int("2" + str(faderIndex), 16),
                        value=lsb,
                        time=0,
                    )
                    self.outport.send(msg1)
                    self.outport.send(msg2)

            if (
                hex_message.startswith("B00F0") and int(hex_message[5], 16) < 8
            ):  # Sets marker that a fader change in specified channel is incoming
                self.channel_flag = True
                self.current_flagged_channel = int(hex_message[5], 16)
                if self.last_active != int(hex_message[-1:]):
                    self.last_active = int(hex_message[-1:])
                continue
            elif (hex_message == "B02F40") & self.channel_flag:
                if self.last_active is not None:
                    self.fader_touch[self.last_active] = True
                    self.channel_flag = False
                    self.last_time[self.last_active] = time.monotonic() - 0.01
                continue
            elif (hex_message == "B02F00") & self.channel_flag:
                if self.last_active is not None:
                    self.fader_touch[self.last_active] = False
                    self.channel_flag = False
                continue
            # Recognizes fader change and sends it to the mapping function with the fader number and value to be mapped to curren occupation
            elif hex_message.startswith("B00") & hex_message[3].isdigit():
                fader = -1
                try:
                    fader = int(hex_message[3])
                    self.fader_values[fader] = int(hex_message[-2:], 16) * 2
                    self.fader_mapping(fader, self.fader_values[fader])
                except:
                    print("ERROR in sending value to fader: " + str(fader))

                # interpolation to simulate 7 to 8 bit
                self.current_time[fader] = time.monotonic()
                time_to_sleep = (
                    self.current_time[fader] - self.last_time[fader]
                ) / 2.0 - 0.001
                if time_to_sleep > 0:
                    threading.Thread(
                        target=self.interpolate_thread,
                        args=(self.fader_values[fader], time_to_sleep, fader),
                    ).start()
                continue
                # Fader end
            elif (
                hex_message.startswith("B02") & hex_message[3].isdigit()
            ):  # Unnecessary LSB
                continue

            # Channel Button-Block (Mute, Solo, Select, Max, Min)
            elif (hex_message == "B02F41") & self.channel_flag:
                self.channel_flag = False
            elif (hex_message == "B02F42") & self.channel_flag:
                self.channel_flag = False
            elif (hex_message == "B02F43") & self.channel_flag:
                self.channel_flag = False
            elif (
                hex_message == "B02F44"
            ) & self.channel_flag:  # set channel to 255 (max pressed)
                self.fader_mapping(self.current_flagged_channel, 255)
                self.pushFader(
                    self.deviceRouting[self.current_page - 1][
                        self.current_flagged_channel
                    ],
                    255,
                )
                self.channel_flag = False
            elif (
                hex_message == "B02F45"
            ) & self.channel_flag:  # set channel to 0 (min pressed)
                try:
                    self.pushFader(
                        self.deviceRouting[self.current_page - 1][
                            self.current_flagged_channel
                        ],
                        0,
                    )
                    self.fader_mapping(self.current_flagged_channel, 0)
                    self.channel_flag = False
                except Exception as e:
                    print(
                        f"ERROR: Could not push Fader: {self.current_flagged_channel} to Minimum! Error: {e}"
                    )

            elif hex_message == "B00F08":  # left Button-Block
                self.left_button_flag = True
            elif self.left_button_flag:
                if hex_message == "B02F40":
                    self.toggleSceneQuickSelect(7)
                elif hex_message == "B02F41":
                    self.toggleSceneQuickSelect(6)
                elif hex_message == "B02F42":
                    self.toggleSceneQuickSelect(5)
                elif hex_message == "B02F43":
                    self.toggleSceneQuickSelect(4)
                elif hex_message == "B02F44":
                    self.toggleSceneQuickSelect(3)
                elif hex_message == "B02F45":
                    self.toggleSceneQuickSelect(2)
                elif hex_message == "B02F46":
                    self.toggleSceneQuickSelect(1)
                elif hex_message == "B02F47":
                    self.toggleSceneQuickSelect(0)

                self.left_button_flag = False
            elif hex_message == "B00F09":  # right Button-Block
                self.right_button_flag = True
            elif self.right_button_flag:
                if hex_message == "B02F40":
                    print("Blackout")
                    self.blackout()

                elif hex_message == "B02F41":
                    print("MotorMix Scene 14")
                    self.toggleSceneQuickSelect(14)
                elif hex_message == "B02F42":
                    print("MotorMix Scene 13")
                    self.toggleSceneQuickSelect(13)
                elif hex_message == "B02F43":
                    print("MotorMix Scene 12")
                    self.toggleSceneQuickSelect(12)
                elif hex_message == "B02F44":
                    print("MotorMix Scene 11")
                    self.toggleSceneQuickSelect(11)
                elif hex_message == "B02F45":
                    print("MotorMix Scene 10")
                    self.toggleSceneQuickSelect(10)
                elif hex_message == "B02F46":
                    print("MotorMix Scene 9")
                    self.toggleSceneQuickSelect(9)
                elif hex_message == "B02F47":
                    print("MotorMix Scene 8")
                    self.toggleSceneQuickSelect(8)
                self.right_button_flag = False

            elif hex_message == "B00F0A":
                self.navigation_button_flag = True
            elif self.navigation_button_flag:
                if hex_message == "B02F42":
                    self.switchModes("light")
                if hex_message == "B02F43":
                    self.switchModes("scene")

                # Page forward and backward
                if hex_message == "B02F41":
                    self.rotary_pageUpdate(True)
                elif hex_message == "B02F40":
                    self.rotary_pageUpdate(False)
                self.navigation_button_flag = False
            elif hex_message == "B04841":
                self.rotary_pageUpdate(True)
            elif hex_message == "B04801":
                self.rotary_pageUpdate(False)

            else:
                # print("Unknown: " + hex_message)
                continue

    def switchModes(self, mode):
        if mode == "scene" and self.light_mode:
            self.current_page = 1
            self.light_mode = False
            self.setup()
        elif mode == "light" and not self.light_mode:
            self.current_page = 1
            self.light_mode = True
            self.setup()
        else:
            return

    def setup(self):
        self.clearDisplay()
        self.pushFader(0, 255)  # set master to 255
        for index in range(1, 8):  # every other fader to 0
            self.pushFader(index, 0)

        if self.light_mode:
            self.displayASCII_perChannel(7, 0, "LIGHT")
            self.deviceMapping()
            self.getDeviceValues()
        else:
            self.displayASCII_perChannel(7, 0, "SCENE")
            self.sceneMapping()
            self.getSceneValues()

        self.displayPageNumber(str(self.current_page))

    def reset(self):
        self.clearDisplay()
        for index in range(8):
            self.pushFader(index, 0)
        self.current_page = 1
        self.light_mode = True
        self.setup()

    def interpolate_thread(self, value, time_to_sleep, fader):
        while time.monotonic() < self.current_time[fader] + time_to_sleep:
            if value != self.fader_values[fader] or not self.fader_touch[fader]:
                break
            time.sleep(0.01)
        if value == self.fader_values[fader]:
            self.fader_values[fader] = max(
                0,
                min(
                    255,
                    self.fader_values[fader]
                    + (
                        1
                        if value > self.last_value[fader]
                        else (-1 if value < self.last_value[fader] else 0)
                    ),
                ),
            )
            self.fader_mapping(fader, self.fader_values[fader])
        self.last_time[fader] = self.current_time[fader]
        self.last_value[fader] = value

    def rotary_pageUpdate(self, forward):
        if forward:
            self.current_page = self.current_page + 1
        else:
            self.current_page = self.current_page - 1

        # range control
        if self.current_page < 1:
            self.current_page = 1
        if self.current_page > self.num_pages:
            self.current_page = self.num_pages

        self.displayPageNumber(str(self.current_page))
        if self.light_mode:
            self.update_deviceDisplay()
            self.getDeviceValues()
        else:
            self.update_sceneDisplay()
            # self.getSceneValues()

    # ----------------- Essential and Setup END -----------------

    # ----------------- Callbacks and Communication-----------------
    def set_callback(self, callback):
        self.callback = callback

    def set_sceneQuickCallback(self, sceneQuickCallback):
        self.sceneQuickCallback = sceneQuickCallback

    def set_sceneCallback(self, sceneCallback):
        self.sceneCallback = sceneCallback

    def map_8bit_to_14bit(self, value_8bit):
        value_14bit = value_8bit << 6
        return value_14bit

    def pushFader(self, number, value):
        if number == 0:  # If master fader is pushed
            self.fader_values[7] = value
            msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[0], 16)
            lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[1], 16)
            index = int(str(7), 16)
            msg1 = mido.Message(
                "control_change",
                channel=0,
                control=int(str(index), 16),
                value=msb,
                time=0,
            )
            msg2 = mido.Message(
                "control_change",
                channel=0,
                control=int("2" + str(index), 16),
                value=lsb,
                time=0,
            )
            self.outport.send(msg1)
            self.outport.send(msg2)
            self.displayFaderValues(index, value)
            return
        else:  # If any other fader is pushed
            for index in range(7):
                if (
                    self.deviceRouting[self.current_page - 1][index] == number
                    and self.light_mode
                ):
                    self.fader_values[index] = value
                    msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[0], 16)
                    lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[1], 16)
                    index = int(str(index), 16)
                    msg1 = mido.Message(
                        "control_change",
                        channel=0,
                        control=int(str(index), 16),
                        value=msb,
                        time=0,
                    )
                    msg2 = mido.Message(
                        "control_change",
                        channel=0,
                        control=int("2" + str(index), 16),
                        value=lsb,
                        time=0,
                    )
                    self.outport.send(msg1)
                    self.outport.send(msg2)
                    self.displayFaderValues(index, value)
                else:
                    pass

    def fader_mapping(self, fader, value):
        if self.light_mode:
            if fader == 7:
                number = 0
            else:
                number = self.deviceRouting[self.current_page - 1][fader]
            if number is not None and self.callback is not None:
                self.callback(number, value)
                self.displayFaderValues(fader, value)
        else:
            if fader == 7:
                number = 0
                if self.callback is not None:
                    self.callback(number, value)
            else:
                id = self.sceneRouting[self.current_page - 1][fader]
                if id is not None:
                    if self.sceneCallback is not None:
                        self.sceneCallback(id, value)
                    self.displayFaderValues(id, value)

    def to_msb_lsb(self, num):
        # Split number into two 7-bit parts
        msb = num >> 7
        lsb = num & 0x7F
        # Convert to hexadecimal string
        msb_hex = format(msb, "02X")
        lsb_hex = format(lsb, "02X")
        return msb_hex, lsb_hex

    # ----------------- Callbacks and Communication END -----------------

    # -------------------- Scene Quick select --------------------
    def toggleSceneQuickSelect(self, sceneIndex):
        if self.socketio is not None:
            if self.sceneQuickSelectStatus[sceneIndex] == False:
                if self.sceneQuickCallback is not None:
                    self.sceneQuickCallback(sceneIndex, True)
                self.sceneQuickSelectStatus[sceneIndex] = True

            elif self.sceneQuickSelectStatus[sceneIndex] == True:
                if self.sceneQuickCallback is not None:
                    self.sceneQuickCallback(sceneIndex, False)
                self.sceneQuickSelectStatus[sceneIndex] = False

        else:
            return

    def quickSceneButtonUpdate(self, sceneIndex, state):
        if sceneIndex < len(self.quickSceneButtonRouting):
            self.button_LED(
                self.quickSceneButtonRouting[sceneIndex][0],
                self.quickSceneButtonRouting[sceneIndex][1],
                state,
            )
            self.sceneQuickSelectStatus[sceneIndex] = state

    # -------------------- Scene Quick select END--------------------

    # -------------------- Blackout --------------------
    def blackout(self):
        for device in self.devices:
            if self.callback is not None:
                self.callback(device["id"], 0)
            self.pushFader(device["id"], 0)
            time.sleep(0.2)  # temporär

    # -------------------- Blackout END--------------------

    # -------------------- LCD Display --------------------
    def displayASCII_perChannel(self, channel, row, text):
        HEADER = "F0 00 01 0F 00 11 00"
        END = "F7"

        if len(text) > 5:
            text = text[:5]
        if len(text) < 5:
            text = text + " " * (5 - len(text))

        # Calculate the starting address based on channel and row
        ADDRESS = row * 40 + (channel * 5)

        # Convert the text to ASCII character values
        ascii_values = " ".join("{:02X}".format(ord(c)) for c in text)

        # Construct the final HEX string
        hex_string = f"{HEADER} 10 {ADDRESS:02X} {ascii_values} {END}"

        # Send the MIDI message
        self.outport.send(mido.Message.from_hex(hex_string))

    def displayASCII(self, channel, row, text):
        HEADER = "F0 00 01 0F 00 11 00"
        END = "F7"

        # Calculate the starting address based on channel and row
        ADDRESS = row * 40 + channel

        # Convert the text to ASCII character values
        ascii_values = " ".join("{:02X}".format(ord(c)) for c in text)

        # Construct the final HEX string
        hex_string = f"{HEADER} 10 {ADDRESS:02X} {ascii_values} {END}"

        # Send the MIDI message
        self.outport.send(mido.Message.from_hex(hex_string))

    def clearDisplay(self):
        # Clear both rows by sending spaces to all character positions
        for row in range(2):
            for channel in range(40):
                self.displayASCII(channel, row, " ")

    def clearChannel(self, channel):
        # Clear both rows by sending spaces to all character positions
        for row in range(2):
            self.displayASCII_perChannel(channel, row, "     ")

    def displayFaderValues(self, channel, value):
        value = (value / 255) * 100
        self.displayASCII_perChannel(channel, 1, "     ")
        self.displayASCII_perChannel(channel, 1, (str(int(value))) + "%")

    # -------------------- LCD Display END --------------------

    # -------------------- page Display --------------------
    def displayPageNumber(self, pageNumber):
        hex_string = "F0 00 01 0F 00 11 00 12 "

        if int(pageNumber) < 10:
            pageNumber = "0" + str(pageNumber)

        for char in pageNumber:
            ascii_val = ord(char)
            hi_nibble = ascii_val >> 4
            lo_nibble = ascii_val & 0x0F
            hex_string += (
                format(hi_nibble, "02X") + " " + format(lo_nibble, "02X") + " "
            )

        hex_string += "F7"
        self.outport.send(mido.Message.from_hex(hex_string))

    # -------------------- page Display END --------------------

    # -------------------- Button LED -------------------
    def button_LED(self, buttonGroup, buttonIndex, state):
        syntax_on = "B0 2C 4"
        syntax_off = "B0 2C 0"

        if buttonGroup == "LEFT":
            prefix = "B0 0C 08"
            if state == 1:
                message = syntax_on + str(buttonIndex)
                self.outport.send(mido.Message.from_hex(prefix))
                self.outport.send(mido.Message.from_hex(message))
            if state == 0:
                message = syntax_off + str(buttonIndex)
                self.outport.send(mido.Message.from_hex(prefix))
                self.outport.send(mido.Message.from_hex(message))
        if buttonGroup == "RIGHT":
            prefix = "B0 0C 09"
            if state == 1:
                message = syntax_on + str(buttonIndex)
                self.outport.send(mido.Message.from_hex(prefix))
                self.outport.send(mido.Message.from_hex(message))
            if state == 0:
                message = syntax_off + str(buttonIndex)
                self.outport.send(mido.Message.from_hex(prefix))
                self.outport.send(mido.Message.from_hex(message))

    def channel_button_LED(self, channel, index, state):
        prefix = "B0 0C 0"
        syntax_on = " 2C 4"
        syntax_off = " 2C 0"

        message = prefix + str(channel) + syntax_on + str(index)

    # -------------------- Button LED END --------------------

    # -------------------- Device Mode Functions--------------------
    def update_deviceDisplay(self):
        for channel in range(7):
            self.displayASCII_perChannel(
                channel, 0, str(self.deviceRouting[self.current_page - 1][channel])
            )

            # push Fader to 0 if device is not assigned
            if self.deviceRouting[self.current_page - 1][channel] == None:
                self.displayFaderValues(channel, 0)
                msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(0))[0], 16)
                lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(0))[1], 16)
                index = int(str(7), 16)
                msg1 = mido.Message(
                    "control_change",
                    channel=0,
                    control=int(str(channel), 16),
                    value=msb,
                    time=0,
                )
                msg2 = mido.Message(
                    "control_change",
                    channel=0,
                    control=int("2" + str(channel), 16),
                    value=lsb,
                    time=0,
                )
                self.outport.send(msg1)
                self.outport.send(msg2)

    def getDeviceValues(self):
        if self.devices is not None:
            for device in self.devices:
                # find the 7 devices for the current page
                if device["id"] in self.deviceRouting[self.current_page - 1]:
                    # find the channel for the current device
                    for channel in device["attributes"]["channel"]:
                        if channel["id"] == 0:
                            self.pushFader(device["id"], channel["sliderValue"])
                            break

    def deviceMapping(self):
        self.num_pages = (len(self.devices) - 1) // 7 + 4
        for page in range(1, self.num_pages):
            for channel in range(7):
                fader_number = (page - 1) * 7 + channel + 1
                if fader_number < len(self.devices):
                    deviceNumber = self.devices[fader_number]["number"]
                    self.deviceRouting[page - 1][channel] = deviceNumber

            self.update_deviceDisplay()
            self.getDeviceValues()

        return

    # -------------------- Device Mode Functions END--------------------

    # -------------------- Scene Mode Functions--------------------
    def update_sceneDisplay(self):
        for channel in range(6):
            self.clearChannel(channel)

        scenes_on_this_page = self.sceneRouting[self.current_page - 1]
        index = 0
        for scene in scenes_on_this_page:
            index = index + 1
            if scene is not None:
                name = str(self.scenes[scene]["name"])
                self.displayASCII_perChannel(
                    scene, 0, str(self.generate_abbreviation(name))
                )
                self.displayFaderValues(scene, 0)
                lastSceneIndex = scene
            else:
                lastSceneIndex = index
                self.displayFaderValues(lastSceneIndex, 0)
                msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(0))[0], 16)
                lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(0))[1], 16)
                index = int(str(7), 16)
                msg1 = mido.Message(
                    "control_change",
                    channel=0,
                    control=int(str(lastSceneIndex), 16),
                    value=msb,
                    time=0,
                )
                msg2 = mido.Message(
                    "control_change",
                    channel=0,
                    control=int("2" + str(lastSceneIndex), 16),
                    value=lsb,
                    time=0,
                )
                self.outport.send(msg1)
                self.outport.send(msg2)

    def init_scene_routing(self):
        # Initialize sceneRouting with placeholders for integers (-1 if the scene is not set)
        self.sceneRouting = [[-1 for _ in range(7)] for _ in range(self.num_pages)]

    def sceneMapping(self):
        self.num_pages = (len(self.scenes) - 1) // 7 + 2
        self.init_scene_routing()  # Initialize sceneRouting with the new num_pages
        for page in range(1, self.num_pages):
            for channel in range(7):
                fader_number = (page - 1) * 7 + channel
                if fader_number < len(self.scenes):
                    sceneId = self.scenes[fader_number]["id"]
                    self.sceneRouting[page - 1][channel] = sceneId

        if not self.light_mode:
            self.update_sceneDisplay()

        return

    def getSceneValues(self):
        print("getSceneValues")

    def generate_abbreviation(self, word):
        word = word.upper()

        abbreviation = word[0]
        consonant_count = 0
        i = 1
        while consonant_count < 3 and i < len(word):
            if word[i] not in "AEIOU":
                abbreviation += word[i]
                consonant_count += 1
            i += 1

        while len(abbreviation) < 4:
            abbreviation += " "
        return abbreviation

    # -------------------- Scene Mode Functions END--------------------
