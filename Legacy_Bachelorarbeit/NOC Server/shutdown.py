#
#Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
#Martrikelnummer : 1111 0647
#Stand : 13.03.2019
#

#!!! LEDIGLICH DER MARKIERTE BEREICH WURDE IN EIENGLEISTUNG ERSTELLT !!!
# Script bezogen von https://www.quartoknows.com/page/raspberry-pi-shutdown-button

import RPi.GPIO as GPIO

import time

import os

GPIO.setmode(GPIO.BCM)

GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def Shutdown(channel):

    print("Shutting Down")

    #=========== BEGIN EIGENLEISTUNG ====================
    # Das Blinken der grünen LED wird hier eingestellt
    GPIO.setup(24, GPIO.OUT)

    GPIO.output(24, GPIO.LOW)

    time.sleep(1)
    GPIO.output(24, GPIO.LOW)
    time.sleep(0.2)
    GPIO.output(24, GPIO.HIGH)
    time.sleep(0.2)
    GPIO.output(24, GPIO.LOW)
    time.sleep(0.2)
    GPIO.output(24, GPIO.HIGH)
    time.sleep(0.2)
    GPIO.output(24, GPIO.LOW)
    time.sleep(0.2)
    GPIO.output(24, GPIO.HIGH)
    time.sleep(0.2)
    GPIO.output(24, GPIO.LOW)
    time.sleep(0.2)
    #=========== ENDE EIGENLEISTUNG ====================
    os.system("sudo shutdown -h now")



# Add our function to execute when the button pressed event happens

GPIO.add_event_detect(18, GPIO.FALLING, callback=Shutdown, bouncetime=2000)



# Now wait!

while 1:

    time.sleep(10)
