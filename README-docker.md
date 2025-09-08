# Tesseract Caching Editor - Docker Setup

## 🚀 Quick Start

The Tesseract Caching Editor is now fully containerized and ready to use!

### Prerequisites
- Docker and Docker Compose installed
- No need for Node.js, npm, or any other dependencies locally

### Running the Application

1. **Start all services:**
   ```bash
   docker compose up -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3001
   - Mock API Server: http://localhost:4010

3. **Stop the services:**
   ```bash
   docker compose down
   ```

## 📋 Services Overview

### Frontend Service (`tesseract-frontend`)
- **Container**: React-based cache editor interface
- **Port**: 3001 → 80 (nginx)
- **Features**: 
  - Complete cache browsing interface
  - JSON editing with real-time validation
  - Testing and saving modifications
  - Professional UI with Monaco-like editor

### Mock Server Service (`prism-mock-server`)
- **Container**: Prism mock server with OpenAPI spec
- **Port**: 4010
- **Features**:
  - All 5 Lab Proxy API endpoints
  - Dynamic response generation
  - CORS enabled for frontend access

## 🔧 Architecture

```
┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │  Mock Server    │
│  (React + nginx)│◄──►│  (Prism)        │
│  Port: 3001     │    │  Port: 4010     │
└─────────────────┘    └─────────────────┘
         │                      │
         └──────────────────────┘
            Docker Network
           (tesseract-network)
```

## 🛠 Development

### Rebuilding Containers
```bash
# Rebuild all containers
docker compose build

# Rebuild specific service
docker compose build tesseract-frontend
```

### Viewing Logs
```bash
# All services
docker compose logs

# Specific service
docker compose logs tesseract-frontend
docker compose logs prism-mock-server
```

### Container Status
```bash
docker compose ps
```

## 🎯 Available Endpoints

### Frontend
- `GET /` - Main application interface
- `GET /health` - Health check endpoint

### Mock Server API
- `GET /admin/cache/organized` - Get organized cache data
- `GET /admin/cache/entry` - Get specific cache entry
- `PUT /admin/cache/entry` - Modify cache entry  
- `GET /admin/cache/entry/original` - Get original cache entry
- `POST /admin/cache/entry/reset` - Reset cache entry
- `POST /admin/cache/test` - Test cache modifications

## ✅ Features Verified

- ✅ Complete React frontend with cache browser
- ✅ Real-time JSON editing and validation
- ✅ Provider tree navigation (httpbin.org, api.zoom.us)
- ✅ Entry selection and modification workflow
- ✅ Test and save functionality
- ✅ Professional UI with responsive design
- ✅ Full API integration with mock server
- ✅ Docker containerization with nginx
- ✅ Health checks and monitoring
- ✅ CORS configuration for API access

## 🚀 Production Ready

The application is now ready for production deployment with:
- Optimized nginx configuration
- Security headers
- Health checks
- Container networking
- Professional React interface
- Complete E2E testing suite

**Access your Tesseract Caching Editor at: http://localhost:3001**