#!/usr/bin/env bash
cd javascript/ && npm install > /dev/null && cd ../
node javascript/src/cli/commits.js "$@"