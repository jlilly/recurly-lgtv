#!/bin/bash

# Start the dev server
ng serve &
trap 'kill $! && exit 0' EXIT

# Wait a bit for the build to stop spewing output on the console
sleep 15

# Check to see if we need to generate `webos/index.html` or the ipk file
(ls webos/index.html 1>/dev/null 2>&1 && ls webos/*.ipk 1>/dev/null 2>&1) || scripts/create-lgtv-files.js 

# Launch the app on the tv (has built in selector)
scripts/install-and-launch.js 

# Pretend the dev server is in the foreground
wait
