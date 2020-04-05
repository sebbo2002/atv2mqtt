# atv2mqtt

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

atv2mqtt allows you to remote control your Apple TV using the MQTT protocol. Many home automation systems support
this protocol, so Apple TV can be integrated into your existing automation system. In addition to
simulating key presses, you can also query the current state of Apple TV. This module uses a forked version of
[node-appletv](https://github.com/evandcoleman/node-appletv).


## ☁ Installation

To install the javascript module via npm run:

    sudo apt-get install autoconf libtool
	npm install -g @sebbo2002/atv2mqtt


## ⚒ Quick Start

1. Use node-appletv to connect to your Apple TV and authenticate [[?](https://github.com/evandcoleman/node-appletv#as-a-standalone-cli)]

2. Create a new atv2mqtt configuration file
```json
{
  "broker": "mqtt://192.168.1.1",
  "devices": [
    {
      "topic": "/home/livingroom/appletv",
      "credentials": "************************************"
    }
  ]
}
```

3. Start atv2mqtt
```bash
atv2mqtt /home/eve/atv2mqtt.json
```



## Copyright and license

Copyright (c) Sebastian Pekarek under the [MIT license](LICENSE).
