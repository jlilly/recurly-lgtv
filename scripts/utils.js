'use strict';

const { execSync } = require('child_process');
const readline = require('readline');
const { sep } = require('path');

const webosRoot = process.env.WEBOS_CLI_TV;

// Check to see if webos cli is installed
if ( !webosRoot ) {
  console.error('Error: $WEBOS_CLI_TV is undefined');
  console.error('This script requires webOS CLI to be installed');
  console.error('See: https://webostv.developer.lge.com/sdk/installation/');
  process.exit(1);
}

// Queries for all connected LGTVs,
// prompts the user if more than one is connected
// Returns selected (or only) LGTV
function getLGTV() {
  let deviceList = [];
  try {
    deviceList = execSync(`${webosRoot}${sep}ares-inspect -D`, { encoding: 'utf8' })
                  .split('\n')
                  .map(ln => ln.split(' ')[0])
                  .filter(name => !!name && !(name === 'name' || name.startsWith('-')));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  if( deviceList.length === 1 ) return Promise.resolve(deviceList[0])
  return promptOnMultipleDevices(deviceList);
}

// Ask the user to specify which device to use
function promptOnMultipleDevices(devices) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    devices.forEach((device, index) => console.log(`${index + 1})\t${device}`));
    rl.question('Please select the target TV from the list above: ',
      selection => {
      const index = +selection; // force into number
      if (Number.isNaN(index) || index < 1 || index > devices.length) {
          console.error(`Invalid selection: ${selection}`);
          console.error('Please re-run this script to try again');
          rl.close();
          reject();
      }

      rl.close();
      resolve(devices[index - 1]);
    })
  });
}

module.exports = { getLGTV, webosRoot };