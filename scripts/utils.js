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


  if( !deviceList.length ) return noTvs();
  if( deviceList.length === 1 ) return Promise.resolve(deviceList[0]);
  return promptOnMultipleOptions({
    options: deviceList,
    question: 'Please select the target TV from the list above: '
  });
}

// Helper fn for when no tvs are found
function noTvs() {
  console.error('No LGTVs were found');
  console.error('Is dev mode enabled on the TV?');
  console.error('Is the TV connected to the same LAN as this computer?');
  console.error('Please try again');
  process.exit(1);
}

// Ask the user to specify which option to use
function promptOnMultipleOptions({ options, question }) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    options.forEach((option, index) => console.log(`${index + 1})\t${option}`));
    rl.question(question,
      selection => {
      const index = +selection; // force into number
      if (Number.isNaN(index) || index < 1 || index > options.length) {
          console.error(`Invalid selection: ${selection}`);
          console.error('Please re-run this script to try again');
          rl.close();
          reject();
      }

      rl.close();
      resolve(options[index - 1]);
    });
  });
}

module.exports = { getLGTV, promptOnMultipleOptions, webosRoot };