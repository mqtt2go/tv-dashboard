#!/bin/bash
#Autolog as Pi
#Update before install
sudo apt update
#sudo apt upgrade
#Install cec for HDMI control
sudo apt-get install --no-install-recommends cec-utils
#Install minimum GUI components
sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
#Install chromium
sudo apt-get install --no-install-recommends chromium-browser
#Update autostart file
sudo chmod 777 /etc/xdg/openbox/autostart
sudo echo 'xset -dpms            # turn off display power management system' >> /etc/xdg/openbox/autostart
sudo echo 'xset s noblank        # turn off screen blanking' >> /etc/xdg/openbox/autostart
sudo echo 'xset s off            # turn off screen saver' >> /etc/xdg/openbox/autostart
sudo echo $'sed -i \'s/"exited_cleanly":false/"exited_cleanly":true/\' ~/.config/chromium/\'Local State\'' >> /etc/xdg/openbox/autostart
sudo echo $'sed -i \'s/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/\' ~/.config/chromium/Default/Preferences' >> /etc/xdg/openbox/autostart
sudo echo 'chromium-browser  --noerrdialogs --disable-infobars --kiosk $KIOSK_URL' >> /etc/xdg/openbox/autostart
sudo echo '--check-for-update-interval=31536000' >> /etc/xdg/openbox/autostart
sudo chmod 755 /etc/xdg/openbox/environment
#Add KIOSK_URL to the openbox environment
sudo chmod 777 /etc/xdg/openbox/environment
sudo echo 'export KIOSK_URL=http://tvdashboard:58000/' >> /etc/xdg/openbox/environment
sudo chmod 755 /etc/xdg/openbox/autostart
#Make sure the xserver start on boot
FILE=/home/pi/.bash_profile
if [ -f "$FILE" ]; then
    echo "$FILE exists."
else 
    echo "$FILE does not exist. Creating and setting it up!"
	touch /home/pi/.bash_profile
	sudo echo '[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor' >> $FILE
	source /home/pi/.bash_profile	
fi


#Create the control script for the dashboard remote control
CONTROL=/home/pi/control.sh
if [ -f "$CONTROL" ]; then
    echo "$CONTROL exists."
else 
touch /home/pi/control.sh
sudo echo $'#!/bin/bash
pressed=0
lastBtn="1"
while read oneline
do
   keyline=$(echo $oneline | grep " key ")
   if [ -n "$keyline" ]; then
      last=`date +%s%3N`
      strkey=$(grep -oP \'(?<=sed: ).*?(?= \()\' <<< "$keyline")
      strstat=$(grep -oP \'(?<=key ).*?(?=:)\' <<< "$keyline")
      strpressed=$(echo $strstat | grep "pressed")

      if [ "$strkey" == "" ]; then
        continue
      fi

      if [ "$lastBtn" == "$strkey" ]; then
        pressed=$((pressed+1))
      fi

      if [ $pressed -eq 2 ]; then
        pressed=0
      fi

      lastBtn=$strkey

      echo "$pressed"

      if [ $pressed != 0 ]; then   
        continue
      fi

      if [ -n "$strpressed" ]; then
         case "$strkey" in
            "up")
                xdotool key "Up"
                ;;
            "down")
                xdotool key "Down"
                ;;
            "left")
                xdotool key "Left"
                ;;
            "right")
                xdotool key "Right"
                ;;
            "select")
                xdotool key "KP_Enter"
                ;;
            "exit")
                xdotool key "Escape"
                ;;
         esac
      fi 
   fi
done' >> $CONTROL
sudo chmod 775 $CONTROL
fi
#Create start script file
START=/home/pi/start.sh
if [ -f "$START" ]; then
    echo "$START exists."
else 
touch $START
sudo echo $'#!/bin/bash
export XAUTHORITY=/home/pi/.Xauthority; export DISPLAY=:0;
sudo cec-client | ./control.sh' >> $START
sudo chmod 775 $START
fi
(crontab -l 2>/dev/null; echo "@reboot /home/pi/start.sh") | crontab -

sudo apt-get install --no-install-recommends realvnc-vnc-server 
sudo raspi-config nonint do_vnc 0

sudo raspi-config nonint do_boot_behaviour B2
#Disable overscan
sudo raspi-config nonint do_overscan 1
