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

#### Authenticate
Use node-appletv to connect to your Apple TV and authenticate [[?](https://github.com/evandcoleman/node-appletv#as-a-standalone-cli)]

#### Create Configuration File
Create a new atv2mqtt configuration file
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

#### Start atv2mqtt
```bash
atv2mqtt /home/eve/atv2mqtt.json
```

#### Subscribe to events
The module atv2mqtt creates several topics per configured Apple TV, which contain current information about the status.
It's best to watch this live with a MQTT client. To get the IP address with the sample configuration above, you would
subscribe to `/home/livingroom/appletv/address` for example.

#### Press keys
You can use atv2mqtt to simulate keystrokes via MQTT and send them to Apple TV. Simply order an MQTT message from the
configured topic prefix and the name of the key (content not relevant) and send it. Boom - virtual keystroke. Need an
example? Okay: `/home/livingroom/appletv/menu`. You'll find all keys [here](https://github.com/sebbo2002/atv2mqtt/blob/master/src/index.js#L6).



## Copyright and license

Copyright (c) Sebastian Pekarek under the [MIT license](LICENSE).
