import requests


def main():
    try:
        requests.delete('http://zeroconf:15051/a1/xploretv/v1/zeroconf/TV Dashboard')
    except requests.exceptions.ConnectionError:
        print('Server not available ...Exiting')
        exit(-1)


if __name__ == '__main__':
    main()
