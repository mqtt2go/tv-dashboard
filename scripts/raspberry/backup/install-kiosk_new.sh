#!/bin/bash
#Autolog as Pi
#Update before install
sudo apt update
#sudo apt upgrade
#Install cec for HDMI control
sudo apt-get install --no-install-recommends cec-utils xdotool
#Install minimum GUI components
sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
#Install chromium
sudo apt-get install --no-install-recommends chromium-browser
read -e -p "Do you want to install file server? (Options: y|Y, n,N) " choice
case ${choice:0:1} in
    y|Y )
        HOSTNAME=$(hostname)
        if [ "$HOSTNAME" == "zeroconf" ]; then
            sudo ./install.sh
            echo "Proceeding with file server installation!"
        else 
            read -e -p "The hostname is not set to zeroconf. Please input new hostname or y|Y to keep the default (fileserver): (Options: y|Y, <hostname>) " choice
            case ${choice:0:1} in
                y|Y )
                    echo "Setting hostname to default (fileserver)!"
                    sudo raspi-config nonint do_hostname fileserver
                ;;
                * )
                    echo "Setting hostname to $(choice)!"
                    sudo raspi-config nonint do_hostname $(choice)
                ;;
            esac
        fi
    ;;
    n|N ) 
       echo "Skipping file server installation."
    ;;
esac
##############################
#Create xserver.sh file
##############################
XSERVERSH=/home/pi/xserver.sh
if [ -f "$XSERVERSH" ]; then
    echo "$XSERVERSH already exists!"
else 
    echo "$XSERVERSH does not exist. Creating and setting it up!"
	touch $XSERVERSH
	echo $'#!/bin/bash
sudo startx -- -nocursor' >> $XSERVERSH
fi
##############################
#Create the xservice
##############################
XFILE=/usr/lib/systemd/system/xserver.service
if [ -f "$XFILE" ]; then
    echo "$XFILE already exists!"
else 
    echo "$XFILE does not exist. Creating and setting it up!"
	sudo touch $XFILE
	echo $'[Unit]
Description=MQTT2GO XSERVICE
#After=graphical.target systemd-user-sessions.service

[Service]
#Type=simple
ExecStart=/bin/bash /home/pi/xserver.sh

[Install]
WantedBy=multi-user.target' >> $XFILE
fi
sudo systemctl enable xserver.service
##############################
#Create the control script for the dashboard remote control
##############################
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
##############################
#Create cec.sh
##############################
CECSH=/home/pi/cec.sh
if [ -f "$CECSH" ]; then
    echo "$CECSH already exists!"
else 
    echo "$CECSH does not exist. Creating and setting it up!"
	touch $CECSH
	echo $'#!/bin/bash
export XAUTHORITY=/home/pi/.Xauthority; export DISPLAY=:0;
sudo cec-client | /home/pi/control.sh' >> $CECSH
fi
##############################
#Create the cecservice
##############################
CEC=/usr/lib/systemd/system/cec.service
if [ -f "$CEC" ]; then
    echo "$CEC already exists!"
else 
    echo "$CEC does not exist. Creating and setting it up!"
	sudo touch $CEC
	echo $'[Unit]
Description=MQTT2GO CEC
After=multi-user.target

[Service]
ExecStart=/bin/bash /home/pi/cec.sh

[Install]
WantedBy=multi-user.target' >> $CEC
fi
sudo systemctl enable cec.service
##############################
#Create the kiosk.sh
##############################
KIOSK_URL=http://fileserver:58000/
read -e -p "Do you want to change default kiosk URL? (Options: n|N, <address>) " choice
case ${choice:0:1} in
    n|N )
        echo "Proceeding with default kiosk URL."
    ;;
    * ) 
       echo "Setting $choice as default kiosk URL."
       KIOSK_URL=$choice
    ;;
esac
KIOSKSH=/home/pi/kiosk.sh
if [ -f "$KIOSKSH" ]; then
    echo "$KIOSKSH already exists!"
else 
    echo "$KIOSKSH does not exist. Creating and setting it up!"
	touch $KIOSKSH
	echo -e $"#!/bin/bash
sleep 7
export DISPLAY=:0
sudo xset s noblank
sudo xset s off
sudo xset -dpms

export XAUTHORITY=/home/pi/.Xauthority
sudo cec-client | /home/pi/control.sh &

sudo /usr/bin/chromium-browser --no-sandbox --noerrdialogs --disable-infobars --kiosk ${KIOSK_URL}" >> $KIOSKSH
fi
##############################
#Create the kioskservice
##############################
KIOSK=/usr/lib/systemd/system/kiosk.service
if [ -f "$KIOSK" ]; then
    echo "$KIOSK already exists!"
else 
    echo "$KIOSK does not exist. Creating and setting it up!"
	sudo touch $KIOSK
	echo $'[Unit]
Description=Chromium Kiosk
#Wants=graphical.target
After=xserver.service

[Service]
#Environment=DISPLAY=:0
#Environment=XAUTHORITY=/home/pi/.Xauthority
Type=simple
ExecStart=/bin/bash /home/pi/kiosk.sh
Restart=on-abort
#User=pi
#Group=pi

[Install]
WantedBy=multi-user.target' >> $KIOSK
fi
sudo systemctl enable xserver.service
sudo apt-get install --no-install-recommends realvnc-vnc-server 
sudo raspi-config nonint do_vnc 0
sudo raspi-config nonint do_boot_behaviour B2
#Disable overscan
#sudo raspi-config nonint do_overscan 1
