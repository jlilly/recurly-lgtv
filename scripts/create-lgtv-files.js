#!/usr/bin/env node
'use strict'

// This script creates the index.html file neseccary to launch an app on
// an webos enabled LGTV for debugging purposes, then creates the .ipk
// needed to install on the LGTV.
//
// You will need to run this script if:
// 1: You haven't already run `npm start`
// 2: Your local IP changes
// 3: You wish to change the port of the ng dev server
//
// After this you can run `install-and-launch.js` to run the app on the tv
//
// For more information:
// https://webostv.developer.lge.com/

const { execSync } = require('child_process');
const fs = require('fs');
const { networkInterfaces } = require('os');
const readline = require('readline');
const { sep } = require('path');

const appName = 'LGTV hosted app';

// directory to write the index file, relative to working directory
const dir = 'webos';

// filename, shouldn't need to be changed
const filename = 'index.html';

// Port that dev server is running on
const port = 4200;

// Main logic

// Check to see if webos cli is installed
if ( !process.env.WEBOS_CLI_TV ) {
  console.error('Error: $WEBOS_CLI_TV is undefined');
  console.error('This script requires webOS CLI to be installed');
  console.error('See: https://webostv.developer.lge.com/sdk/installation/');
  process.exit(1);
}

const ipList = getIps();

if (ipList.length > 1) promptOnMultipleIps(ipList);
else if (ipList.length === 0) noIps();
else createFiles(ipList[0]);

// Functions

// Find all IPv4 addresses on all network interfaces
function getIps() {
  const ips = [];
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

// Ask the user to specify which ip to use
function promptOnMultipleIps(ips) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  ips.forEach((ip, index) => console.log(`${index + 1})\t${ip}`));
  rl.question('Please select your LAN IP address from the list above: ', selection => {
    const index = +selection; // force into number
    if (Number.isNaN(index) || index < 1 || index > ips.length) {
      console.error(`Invalid selection: ${selection}`);
      console.error('Please re-run this script to try again');
      rl.close();
      process.exit(1);
    }

    rl.close();
    createFiles(ips[index - 1]);
  });
}

// Helper fn for when no ips addrs were found
function noIps() {
  console.error('An IP address was not found');
  console.error('Please check your network and try again');
  console.error('index.html was not created');
  process.exit(1);
}

// Create the index.html file needed to point to the ng dev server
function createIndexFile(ip) {
  // NOTE: use encodeURIComponent if there are special chars in the url
  const url = `http://${ip}:${port}`;


  // This file is mostly generated by `ares-generate -t hosted_webapp`
  // but local ip of the dev machine needs to be injected
  const indexFile = `<!DOCTYPE html>
<html>
<head>
	<script>location.href='${url}';</script>
</head>
<body>
</body>
</html>
  `;

  console.log(`${appName} will point to ${url}`);
  console.log(`Writing ${process.cwd()}${sep}${dir}${sep}${filename}`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  try {
    fs.writeFileSync(`${dir}/${filename}`, indexFile, 'utf8');
  } catch (e) {
    console.error(e.message);
    console.error('index.html was not created');
    process.exit(1);
  }
  console.log('Success!');
}

function createPackage() {
  try {
    const output = execSync(`${process.env.WEBOS_CLI_TV}${sep}ares-package .`, {
      cwd: `${process.cwd()}${sep}webos`,
      encoding: 'utf8'
    });
    console.log(output);

  } catch (e) {
    console.error(e.message);
    console.error('webOS package was not created');
    process.exit(1);
  }
}

function createFiles(ip) {
  createIndexFile(ip);
  createPackage();
}
