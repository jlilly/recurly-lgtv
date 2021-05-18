# Recurly LGTV Bug Demo

A demo app for the credit card number bug in recurly.

## Prerequisites:

- 2016 or newer LG TV with webOS
- A network connection between this computer and the LG TV
- LG Developer site account
- webOS SDK CLI
- Angular CLI

### LG Specific setup:

Follow the steps at: https://webostv.developer.lge.com/develop/app-test/. Be sure to install the full sdk to get a version locked chromium for remote debugging.

## Development server

Run `npm start` for a dev server and to launch onto a LAN connected LGTV. Be patient and follow the prompts on screen to launch to your connected LGTV. The app will automatically reload if you change any of the source files.

## Debug

Run `npm run debug` to launch a remote debugger. Be patient and follow the on screen prompts.

_Note_: The debugger is dependant upon a node script on your computer. Killing or backgrounding the process will terminate the communication between the remote debugger and the TV.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.1.2.
