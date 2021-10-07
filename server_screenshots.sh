#!/bin/sh

set -e

yarn build
./node_modules/.bin/http-server build
