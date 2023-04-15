import threading
import mido
import time

'''
Todo:
-make signal fader dependent
-fix button while fader active
-second value skipped, glaube nach stunden des verzweifelns es liegt am pult :]
'''

class Driver:
    def __init__(self):
        self.fader_values = [0] * 8 # sicherstellen dass alle fader bei startup auf 0 sind!
        self.general_buffer = []
        self.left_button_flag = False
        self.right_button_flag = False
        self.fader_touch_flag_1 = False
        self.fader_touch_1 = False
        self.outport = mido.open_output('USB MIDI Interface 1')
        self.inport = mido.open_input('USB MIDI Interface 0')

        self.last_value = None
        self.last_time = None
        self.current_time = None
        self.thread1 = None

        thread = threading.Thread(target=self.input)
        thread.start() 
        print("Driver Initiated")


    def input(self):
        for message in self.inport:
            hex_message = ''.join(format(byte, '02X') for byte in message.bytes())

            #print(hex_message)

            if hex_message == 'B00F00': # Fader
                self.fader_touch_flag_1 = True
                continue
            elif (hex_message == 'B02F40') & self.fader_touch_flag_1:
                self.fader_touch_1 = True
                self.fader_touch_flag_1 = False
                print("FADER 1 ACTIVE")
                continue
            elif (hex_message == 'B02F00') & self.fader_touch_flag_1:
                self.fader_touch_1 = False
                self.fader_touch_flag_1 = False
                print("FADER 1 INACTIVE")
                continue
            elif (self.fader_touch_1):
                self.general_buffer.append(hex_message)
                if (len(self.general_buffer) > 1):
                    position = self.parse_fader_position(self.general_buffer[0], self.general_buffer[1])
                    self.fader_values[0] = self.map_14bit_to_8bit(position)
                    self.general_buffer.pop()
                    self.general_buffer.pop()

                    # interpolate to simulate the double resolution (7 bit to 8 bit)
                    value = self.fader_values[0]
                    self.current_time = time.monotonic()
                    if self.last_time is not None:
                        time_to_sleep = (self.current_time - self.last_time) / 2.0 - 0.001
                        if time_to_sleep > 0:
                            self.thread1 = threading.Thread(target=self.interpolate_thread, args=(value, time_to_sleep))
                            self.thread1.start()
                    else:    
                        self.last_time = self.current_time
                        self.last_value = value

                continue
                #Fader end
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
            

    def parse_fader_position(self, hex1, hex2):
        msb = int(hex1[-2:], 16)
        #lsb = int(hex2[-2:], 16) # kann ignoriert werden für 7 bit
        position = (msb << 7) #| lsb
        return position

    def map_14bit_to_8bit(self, value_14bit):
        value_8bit = (value_14bit >> 6) & 0xFF
        return value_8bit

    def interpolate_thread(self, value, time_to_sleep):
        while time.monotonic() < self.current_time + time_to_sleep:
            if value != self.fader_values[0] or not self.fader_touch_1:
                break
            time.sleep(0.01)
        if value == self.fader_values[0]:
            self.fader_values[0] = max(0, min(255, self.fader_values[0] + (value - self.last_value) / 2))
        self.last_time = self.current_time
        self.last_value = value

    def map_8bit_to_14bit(self, value_8bit):
        value_14bit = value_8bit << 6
        return value_14bit

    def pushFader(self,faderIndex, value):
        msb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[0], 16)
        lsb = int(self.to_msb_lsb(self.map_8bit_to_14bit(value))[1], 16)
        faderIndex = int(str(faderIndex), 16)
        msg1 = mido.Message('control_change', channel=0, control=int(str(faderIndex), 16), value=msb, time=0)
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