#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
service="${parent_path}/tvdashboard.service"


echo "Installing lighttpd..."
apt-get update
apt-get install lighttpd
echo "Done."

echo "Updating port..."

sed -i 's/server.port .*/server.port = 58000/g' '/etc/lighttpd/lighttpd.conf'

echo "Done."

echo "Copying files..."

rm -rf /var/www/html
mkdir /var/www/html

chmod -R 755 /var/www/html

cp -R ../../build/* /var/www/html
echo "Done."

echo "Creating service..."


if [ -e $service ]
then
   echo "Service already exists"
else
   touch "${service}"
   printf '[Unit]\nDescription=TV dashboard\nAfter=multi-user.target\n[Service]\nType=oneshot\nRemainAfterExit=true\nExecStart=%s/../system/start.sh\nExecStop=%s/../system/stop.sh\n[Install]\nWantedBy=multi-user.target' "${parent_path}" "${parent_path}" > "${service}"
   cp ${service} "/etc/systemd/system"
   systemctl enable tvdashboard.service
   echo "Service created"
fi


chmod 755 "${parent_path}/../system/start.sh"
chmod 755 "${parent_path}/../system/stop.sh"

service lighttpd reload
systemctl start tvdashboard.service


echo "Done."
