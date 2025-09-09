#!/bin/sh
set -e

# Print debug information
echo "ENTRYPOINT: Environment variables:"
echo "VITE_PROXY_TARGET=${VITE_PROXY_TARGET}"

# Replace environment variables in the env-config.js file
echo "// This script injects environment variables into the window object
// It will be included in the HTML file

window.ENV_API_URL = '';
window.PROXY_TARGET = '${VITE_PROXY_TARGET}';
console.log('Environment variables loaded:', { PROXY_TARGET: window.PROXY_TARGET });" > /app/env-config.js

# Also create a debug file to verify the environment variables
echo "PROXY_TARGET=${VITE_PROXY_TARGET}" > /app/env-debug.txt

# Execute the command passed to the script
exec "$@"
