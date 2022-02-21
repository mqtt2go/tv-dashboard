sudo raspi-config nonint do_vnc 0
sudo raspi-config nonint do_boot_behaviour B1
sudo apt purge cec-utils xdotool xserver-xorg x11-xserver-utils xinit openbox chromium-browser realvnc-vnc-server
sudo rm /home/pi/xserver.sh /usr/lib/systemd/system/xserver.service
sudo rm /home/pi/control.sh /home/pi/cec.sh /usr/lib/systemd/system/cec.service
sudo rm /home/pi/kiosk.sh /usr/lib/systemd/system/kiosk.service