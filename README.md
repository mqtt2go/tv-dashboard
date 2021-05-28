# A1 TV Dashboard

![TV Dashboard](leanback.png)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


# Service Discovery
When the TV Dashboard is launched, the application is automatically registered to Zeroconf/Avahi service discovery system. Conversely, when the application is closed, the service is unregistered. The service is registered as *TV Dashboard* on port *9* with the type *_http._tcp* (subtype *_mqtt2go._sub._http._tcp*).

## Service Registration format

```
 [POST] http://<server>:<port>/a1/xploretv/v1/zeroconf
```

```json {cmd=node .line-numbers}
{
   "name":"TV Dashboard",
   "replaceWildcards":true,
   "serviceProtocol":"any",
   "service":{
      "type":"_http._tcp",
      "subtype":"_mqtt2go._sub._http._tcp",
      "port":9,
      "txtRecord":{
         "version":"1.0",
         "provider":"A1 Telekom Austria Group",
         "product":"A1 Service Discovery"
      }
   }
}
```

## Service Deregistration

```
[POST/DELETE] http://<server>:<port>/a1/xploretv/v1/zeroconf/TV Dashboard
```

## Service Response

```
[GET] http://<server>:<port>/a1/xploretv/v1/zeroconf
```

```json
[
    {...},
    {
        "name":"TV Dashboard",
        "hostName":"raspberrypi.",
        "domainName":"raspberrypi.",
        "addresses":{
        "ipv4":[
            "127.0.0.1"
        ],
        "ipv6":[]
        },
        "service":{
            "type":"_mqtt2go._sub._http._tcp.local.",
            "port":9,
            "txtRecord":{
                "version":"1.0",
                "provider":"A1 Telekom Austria Group",
                "product":"A1 Service Discovery"
            }
        }
    },
    {...}
]
```