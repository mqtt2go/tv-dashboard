#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")/../.." ; pwd -P )


apt purge lighttpd

rm -rf /var/www/html


systemctl stop tvdashboard.service
systemctl disable tvdashboard.service

rm /etc/systemd/system/tvdashboard.service

rm -R "${parent_path}"  2>&1 > /dev/null

echo "Done."
