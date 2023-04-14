import threading
import mido

class Driver:
    def __init__(self):
        self.fader_values = [7]#sicherstellen dass alle fader bei startup auf 0 sind!
        self.general_buffer = []
        self.left_button_flag = False
        self.right_button_flag = False
        self.fader_touch_flag_1 = False
        self.fader_touch_1 = False
        self.outport = mido.open_output('USB MIDI Interface 1')
        self.inport = mido.open_input('USB MIDI Interface 0')
        print("Driver Initiated")
        self.run()

    def run(self):
        thread = threading.Thread(target=self.input)
        thread.start()
        print("Driver running")

    def input(self):
        for message in self.inport:
            hex_message = ''.join(format(byte, '02X') for byte in message.bytes())

            if hex_message == 'B00F08':
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

            if hex_message == 'B00F09':
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

            if hex_message == 'B00F00':
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

            if (self.fader_touch_1):
                self.general_buffer.append(hex_message)
                if (len(self.general_buffer) > 1):
                    position = self.parse_fader_position(self.general_buffer[0], self.general_buffer[1])
                    self.fader_values[0] = self.map_14bit_to_8bit(position)
                    #print(self.map_14bit_to_8bit(position))
                    self.general_buffer.pop()
                    self.general_buffer.pop()

    def parse_fader_position(self, hex1, hex2):
        msb = int(hex1[-2:], 16)
        lsb = int(hex2[-2:], 16)
        position = (msb << 7) | lsb >> 1
        #print(msb, lsb)
        return position

    def map_14bit_to_8bit(self, value_14bit):
        value_8bit = (value_14bit >> 6) & 0xFF
        return value_8bit

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
        msb = num >> 7  # Shift right by 7 bits
        lsb = num & 0x7F  # Bitwise AND with 0111 1111

        # Convert to hexadecimal string
        msb_hex = format(msb, '02X')  # 2 digits with leading zeros
        lsb_hex = format(lsb, '02X')  # 2 digits with leading zeros

        return msb_hex, lsb_hex