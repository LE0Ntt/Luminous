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
 * @file led_control.py
"""
try:
    import RPi.GPIO as GPIO  # type: ignore

    LED_PIN = 24

    def setup():
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(LED_PIN, GPIO.OUT)
        turn_on_led()

    def turn_on_led():
        GPIO.output(LED_PIN, GPIO.HIGH)

    def turn_off_led():  # Not used yet
        GPIO.output(LED_PIN, GPIO.LOW)

    def cleanup():  # Not used yet
        turn_off_led()
        GPIO.cleanup()

except ModuleNotFoundError:
    print("RPi.GPIO module not found. Running without LED support.")

    def setup():
        pass

    def cleanup():
        print("Cleanup")
        pass
