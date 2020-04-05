#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const atv2mqtt = require('../src');

console.log('# atv2mqtt');
console.log('----------------------------');

const debug = process.argv.indexOf('--debug') > -1;
const configPath = path.resolve(process.cwd(), process.argv[process.argv.length - 1]);
if (!fs.existsSync(configPath)) {
    console.log('Usage: atv2mqtt [--debug] ~/atv2mqtt-config.json');
    process.exit(1);
}

let config;
try {
    config = require(configPath);
} catch (err) {
    console.log('Unable to parse configuration file:');
    console.log(err);
    process.exit(1);
}

try {
    if (debug) {
        Object.assign(config, {
            log: (level, id, message, error) => {
                let string = `[${level}]`;
                if (id) {
                    string += `[${id}]`;
                }
                string += ' ';
                if (message) {
                    string += message;
                }
                if (message && error) {
                    string += ': ';
                }
                if (error && error.stack) {
                    string += error.stack;
                }
                if (error) {
                    string += error.toString();
                }

                console.log(string);
            }
        });
    }

    new atv2mqtt(config);
} catch (err) {
    console.log('Unable to start atv2mqtt:');
    console.log(err);
}
