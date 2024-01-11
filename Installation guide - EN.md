# Introduction

!!! Caution: This installation guide is a work in progress, and the accuracy of the provided steps is uncertain. Please proceed with caution, as we cannot guarantee the functionality at this stage. !!!

This guide describes the exact installation and configuration of the Luminous backend. You will need a Linux server, in this case a Raspberry Pi 4 B and possibly other required resources.

German Version: [[Installationsanleitung - DE]]
Englische Version: [[Installation guide - EN]]

# Installation

## RaspberryPi

1. Start by installing any version of Linux on your Raspberry Pi. In this guide we are using Raspberry Pi OS Lite 64-bit, but any other version of Linux should also work.
2. Once the Linux distribution has been successfully installed, proceed to configure the Raspberry Pi for Luminous.
3. Open a terminal or SSH connection to the Raspberry Pi.
4. First update the system with the following commands:

```bash
sudo apt update
sudo apt upgrade
```

5. Install Git with the following command:

```bash
sudo apt install git
```

6. Once the installation is complete, you can check whether Git has been successfully installed by executing the command `git --version`. If Git has been installed successfully, the installed version will be displayed.

Your Raspberry Pi environment is now ready to proceed with the installation of Luminous.

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
- avahi [avahi.org](http://www.avahi.org/) if you want discovery enabled.
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

## Backend Server
