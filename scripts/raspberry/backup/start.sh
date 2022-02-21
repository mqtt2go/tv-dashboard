#!/bin/bash
export XAUTHORITY=/home/pi/.Xauthority; export DISPLAY=:0;
sudo cec-client | /home/pi/control.sh
