#!/usr/bin/env node
'use strict'

// This script will package, install and launch on a webos enabled LGTV
// This is mostly to make `npm start` easy, but can be run after `ng serve`
//
//
// For more information:
// https://webostv.developer.lge.com/

const { execSync } = require('child_process');
const readline = require('readline');
const { sep } = require('path');
const { id: appid } = require('../webos/appinfo.json');

// Check to see if webos cli is installed
const webosRoot = process.env.WEBOS_CLI_TV;
if ( !webosRoot ) {
  console.error('Error: $WEBOS_CLI_TV is undefined');
  console.error('This script requires webOS CLI to be installed');
  console.error('See: https://webostv.developer.lge.com/sdk/installation/');
  process.exit(1);
}

// Main logic flow here

const devices = getLGTVs();
if (devices.length > 1) promptOnMultipleDevices(devices);
else installAndLaunch(devices[0]);

// Get all the TVs on the network
function getLGTVs() {
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

  return deviceList;
}

// Ask the user to specify which device to use
function promptOnMultipleDevices(devices) {
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
        process.exit(1);
      }

      rl.close();
      installAndLaunch(devices[index - 1]);
    }
  )
}

// Install the ipk on the TV
function installPackage(device) {
  let webosPackage = [];
  try {
    webosPackage = execSync('ls webos/*.ipk', {encoding: 'utf8'})
                      .split('\n')
                      .filter(p => !!p);
  } catch(e) {
    // no-op, dealt with below
  }

  if( !webosPackage.length ) {
    console.error('Error: ipk file not found.');
    console.error('Run create-lgtv-files.js then re-run this script to continue');
    process.exit(1);
  }
  if( webosPackage.length > 1 ) {
    console.error('Error: Multiple ipk files found.');
    console.error('Remove or rename the old ones and re-run this script to continue');
    process.exit(1);
  }

  webosPackage = webosPackage[0];

  try {
    const output = execSync(`${webosRoot}${sep}ares-install -d ${device} ${webosPackage}`, { encoding: 'utf8' });
    console.log(output);
  } catch(e) {
    console.error(e.message);
    console.error('App not installed on TV');
    process.exit(1);
  }
}

// Launch the app on the TV
function launchApp(device) {
  try {
    const output = execSync(`${webosRoot}${sep}ares-launch -d ${device} ${appid}`, { encoding: 'utf8' });
    console.log(output);
  } catch(e) {
    console.error(e.message);
    console.error('App not launched on TV');
    process.exit(1);
  }
}

function installAndLaunch(device) {
  console.log(`Using device: ${device}`);
  installPackage(device);
  launchApp(device);
}

