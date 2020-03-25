#!/usr/bin/env bash

rm -rf assets/dependencies
mkdir -p assets/dependencies

cp node_modules/swup/dist/swup.js assets/dependencies/swup.js
cp node_modules/@swup/preload-plugin/dist/SwupPreloadPlugin.js assets/dependencies/SwupPreloadPlugin.js
cp node_modules/@swup/head-plugin/dist/SwupHeadPlugin.js assets/dependencies/SwupHeadPlugin.js
cp node_modules/@swup/scroll-plugin/dist/SwupScrollPlugin.js assets/dependencies/SwupScrollPlugin.js

echo "Dependencies copied!"
