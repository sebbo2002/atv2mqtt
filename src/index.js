'use strict';

const mqtt = require('mqtt');
const AppleTV = require('node-appletv');

const keys = [
    'up',
    'down',
    'left',
    'right',
    'menu',
    'play',
    'pause',
    'next',
    'previous',
    'suspend',
    'select',
    'LongTv',
    'Tv'
];

/**
 * @author Sebastian Pekarek
 * @module @sebbo2002/atv2mqtt
 * @class ATV2MQTT
 */
class ATV2MQTT {
    constructor(options) {
        if (typeof options.broker !== 'string') {
            throw new Error('options.broker is not set!');
        }
        if (!Array.isArray(options.devices) || !options.devices.length) {
            throw new Error('options.devices is not set!');
        }
        if (options.devices.find(d => typeof d.topic !== 'string')) {
            throw new Error('options.devices.topic is not set!');
        }
        if (options.devices.find(d => typeof d.credentials !== 'string')) {
            throw new Error('options.devices.credentials is not set!');
        }

        this._options = options;
        this._teardown = [];

        this
            ._start()
            .catch(err => {
                this._log('error', null, 'Unable to start', err);
            });
    }

    _log(level, id, message, error) {
        if (this._options.log) {
            try {
                this._options.log.apply(this, [level, id, message, error]);
            } catch (err) {
                console.log('Unable to call custom log function:');
                console.log(err);
            }
        }
    }

    async _start() {
        this._mqtt = mqtt.connect(this._options.broker);
        this._mqtt.on('error', error => this._log('error', null, null, error));
        this._teardown.unshift(() => {
            this._mqtt.off('error');
            return new Promise(resolve => {
                this._mqtt.end(false, () => {
                    resolve();
                });
            });
        });

        await Promise.all(
            this._options.devices.map(
                device => this._startDevice(device)
            )
        );
    }

    async _startDevice(device) {
        const id = this._options.devices.indexOf(device) + 1;
        this._log('info', id, 'Search for device');

        const credentials = AppleTV.parseCredentials(device.credentials);
        const devices = await AppleTV.scan(credentials.uniqueIdentifier);
        this._log('info', id, `Found ${devices.length} devices`);
        if(!devices.length) {
            this._log('info', id, 'Device not found, try again in a bit…');
            await new Promise(cb => setTimeout(cb, 30000));
            return this._startDevice(device);
        }

        let shutdownPush;
        const appletv = await devices[0].openConnection(credentials);


        /* MQTT <--  PYATV */

        this._mqtt.publish(device.topic + '/name', appletv.name, {retain: true});
        this._mqtt.publish(device.topic + '/address', appletv.address, {retain: true});

        this._log('info', id, 'Open push connection');
        appletv.on('nowPlaying', info => this.transmitCurrentPlaying(id, device, info));

        appletv.on('error', error => {
            this._log('error', id, 'Error', error);
        });
        appletv.on('close', () => {
            this._log('info', id, 'Connection closed');
            if (!shutdownPush) {
                this._startDevice(device);
            }
        });

        this._teardown.unshift(() => {
            shutdownPush = true;
            appletv.closeConnection();
        });


        /* MQTT -->  PYATV */

        this._mqtt.subscribe(device.topic + '/+');
        this._teardown.unshift(() => {
            return new Promise(resolve => this._mqtt.unsubscribe(device.topic + '/+', resolve));
        });

        this._mqtt.on('message', topic => {
            const key = keys.find(key => device.topic + '/' + key === topic);
            if (key && AppleTV.AppleTV.key(key)) {
                appletv.sendKeyCommand(AppleTV.AppleTV.key(key)).catch(err => {
                    this._log('error', id, `Unable to press key "${key}"`, err);
                });
            }
        });
    }

    transmitCurrentPlaying (id, device, info) {
        [
            'duration',
            'elapsedTime',
            'title',
            'artist',
            'album',
            'appDisplayName',
            'appBundleIdentifier',
            'playbackState',
            'timestamp'
        ].forEach(attribute => {
            let value = '';
            if(info && typeof info[attribute] === 'string') {
                value = info[attribute];
            }
            else if(info && typeof info[attribute] === 'object') {
                value = JSON.stringify(info[attribute]);
            }

            this._mqtt.publish(device.topic + '/' + attribute, value, {retain: true});
        });
    }

    async stop() {
        await Promise.all(this._teardown);
    }
}


module.exports = ATV2MQTT;
