#!/usr/bin/env sh
set -eu
npm install --workspace backend
npm --workspace backend run build
