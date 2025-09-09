# Tesseract Caching Editor

A React-based frontend for editing cached API responses with real-time validation and testing capabilities.

## Quick Setup

### 1. Environment Configuration

Copy the environment template file and configure it:

```bash
# Copy the template file
cp frontend/.env_template frontend/.env

# Edit the .env file with your preferred settings
# The default configuration should work for most setups
```

Key environment variables:
- `VITE_PROXY_TARGET`: URL of the cacheflow backend (default: http://cacheflow:8000)

### 2. Starting the Container

```bash
# Build and start the container
docker compose up tesseract-caching-editor

# To rebuild the container from scratch
docker compose down tesseract-caching-editor
docker rmi tesseract-caching-editor
docker compose up tesseract-caching-editor
```

The frontend will be available at: http://localhost:3666

### 3. Connecting to Cacheflow

The application uses a proxy to connect to the cacheflow backend. The connection is configured through the `VITE_PROXY_TARGET` variable in the `.env` file.

To change the cacheflow backend URL:
1. Edit the `.env` file
2. Update the `VITE_PROXY_TARGET` value
3. Rebuild and restart the container

## Troubleshooting

### Common Issues

- **Permission denied errors**: Make sure the docker-entrypoint.sh file is executable (`chmod +x frontend/docker-entrypoint.sh`)
- **Connection errors**: Verify that the cacheflow backend is running and accessible
- **CORS issues**: The application uses a proxy to avoid CORS problems. Make sure the proxy is correctly configured

### Rebuilding from Scratch

If you encounter persistent issues, try rebuilding everything from scratch:

```bash
# Stop all containers
docker compose down

# Remove the images
docker rmi tesseract-caching-editor

# Rebuild and start
docker compose build --no-cache tesseract-caching-editor
docker compose up tesseract-caching-editor
```