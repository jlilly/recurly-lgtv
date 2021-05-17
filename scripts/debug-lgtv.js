#!/usr/bin/env node
'use strict';

// This script launches the debugger

const { execSync } = require('child_process');
const { sep } = require('path');
const { id: appid } = require('../webos/appinfo.json');
const { getLGTV, webosRoot } = require('./utils.js');

getLGTV().then(startDebugger).catch(() => process.exit(1));

function startDebugger(device) {
  console.log(`Starting debugger for ${device}`);
  console.log('NOTE: backgrounding this process will break the debugger comms link');
  execSync(`${webosRoot}${sep}ares-inspect ${appid} -d ${device} -o`, { encoding: `utf8` });
}