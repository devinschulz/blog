#!/usr/bin/env bash

rm -rf themes/dev/assets/dependencies
mkdir -p themes/dev/assets/dependencies

cp node_modules/instant.page/instantpage.js themes/dev/assets/dependencies/instantpage.js

echo "Dependencies copied!"
