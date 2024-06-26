# Introduction

**!!! Attention! This installation guide is still under development and the accuracy and functionality of the steps described may not be fully guaranteed. !!!**

This guide describes the exact installation and configuration of the Luminous backend. You will need a Linux server, in this case a Raspberry Pi 4 B and possibly other required resources.

Deutsche Version: [[Installationsanleitung - DE]]
English Version: [[Installation guide - EN]]

---

# Installation

## RaspberryPi

1. start by installing any version of Linux on your Raspberry Pi. In this guide we are using Raspberry Pi OS Lite 64-bit, but any other version of Linux should also work.
2. once the Linux distribution has been successfully installed, proceed to configure the Raspberry Pi for Luminous.
3. open a terminal or SSH connection to the Raspberry Pi.
4. first update the system with the following commands:

```bash
sudo apt update
sudo apt upgrade
```

5. install Git with the following command:

```bash
sudo apt install git
```

6. once the installation is complete, you can check whether Git has been successfully installed by executing the command `git --version`. If Git has been installed successfully, the installed version will be displayed.
7. check whether Python 3.9.2 is installed:

```bash
python3.9 --version
```

If Python 3.9.2 is installed, the version is displayed. If not, install Python 3.9.2 with the following commands:

```bash
cd /opt
sudo wget https://www.python.org/ftp/python/3.9.2/Python-3.9.2.tgz
sudo tar -xzf Python-3.9.2.tgz
cd Python-3.9.2
sudo ./configure --enable-optimisations
sudo make altinstall
```

8. check the installation of Python 3.9.2 again:

```bash
python3.9 --version
```

Your Raspberry Pi environment is now ready to proceed with the installation of Luminous.

---

## OLA

### General Information

We will provide comprehensive instructions on how to install OLA here. However, should difficulties arise, we refer you to the following resources, which also explain how to install OLA:

