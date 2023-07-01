import threading
import mido
import time
#import url
import requests
#from routes import devices


'''
Todo:
-start interpolation earlier if possible?
-second value skipped, midi light check
-midi fader signals in intervals necessary? -> starting motormix after server... min. 3 Rotary values send on start
    -alternativly ping?
-toggle button light when pressed
'''

class Driver:
    def __init__(self):
        self.fader_values      = [0] * 8 # values of MotorMix faders
        self.left_button_flag  = False
        self.right_button_flag = False
        self.fader_touch       = [False] * 8
        self.fader_touch_flag  = False
        
        #self.outport = mido.open_output('USB MIDI Interface 1')
        #self.inport  = mido.open_input( 'USB MIDI Interface 0')
        #--MMix Config - DONT CHANGE -
        self.outport = mido.open_output('USB MIDI Interface MIDI 1')
        self.inport  = mido.open_input( 'USB MIDI Interface MIDI 1')
        
        self.current_page = 1
        self.light_mode = True # False: Scene mode
        self.callback = None
        self.last_value   = [0] * 8
        self.last_time    = [float()] * 8
        self.current_time = [float()] * 8
        self.thread_interpolation = None
        self.last_active          = None
        
        threading.Thread(target=self.input).start() 
        print("Driver Initiated")
        
        #-------------------- SETUP --------------------
        self.setup()
        #-------------------- SETUP END --------------------
        
        
            
        #self.outport.send(mido.Message.from_hex('90 00 00')) # ping

    def input(self):
        for message in self.inport:
            hex_message = ''.join(format(byte, '02X') for byte in message.bytes())

           # print(hex_message)
            
            if hex_message.startswith('B04'): # Rotory message but potentially startup -> push faders, pages, display, button lights ??? Maybe not best practice
                for faderIndex, value in enumerate(self.fader_values):
                    msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[0], 16)
                    lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[1], 16)
                    faderIndex = int(str(faderIndex), 16)
                    msg1 = mido.Message('control_change', channel=0, control=int(      str(faderIndex), 16), value=msb, time=0)
                    msg2 = mido.Message('control_change', channel=0, control=int("2" + str(faderIndex), 16), value=lsb, time=0)
                    self.outport.send(msg1)
                    self.outport.send(msg2)
                
            if hex_message.startswith('B00F0') and int(hex_message[5], 16) < 8: # Fader
                self.fader_touch_flag = True
                if self.last_active != int(hex_message[-1:]):
                    self.last_active = int(hex_message[-1:])
                continue
            elif (hex_message == 'B02F40') & self.fader_touch_flag:
                self.fader_touch[self.last_active] = True
                self.fader_touch_flag = False
                self.last_time[self.last_active] = time.monotonic() - 0.01
                print(f"FADER {self.last_active} ACTIVE")
                continue
            elif (hex_message == 'B02F00') & self.fader_touch_flag:
                self.fader_touch[self.last_active] = False
                self.fader_touch_flag = False
                print(f"FADER {self.last_active} INACTIVE")
                continue
            elif hex_message.startswith('B00') & hex_message[3].isdigit(): # Fader movement
                fader = int(hex_message[3])
                self.fader_values[fader] = int(hex_message[-2:], 16) * 2
                self.fader_mapping(fader, self.fader_values[fader])
                
                # interpolation to simulate 7 to 8 bit
                self.current_time[fader] = time.monotonic()
                time_to_sleep = (self.current_time[fader] - self.last_time[fader]) / 2.0 - 0.001
                if time_to_sleep > 0:
                    threading.Thread(target=self.interpolate_thread, args=(self.fader_values[fader], time_to_sleep, fader)).start()
                continue
                #Fader end
            elif hex_message.startswith('B02') & hex_message[3].isdigit(): # Unnecessary LSB
                #print("LSB:", hex_message)
                continue
            elif hex_message == 'B00F08': # left Button-Block
                self.left_button_flag = True
            elif self.left_button_flag:
                if hex_message == 'B02F40':
                    print("SHIFT pressed")
                elif hex_message == 'B02F41':
                    print("UNDO pressed")
                    self.clearDisplay()
                    self.clear_pageNumber()
                elif hex_message == 'B02F42':
                    print("DEF pressed")
                    self.clearChannel(2)
                elif hex_message == 'B02F43':
                    print("ALL pressed")
                    self.sevenSegment("AB")
                elif hex_message == 'B02F44':
                    print("WIND pressed")
                elif hex_message == 'B02F45':
                    print("PLUG pressed")
                elif hex_message == 'B02F46':
                    print("SUS pressed")
                elif hex_message == 'B02F47':
                    self.setup()

                self.left_button_flag = False
            elif hex_message == 'B00F09': # right Button-Block
                self.right_button_flag = True
            elif self.right_button_flag:
                if hex_message == 'B02F40':
                    print("ESC pressed")
                elif hex_message == 'B02F41':
                    print("ENTER pressed")
                elif hex_message == 'B02F42':
                    print("LAST pressed")
                elif hex_message == 'B02F43':
                    print("NEXT pressed")
                elif hex_message == 'B02F44':
                    print("REWIND pressed")
                elif hex_message == 'B02F45':
                    print("FWD pressed")
                elif hex_message == 'B02F46':
                    print("STOP pressed")
                elif hex_message == 'B02F47':
                    print("PLAY pressed")
                    self.button_LED("LEFT", 0, 0)
                    self.button_LED("RIGHT", 2, 1)

                self.right_button_flag = False
                
            elif hex_message == 'B04841':
                self.rotary_pageUpdate(True)
                
            elif hex_message == 'B04801':
                self.rotary_pageUpdate(False)

            
            else:
                print("Unknown: " + hex_message)    
            
    '''
    def parse_fader_position(self, hex1, hex2):
        msb = int(hex1[-2:], 16)
        #lsb = int(hex2[-2:], 16) # kann ignoriert werden für 7 bit
        position = (msb << 7) #| lsb
        return position

    def map_14bit_to_8bit(self, value_14bit):
        value_8bit = (value_14bit >> 6) & 0xFF
        return value_8bit
    '''

    def setup(self):
            self.pushFader(0, 255) # set master to 255
            for index in range(1, 8): # every other fader to 0
                self.pushFader(index, 0)
            self.clearDisplay()
            self.displayASCII_perChannel(7,0,"MSTER")
            self.displayASCII(34,0,"|")
            self.displayASCII(34,1,"|")
            self.displayASCII(3,1, "%"), self.displayASCII(8,1, "%"), self.displayASCII(13,1, "%"), self.displayASCII(18,1, "%")
            self.displayASCII(23,1, "%"), self.displayASCII(28,1, "%"), self.displayASCII(33,1, "%"), self.displayASCII(38,1, "%")
            self.displayPageNumber(str(self.current_page))

    
    def interpolate_thread(self, value, time_to_sleep, fader):
        while time.monotonic() < self.current_time[fader] + time_to_sleep:
            if value != self.fader_values[fader] or not self.fader_touch[fader]:
                break
            time.sleep(0.01)
        if value == self.fader_values[fader]:
            #self.fader_values[0] = max(0, min(255, self.fader_values[0] + (value - self.last_value) / 2)) # +- half the difference of last step
            # +-1 instead of half value, depending on fader direction (to avoid fader mismatch after quick moves)
            self.fader_values[fader] = max(0, min(255, self.fader_values[fader] + (1 if value > self.last_value[fader] else (-1 if value < self.last_value[fader] else 0))))
            self.fader_mapping(fader, self.fader_values[fader])
        self.last_time[fader] = self.current_time[fader]
        self.last_value[fader] = value

    def set_callback(self, callback):
            self.callback = callback

    def map_8bit_to_14bit(self, value_8bit):
        value_14bit = value_8bit << 6
        return value_14bit

    def pushFader(self, faderIndex, value):
        # Fader mapping
        start_index = (self.current_page - 1) * 7
        end_index = self.current_page * 7
        
        if faderIndex == 0:
            faderIndex = 7
        elif start_index < faderIndex <= end_index:
            faderIndex = faderIndex - start_index - 1
        else: 
            return    
        
        self.fader_values[faderIndex] = value
        msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[0], 16)
        lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[1], 16)
        faderIndex = int(str(faderIndex), 16)
        msg1 = mido.Message('control_change', channel=0, control=int(      str(faderIndex), 16), value=msb, time=0)
        msg2 = mido.Message('control_change', channel=0, control=int("2" + str(faderIndex), 16), value=lsb, time=0)
        self.outport.send(msg1)
        self.outport.send(msg2)
        self.displayFaderValues(faderIndex, value)

    #-------------------- LCD Display --------------------
    def displayASCII_perChannel(self, channel, row, text):
        HEADER = "F0 00 01 0F 00 11 00"
        END = "F7"

        # Calculate the starting address based on channel and row
        ADDRESS = row * 40 + (channel*5)

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
        self.displayASCII_perChannel(channel, 1, ( str(int(value))) + "%" )
    #-------------------- LCD Display END --------------------
    
    #-------------------- page Display --------------------
    
    def displayPageNumber(self, pageNumber):
        hex_string = "F0 00 01 0F 00 11 00 12 "
        
        if int(pageNumber) < 10:
            pageNumber = "0" + str(pageNumber)
        
        for char in pageNumber:
            ascii_val = ord(char)
            hi_nibble = ascii_val >> 4
            lo_nibble = ascii_val & 0x0F
            hex_string += format(hi_nibble, '02X')+ " " + format(lo_nibble, '02X') + " "
        
        hex_string += "F7"
        print(hex_string)
        self.outport.send(mido.Message.from_hex(hex_string))

    #-------------------- page Display END --------------------

    #-------------------- Button LED --------------------
    def button_LED(self, buttonGroup, buttonIndex, state):
        syntax_on = "B0 2C 4"
        syntax_off = "B0 2C 0"
        
        if buttonGroup == "LEFT":
            prefix = "B0 0C 08"
            if state == 1:
                message = syntax_on + str(buttonIndex)
            if state == 0:
                message = syntax_off + str(buttonIndex)
            self.outport.send(mido.Message.from_hex(prefix))
            self.outport.send(mido.Message.from_hex(message))
        if buttonGroup == "RIGHT":
            prefix = "B0 0C 09"
            if state == 1:
                message = syntax_on + str(buttonIndex)
            if state == 0:
                message = syntax_off + str(buttonIndex)
            self.outport.send(mido.Message.from_hex(prefix))
            self.outport.send(mido.Message.from_hex(message))    
    #-------------------- Button LED END --------------------
    def to_msb_lsb(self, num):
        # Split number into two 7-bit parts
        msb = num >> 7 
        lsb = num & 0x7F
        # Convert to hexadecimal string
        msb_hex = format(msb, '02X')
        lsb_hex = format(lsb, '02X')
        return msb_hex, lsb_hex
    
    def fader_mapping(self, fader, value):
        if fader == 7:
            faderNew = 0
        else:
            faderNew = (self.current_page - 1) * 7 + fader + 1
            
        self.callback(faderNew, self.fader_values[fader])
        self.displayFaderValues(fader,value)
        
        
   #---------------- Channel Pull ----------------
   
    def rotary_pageUpdate(self, forward):
        if forward:
            self.current_page = self.current_page + 1
        else:
            self.current_page = self.current_page - 1
        
        #range control
        if self.current_page < 1:
            self.current_page = 1
        if self.current_page > 99:
            self.current_page = 99
        
          
        self.displayPageNumber(str(self.current_page))
        print(self.current_page)         
        #self.devicePull(self.current_page)  

    def devicePull(self, current_page):
        device_numbers = [device['number'] for device in self.devices]
        device_names = [device['name'] for device in devices]