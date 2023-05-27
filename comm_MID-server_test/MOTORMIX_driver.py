import threading
import mido
import time

'''
Todo:
-start interpolation earlier if possible?
-second value skipped, midi light check
-midi fader signals in intervals necessary? -> starting motormix after server... not necessary if there is a "motormix ready" signal
    -check for signal
        > 8 signal send on start: B04156 B04267 B0402B B04145 B04207 B04317 B04443 B0454B. Looks like Rotary values
    -alternativly ping?
-toggle button light when pressed
'''

class Driver:
    def __init__(self):
        self.fader_values      = [0] * 8 # values of MotorMix faders
        self.left_button_flag  = False
        self.right_button_flag = False
        self.fader_touch       = [False] * 8
        
        self.outport = mido.open_output('USB MIDI Interface 1')
        self.inport  = mido.open_input( 'USB MIDI Interface 0')
        
        self.current_page = 1
        #self.mode = "light"
        self.light_mode = True # False: Scene mode
        self.callback = None
        self.last_value   = [0] * 8
        self.last_time    = [float()] * 8
        self.current_time = [float()] * 8
        self.thread_interpolation = None
        self.lastActive           = None
        
        #self.device_values = [] # brightness for every device               
        self.slider_values = [] # value for every channel                   könnte man besser in eigene datei machen
        self.dmx_values    = [] # actual channel brightness                 könnte man besser in eigene datei machen
        
        threading.Thread(target=self.input).start() 
        print("Driver Initiated")
        self.pushFader(0, 255) # set master to 255

    def input(self):
        for message in self.inport:
            hex_message = ''.join(format(byte, '02X') for byte in message.bytes())

            print(hex_message)

            if hex_message.startswith('B00F0'): # Fader
                #print(hex_message[-1:])
                if self.lastActive != int(hex_message[-1:]):
                    self.lastActive = int(hex_message[-1:])
                continue
            elif hex_message.startswith('B02F4'):
                self.fader_touch[self.lastActive] = True
                self.last_time[self.lastActive] = time.monotonic() - 0.01
                print(f"FADER {self.lastActive} ACTIVE")
                continue
            elif hex_message.startswith('B02F0'):
                self.fader_touch[self.lastActive] = False
                print(f"FADER {self.lastActive} INACTIVE")
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
                elif hex_message == 'B02F42':
                    print("DEF pressed")
                elif hex_message == 'B02F43':
                    print("ALL pressed")
                elif hex_message == 'B02F44':
                    print("WIND pressed")
                elif hex_message == 'B02F45':
                    print("PLUG pressed")
                elif hex_message == 'B02F46':
                    print("SUS pressed")
                elif hex_message == 'B02F47':
                    print("ENBL pressed")
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
                self.right_button_flag = False
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
            faderIndex = faderIndex - start_index - 1 #(faderIndex % 7) - 1
        else: 
            return    
        
        msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[0], 16)
        lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[1], 16)
        faderIndex = int(str(faderIndex), 16)
        msg1 = mido.Message('control_change', channel=0, control=int(      str(faderIndex), 16), value=msb, time=0)
        msg2 = mido.Message('control_change', channel=0, control=int("2" + str(faderIndex), 16), value=lsb, time=0)
        self.outport.send(msg1)
        self.outport.send(msg2)

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