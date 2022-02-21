#!/bin/bash
export DISPLAY=:0
sudo xset s noblank
sudo xset s off
sudo xset -dpms
sleep 5
export XAUTHORITY=/home/pi/.Xauthority
sudo cec-client | ./control.sh &

sudo /usr/bin/chromium-browser --no-sandbox --noerrdialogs --disable-infobars --kiosk http://fileserver:58000 

#while true; do
#   sleep 10
#done
