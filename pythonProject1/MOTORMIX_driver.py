import mido

FADER_VALUES = [7]
GENERAL_BUFFER = []
inport = ""
outport = mido.open_output('USB MIDI Interface 1')

LEFT_BUTTON_FLAG = False
RIGHT_BUTTON_FLAG = False
FADER_TOUCH_FLAG_1 = False
FADER_TOUCH_1 = False

class MOTORMIX:
    def __init__(self):
        self.inport = inport

def parse_fader_position(hex1, hex2):
    msb = int(hex1[-2:], 16)
    lsb = int(hex2[-2:], 16)
    position = (msb << 7) | lsb >> 1
    print(msb, lsb)
    return position

def map_14bit_to_8bit(value_14bit):
    value_8bit = (value_14bit >> 6) & 0xFF
    return value_8bit

def map_8bit_to_14bit(value_8bit):
    value_14bit = value_8bit << 6
    return value_14bit


def pushFader(faderIndex, value):
    msb = int(to_msb_lsb(map_8bit_to_14bit(value))[0], 16)
    lsb = int(to_msb_lsb(map_8bit_to_14bit(value))[1], 16)
    faderIndex = int(str(faderIndex), 16)
    msg1 = mido.Message('control_change', channel=0, control=int(str(faderIndex), 16), value=msb, time=0)
    msg2 = mido.Message('control_change', channel=0, control=int("2" + str(faderIndex), 16), value=lsb, time=0)
    outport.send(msg1)
    outport.send(msg2)

def to_msb_lsb(num):
    # Split number into two 7-bit parts
    msb = num >> 7  # Shift right by 7 bits
    lsb = num & 0x7F  # Bitwise AND with 0111 1111

    # Convert to hexadecimal string
    msb_hex = format(msb, '02X')  # 2 digits with leading zeros
    lsb_hex = format(lsb, '02X')  # 2 digits with leading zeros

    return msb_hex, lsb_hex


with mido.open_input('USB MIDI Interface 0') as inport:
    for message in inport:
        # Convert the incoming message to a hex string and strip any whitespace or '0x' prefix
        hex_message = ''.join(format(byte, '02X') for byte in message.bytes())


        # -------LEFT BUTTON BLOCK-------
        if hex_message == 'B00F08':
            LEFT_BUTTON_FLAG = True
        
        elif LEFT_BUTTON_FLAG:
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
            
            LEFT_BUTTON_FLAG = False


        # -------RIGHT BUTTON BLOCK-------
        if hex_message == 'B00F09':
            RIGHT_BUTTON_FLAG = True
        
        elif RIGHT_BUTTON_FLAG:
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
            
            RIGHT_BUTTON_FLAG = False

        

        # -----FADER 1-----
        if hex_message == 'B00F00':
            FADER_TOUCH_FLAG_1 = True
        
        elif (hex_message == 'B02F40') & FADER_TOUCH_FLAG_1:
            FADER_TOUCH_1 = True
            FADER_TOUCH_FLAG_1 = False
            print("FADER 1 ACTIVE")
        
        elif (hex_message == 'B02F00') & FADER_TOUCH_FLAG_1:
            FADER_TOUCH_1 = False
            FADER_TOUCH_FLAG_1 = False
            print("FADER 1 INACTIVE")

        if (FADER_TOUCH_1):
            GENERAL_BUFFER.clear
            GENERAL_BUFFER.append(hex_message)
            if (len(GENERAL_BUFFER) > 1):
                position = parse_fader_position(GENERAL_BUFFER[0], GENERAL_BUFFER[1])
                FADER_VALUES[0] = map_14bit_to_8bit(position)
                print(map_14bit_to_8bit(position))
                GENERAL_BUFFER.pop()
                GENERAL_BUFFER.pop()