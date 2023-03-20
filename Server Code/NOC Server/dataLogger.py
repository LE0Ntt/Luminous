#
#Diese Datei ist Teil der Bachelorarbeit von Fabian Schoettler
#Martrikelnummer : 1111 0647
#Stand : 13.03.2019
#

# This file loggs the cpu temperature and performance
from gpiozero import CPUTemperature
from time import sleep, strftime, time
import psutil
import csv

cpu = CPUTemperature()

nocProcesses = []

for proc in psutil.process_iter():
    if len(proc.cmdline())  == 2:
        if proc.cmdline()[1] == "/home/pi/NOC/NOC Server/noc_server.py":
            print("Hab ich Dich! %s"%proc)
            nocProcesses.append(proc)


with open("/home/pi/cpu_temp.csv", "a") as log:
    writer = csv.writer(log)
    while True:
        temp = cpu.temperature
        #Plot temp in a file
        writer.writerow([
            strftime("%Y-%m-%d %H:%M:%S"),
            str(temp),
            psutil.cpu_percent(),
            nocProcesses[0].status(),
            nocProcesses[1].status(),
            nocProcesses[0].cpu_percent(),
            nocProcesses[1].cpu_percent()
        ])

        #log.write("{0},{1}\n".format(strftime("%Y-%m-%d %H:%M:%S"),str(temp)),psutil.cpu_percent(interval=1),nocProcesses[0].status, nocProcesses[1].status, nocProcesses[0].cpu_percent(interval=1), nocProcesses[1].cpu_percent(interval=1))
        sleep(1)
