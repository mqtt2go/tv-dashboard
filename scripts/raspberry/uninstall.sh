#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")/../.." ; pwd -P )

#launcher="${parent_path}/launcherTV.sh"

#remove_cronjob () { 
#    echo "Removing TV Dashboard cronjob"
#    crontab -l > newcron
#    sed -e '/\@reboot.*launcherTV.sh.*$/d' newcron
#    crontab newcron
#   crontab -l | grep -i "@reboot sleep 30 && sh ${launcher}" | crontab -r
#   if [ $? -eq 0 ]
#      then
#         echo "Cronjob removed!"
#      else
#         echo "Failed to remove cronjob!"
#   fi
#    rm -f newcron
#}

apt purge lighttpd

rm -rf /var/www/html

#remove_cronjob

systemctl stop tvdashboard.service
systemctl disable tvdashboard.service

rm /etc/systemd/system/tvdashboard.service

#python3 ./../system/stop.py

rm -R "${parent_path}"  2>&1 > /dev/null

echo "Done."
