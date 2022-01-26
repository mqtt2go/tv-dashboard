#!/bin/bash

sleep 10

curl -XPOST -H "Content-type: application/json" -d '{
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
         "path":"http://fileserver:58000"
      }
   }
}' 'http://zeroconf:15051/a1/xploretv/v1/zeroconf'