- [The Newbie Guide for OLA on Ubuntu](http://opendmx.net/index.php/The_Newbie_Guide_for_OLA_on_Ubuntu)
- [OLA - Linux install](https://www.openlighting.org/ola/linuxinstall/)

These instructions provide additional information and can be helpful in the event of problems.

### Install dependencies

To install all necessary dependencies for the proper functioning of OLA, you need some libraries. Some of them are available as packages in Linux distributions, while others need to be downloaded and compiled manually.

First, you need at least the following dependencies:

- cppunit
- uuid or ossp uuid
- pkg-config
- curses
- lex (or flex) _(we use flex)_
- yacc (or bison) _(we use bison)_
- the protocol buffers library [http://code.google.com/p/protobuf/](https://code.google.com/p/protobuf/) (version 2.3.0 or later)
- microhttpd [ftp://ftp.gnu.org/gnu/libmicrohttpd/](ftp://ftp.gnu.org/gnu/libmicrohttpd/) (wenn Sie die Web-Benutzeroberfläche möchten). Sie benötigen mindestens Version 0.4.0 von microhttpd.
- libtool
- automake
- autoconf

Here is an easy way to install these dependencies:

```bash
sudo apt-get install libcppunit-dev libcppunit-1.13-0 uuid-dev pkg-config libncurses5-dev libtool autoconf automake g++ libmicrohttpd-dev libmicrohttpd10 protobuf-compiler libprotobuf-lite10 python-protobuf libprotobuf-dev libprotoc-dev zlib1g-dev bison flex make libftdi-dev libftdi1 libusb-1.0-0-dev liblo-dev libavahi-client-dev python-numpy
```

_π version?_

```
sudo apt install build-essential autoconf libtool pkg-config libcppunit-dev libmicrohttpd-dev zlib1g-dev libftdi-dev libusb-1.0-0-dev protobuf-compiler libprotobuf-dev python3-protobuf libprotoc-dev liblua5.3-dev
```

The above is recommended, but if it does not work (ie: no direct internet connection), you can also download and install the packages manually.

1. Google for the package.
2. Download the archive. ($FILENAME.tar.gz)
3. Extract the contents. (Documents folder makes sense)
4. Open Terminal.
5. Type "'**cd $FILEPATH'**" then hit ENTER. (Example: “_cd /home/tux/Documents/bison-2.5_”)
6. Type "'**./configure'**" then hit ENTER. Wait for it to finish.
7. Type "'**make'**" then hit ENTER. Wait for it to finish.
8. Type "'**make check'**" then hit ENTER. Wait for it to finish.
9. Type "'**sudo make install'**" then hit ENTER. Wait for it to finish.

Do this for all dependancies.

Once all dependencies have been installed, enter `sudo ldconfig` in the console to make the new libraries usable.

```bash
sudo ldconfig
```

This should install all the necessary dependencies for OLA.

### Installing OLA

Check out the git repo with the following command:

```bash
git clone https://github.com/OpenLightingProject/ola.git ola
cd ola
```

Make sure that you have downloaded version 0.10.9 of OLA, as this is crucial for the following installation.

If you are installing OLA for the first time, run the command with `-i` to automatically install the missing files:

```bash
autoreconf -i
```

You have the option of passing additional options to `./configure`. Use:

```bash
./configure --help
```

to display all available options. One of the most popular options is `--enable-python-libs` to create the Python Client Module. If you want to use the RDM responder tests, also add `--enable-rdm-tests`.

For our installation, we recommend using `--enable-python-libs` and `--enable-rdm-tests`. We also use `make -j N`, where N is the number of CPU cores. Since the Raspberry Pi 4b has 4 cores, we use `make -j 4`:

```bash
./configure --enable-rdm-tests --enable-python-libs
make -j 4
make check
sudo make install
```

Finally, execute `sudo ldconfig` to be able to use the new libraries:

```bash
sudo ldconfig
```

OLA should now have been successfully installed.

### Execute OLA

To execute OLA, enter `olad` in the terminal.

```bash
olad
```

Visit the OLA web interface on your device at the following address `http://$yourdeviceIP:9090/`, if you see the web interface, it means that the OLA has been installed correctly.

---

## Backend server

The next step is to install Luminous on the Raspberry Pi. To do this, change to the directory `/home/pi/`:

```bash
cd /home/pi/
```

### Download

Download the Git repository and change to the corresponding directory:

```bash
git clone https://github.com/le0ntt/Luminous.git
cd Luminous
```

### Install dependencies

Make sure that all necessary dependencies are installed. To do this, execute the following commands:

```bash
cd Luminous/backend
pip install -r requirements.txt
```

### Configuration (GGF. ONLY)

Check and adjust the configuration files if necessary. This could include, for example, the customisation of database connections or API keys. To do this, open the configuration files in the editor of your choice and make the necessary changes.

### Starting the backend server

Start the backend server with the following command:

```bash
python3 server.py
```

At this stage you just want to check that there are no error messages. The output in the console should look something like this:

```bash
pi@raspberrypi:~/Luminous/backend $ python server.py
Ignored channels when checking: {1: [18, 16, 13], 2: [201, 202, 203, 204, 205, 207, 208, 209, 210, 211, 213, 214, 215, 216, 217, 219, 220, 221, 222, 223, 225, 226, 227, 228, 229, 231, 232, 233, 234, 235, 237, 238, 239, 240, 241]}.
Setting up...
Setup done
/home/pi/luminous/Luminous2/Luminous/backend/server/led_control.py:22: RuntimeWarning: This channel is already in use, continuing anyway.  Use GPIO.setwarnings(False) to disable warnings.
  GPIO.setup(LED_PIN, GPIO.OUT)
Possibly the MIDI interface is not connected. unknown port 'E-MU XMidi2X2:E-MU XMidi2X2 Midi Out 2 28:1'
No dmx_channel key for non-master channel
 * Serving Flask app 'server'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.178.46:5000
Press CTRL+C to quit
```

If it does not look like this, get help.

If the output looks like this or similar, you can stop the server again with `CTRL+C` and go to the next step.

### Setting up the autostart

1. create a new service file in the directory `/etc/systemd/system/`. A suitable name would be `Luminous.service`.
2. open the file with an editor and add the following content:

```ini
[Unit]
Description=Luminous Service
After=network-online.target ola.service
Wants=network-online.target

[Service]
User=pi
ExecStart=/usr/bin/python3 /home/pi/luminous/Luminous2/Luminous/backend/server.py
WorkingDirectory=/home/pi/luminous/Luminous2/Luminous/backend/
StandardOutput=journal+tty
StandardError=journal+file:/home/pi/luminous/logs/error.log+tty
TTYPath=/dev/tty3
Restart=always

[Install]
WantedBy=multi-user.target
```

3. save the file after editing.
4. activate the service so that it is started at boot time:

```sh
sudo systemctl enable Luminous.service
```

5. start the service immediately (optional):

```sh
sudo systemctl start Luminous.service
```

6. restart the Raspberry Pi to check the autostart:

```sh
sudo reboot
```

7. check the logs of the service to make sure that everything is working correctly:

```sh
sudo journalctl -u Luminous.service -f
```

These steps set up the autostart for the Luminous service and ensure that the service is started automatically when the system boots.
