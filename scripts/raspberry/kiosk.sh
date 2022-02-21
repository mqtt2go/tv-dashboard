#!/bin/bash
export DISPLAY=:0
xset s noblank
xset s off
xset -dpms

unclutter -idle 0.5 -root &


/usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk http://fileserver:58000 &

while true; do
   sleep 10
done