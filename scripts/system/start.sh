#!/bin/bash

sleep 10

urlHostname="http://$(hostname):58000"


curl -XPOST -H 'Content-type: application/json' -d '{
   "name":"TV Dashboard",
   "replaceWildcards":true,
   "serviceProtocol":"any",
   "service":{
      "type":"_http._tcp",
      "port":58000,
      "txtRecord":{
         "version":"1.0",
         "provider":"A1 Telekom Austria",
         "product":"TV-Dashboard File Server",
         "path": "'"${urlHostname}"'"
      }
   }
}' 'https://zerodiscovery.duckdns.org:15051/a1/xploretv/v1/zeroconf'