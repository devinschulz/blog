#!/usr/bin/env bash

rm -rf assets/dependencies
mkdir -p assets/dependencies

cp node_modules/instant.page/instantpage.js assets/dependencies/instantpage.js

echo "Dependencies copied!"
