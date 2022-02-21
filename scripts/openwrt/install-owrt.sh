#!/bin/bash

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
#container="tvdashboard"

echo "Installing lighttpd..."
#lxc-attach -n "${container}" -- opkg update
#lxc-attach -n "${container}" -- opkg install lighttpd
#lxc-attach -n "${container}" -- pip3 install requests

opkg update
opkg install lighttpd
#pip3 install requests

echo "Done."

echo "Updating port..."

#lxc-attach -n "${container}" -- sed -i 's/server.port =.*/server.port = 58000/g' '/etc/lighttpd/conf.d/50-http.conf'
sed -i 's/server.port =.*/server.port = 58000/g' '/etc/lighttpd/conf.d/50-http.conf'

echo "Done."

echo "Copying files..."

#lxc-attach -n "${container}" -- chmod -R 755 /www
#lxc-attach -n "${container}" -- rm -rf /www/*

chmod -R 755 /www
rm -rf /www/*

#cp -R ../build/* /overlay/lxc/tvdashboard/rootfs/www

cp -R ../../build/* /www

#lxc-attach -n "${container}" -- /etc/init.d/lighttpd reload
#lxc-attach -n "${container}" -- /etc/init.d/lighttpd enable

/etc/init.d/lighttpd reload
/etc/init.d/lighttpd enable

echo "Done."

echo "Creating service..."

printf '#!/bin/sh /etc/rc.common\n\nUSE_PROCD=1\nSTART=95\nSTOP=01\n\nstart_service() {\n\tprocd_open_instance\n\tprocd_set_param command %s/../system/start.sh\n\tprocd_set_param stdout 1\n\tprocd_set_param stderr 1\n\tprocd_close_instance\n}\n\nstop_service() {\n\t%s/../system/stop.sh\n}' "${parent_path}" "${parent_path}" > "${parent_path}/dashboard"

#mv "${parent_path}/dashboard" "/overlay/lxc/${container}/rootfs/etc/init.d"
mv "${parent_path}/dashboard" "/etc/init.d/dashboard"

#chmod 755 "/overlay/lxc/${container}/rootfs/etc/init.d/dashboard"
chmod 755 "/etc/init.d/dashboard"

chmod 755 "${parent_path}/../system/start.sh"
chmod 755 "${parent_path}/../system/stop.sh"

/etc/init.d/dashboard enable
#/etc/init.d/dashboard start

#lxc-stop -n "${container}"
#lxc-start -n "${container}"

#sleep 10

#lxc-attach -n "${container}" -- /etc/init.d/dashboard enable
#lxc-attach -n "${container}" -- /etc/init.d/dashboard start

echo "Done. ...Rebooting"
reboot