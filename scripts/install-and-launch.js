#!/usr/bin/env node
'use strict'

// This script will package, install and launch on a webos enabled LGTV
// This is mostly to make `npm start` easy, but can be run after `ng serve`
//
//
// For more information:
// https://webostv.developer.lge.com/

const { execSync } = require('child_process');
const { sep } = require('path');
const { id: appid } = require('../webos/appinfo.json');
const { getLGTV, webosRoot } = require('./utils.js');

// Main logic flow
console.log('Installing and launching app on a LGTV');
getLGTV().then(installAndLaunch);

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
    console.error(`App not installed on ${device}`);
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
    console.error(`App not launched on ${device}`);
    process.exit(1);
  }
}

function installAndLaunch(device) {
  console.log(`Using device: ${device}`);
  installPackage(device);
  launchApp(device);
}
