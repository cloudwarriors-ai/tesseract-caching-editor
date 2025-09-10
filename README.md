# Tesseract Caching Editor

A React-based frontend for editing cached API responses with real-time validation and testing capabilities.

## Architecture

The application consists of two main components:

1. **Frontend (caching-editor)**: React application with Vite dev server
2. **Production Proxy**: Node.js CORS proxy server for API requests

### Request Flow

```
User → Frontend (dev-caching-editor.pscx.ai) → Production Proxy → CacheFlow API
```

The production proxy bypasses CORS restrictions when the frontend makes API calls to the CacheFlow service.

## Quick Setup

### 1. Environment Configuration

The frontend uses environment variables to configure the proxy target:

```bash
# frontend/.env
VITE_PROXY_TARGET=http://cacheflow:8000
```

Key environment variables:
- `VITE_PROXY_TARGET`: URL of the cacheflow backend (default: http://cacheflow:8000)

### 2. Starting the Services

```bash
# Start both frontend and proxy
docker compose up -d

# To rebuild from scratch
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 3. Accessing the Application

- **Frontend**: https://dev-caching-editor.pscx.ai (via Traefik)
- **Production Proxy**: Internal service only (port 4011)

### 4. Production Proxy Configuration

The production proxy is configured to:
- Listen on port 4011 internally
- Forward requests to CacheFlow at `https://dev-cacheflow.pscx.ai`
- Handle CORS headers automatically
- Provide health check endpoint at `/health`

Environment variables for the proxy:
- `CACHEFLOW_URL`: Target CacheFlow service URL
- `PORT`: Proxy server port (default: 4011)

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