#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
container="tvdashboard"

echo "Installing lighttpd..."
lxc-attach -n "${container}" -- opkg update
lxc-attach -n "${container}" -- opkg install lighttpd
lxc-attach -n "${container}" -- pip3 install requests
echo "Done."

echo "Updating port..."

lxc-attach -n "${container}" -- sed -i 's/server.port =.*/server.port = 58000/g' '/etc/lighttpd/conf.d/50-http.conf'

echo "Done."

echo "Copying files..."

lxc-attach -n "${container}" -- chmod -R 755 /www
lxc-attach -n "${container}" -- rm -rf /www/*

cp -R ../build/* /overlay/lxc/tvdashboard/rootfs/www

lxc-attach -n "${container}" -- /etc/init.d/lighttpd reload
lxc-attach -n "${container}" -- /etc/init.d/lighttpd enable

echo "Done."

echo "Creating service..."

printf '#!/bin/sh /etc/rc.common\n\nUSE_PROCD=1\nSTART=95\nSTOP=01\n\nstart_service() {\n\tprocd_open_instance\n\tprocd_set_param command python3 %s/start.py\n\tprocd_set_param stdout 1\n\tprocd_set_param stderr 1\n\tprocd_close_instance\n}\n\nstop_service() {\n\tpython3 %s/stop.py\n}' "${parent_path}" "${parent_path}" > "${parent_path}/dashboard"

mv "${parent_path}/dashboard" "/overlay/lxc/${container}/rootfs/etc/init.d"
chmod 755 "/overlay/lxc/${container}/rootfs/etc/init.d/dashboard"

lxc-stop -n "${container}"
lxc-start -n "${container}"

sleep 10

lxc-attach -n "${container}" -- /etc/init.d/dashboard enable
lxc-attach -n "${container}" -- /etc/init.d/dashboard start

echo "Done."
