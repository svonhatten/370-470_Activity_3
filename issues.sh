#!/usr/bin/env bash
npm --prefix javascript install > /dev/null
node javascript/src/cli/issues.js "$@"


