#!/bin/bash -e

which newman >/dev/null

if [ $? -ne 0 ] ; then
  echo 'Please run "npm install -g newman newman-reporter-html" to install newman cli first.'
  exit 1
fi

newman run onboard-prepare.json -e os-queens-environment.json -r cli,html --bail
