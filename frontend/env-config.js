// This script injects environment variables into the window object
// It will be included in the HTML file

window.ENV_API_URL = '';
window.PROXY_TARGET = 'http://cacheflow:8000';
console.log('Environment variables loaded:', { PROXY_TARGET: window.PROXY_TARGET });
