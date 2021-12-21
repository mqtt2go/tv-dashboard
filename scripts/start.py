import requests
import time


def main():
    time.sleep(30)
    r = None
    try:
        r = requests.get('http://zeroconf:15051/a1/xploretv/v1/zeroconf')
    except requests.exceptions.ConnectionError:
        print('Server not available ...Exiting')
        exit(-1)
    if r.status_code == 200:
        payload = {'name': 'File Server',
                   'replaceWildcards': True,
                   'serviceProtocol': 'any',
                   'service': {
                       'type': '_http._tcp',
                       'port': 58000,
                       'txtRecord': {
                           'version': '1.0',
                           'provider': 'A1 Telekom Austria',
                           'product': 'TV-Dashboard File Server',
                           'path': 'http://tvdashboard:58000'
                            }
                        }
                   }
        # print(payload)
        r = requests.post('http://zeroconf:15051/a1/xploretv/v1/zeroconf', json=payload)
        # print(r.text)


if __name__ == '__main__':
    main()
