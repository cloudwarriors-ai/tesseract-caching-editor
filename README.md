# Tesseract Caching Editor

A powerful React-based frontend for editing cached API responses with real-time validation and testing capabilities. Supports both mock development environments and production cacheflow integration.

## 🚀 Quick Start

### Mock Mode (Development/Testing)

```bash
# 1. Install dependencies
npm install

# 2. Start the mock server (Prism)
npm run mock-server

# 3. In another terminal, start the frontend
cd frontend && npm install && npm start

# 4. Run the automated demo
cd frontend && npx playwright test demo.spec.ts --project=chromium

# 5. View the test report
npx playwright show-report
```

### Production Mode (Real Cacheflow)

```bash
# 1. Ensure cacheflow backend is running on port 8000

# 2. Start production services
docker compose up -d

# 3. Access the frontend
# Frontend: http://localhost:3666
# API Proxy: http://localhost:4011

# 4. Run production tests
cd frontend && npx playwright test --project=chromium --base-url=http://localhost:3666
```

## 📋 Prerequisites

### For Mock Mode (Development/Testing)
- Node.js 16+
- npm or yarn
- Python 3 (for serving frontend)

### For Production Mode
- Docker and Docker Compose
- Cacheflow backend running on port 8000
- Node.js 16+ (for proxy server)
- Network access to cacheflow services

## 🏗️ Project Structure

```
tesseract-caching-editor/
├── frontend/                    # React application
│   ├── src/                    # Source code
│   ├── tests/                  # Playwright tests
│   ├── demo-screenshots/       # Test screenshots
│   └── playwright.config.ts    # Test configuration
├── memories/                   # Memory system for task tracking
├── docker-compose.yml          # Production Docker setup
├── docker-compose.mock.yaml    # Mock development setup
├── proxy-server.js             # Production API proxy
├── openapi-spec.yaml           # OpenAPI specification
├── package.json                # Mock server dependencies
├── package-proxy.json          # Production proxy dependencies
└── README.md                   # This file
```

## 🎯 Features & Capabilities

### Core Features (Works with both Mock and Production)

1. **Cache Browser Interface**
   - Real-time cache statistics (providers, entries, modifications)
   - Provider tree navigation (supports multiple API providers)
   - Cache entry selection and loading with metadata

2. **JSON Response Editing**
   - Monaco Editor integration with syntax highlighting
   - Real-time JSON validation and error detection
   - Auto-formatting and indentation

3. **Preview & Validation**
   - Live response preview with formatted JSON
   - Structure validation and content verification
   - Response size and metadata tracking

4. **Testing & Saving Workflow**
   - Test modifications against backend (mock or production)
   - Error handling for invalid JSON and server errors
   - Save functionality with user confirmation and audit trails

5. **Production Integration**
   - Seamless connection to cacheflow backend
   - Authentication and user context support
   - Real-time synchronization with production cache
   - Comprehensive error handling and logging

## 📖 Detailed Setup Instructions

### Step 1: Install Dependencies

```bash
# Root directory - install mock server dependencies
npm install

# Frontend directory - install React app dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start the Mock Server

The mock server uses Prism to simulate API responses based on the OpenAPI specification.

```bash
# Start Prism mock server on port 4010
npm run mock-server
```

**Important:** Keep this terminal running - the mock server must stay active for the demo to work.

### Step 3: Start the Frontend

```bash
# In a new terminal, start the React app
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000`

### Step 4: Run the Automated Demo

```bash
# Run Playwright tests (requires both servers running)
cd frontend
npx playwright test demo.spec.ts --project=chromium
```

### Step 5: View Test Results

```bash
# Open the interactive test report
npx playwright show-report
```

## 🎬 Demo Script Breakdown

The automated demo consists of 9 test scenarios:

1. **Application Overview** - Loads the main interface and verifies components
2. **Provider Tree Exploration** - Navigates through API providers and endpoints
3. **Cache Entry Selection** - Selects and loads a cache entry for editing
4. **JSON Response Editing** - Demonstrates editing capabilities with validation
5. **Testing Modifications** - Tests changes against the mock server
6. **Saving Changes** - Saves modifications to the cache
7. **Preview & Validation** - Shows preview functionality
8. **Complete Workflow** - End-to-end demonstration
9. **Error Handling** - Tests error scenarios and edge cases

## 🔧 Troubleshooting

### Common Issues:

**❌ Tests failing with "Connection Error"**
- Ensure the mock server is running (`npm run mock-server`)
- Check that port 4010 is available
- Verify the OpenAPI spec file exists

**❌ Frontend not loading**
- Ensure you're in the `frontend` directory when running `npm start`
- Check that port 3000 is available
- Try clearing node_modules and reinstalling

**❌ Playwright tests not running**
- Install Playwright browsers: `npx playwright install`
- Ensure both servers are running before starting tests
- Check that the frontend is accessible at localhost:3000

### Manual Testing:

If automated tests fail, you can manually test the application:

1. Open `http://localhost:3000` in your browser
2. Verify the cache browser loads with statistics
3. Click on providers to explore endpoints
4. Select an endpoint to load it in the editor
5. Try editing the JSON content
6. Use the Test and Save buttons to validate functionality

## 🛠️ Development Commands

```bash
# Mock server commands (root directory)
npm run mock-server          # Start Prism mock server
npm run mock-server-dynamic  # Start with dynamic responses
npm run validate-spec        # Validate OpenAPI specification

# Frontend commands (frontend directory)
npm start                    # Start development server
npm run build               # Build for production
npm test                    # Run unit tests
npm run e2e                 # Run end-to-end tests

# Playwright commands (frontend directory)
npx playwright test         # Run all tests
npx playwright test --ui    # Run tests with UI
npx playwright show-report  # View test report
```

## 📊 Test Results Summary

When working correctly, you should see:
- ✅ 9/9 tests passing
- ✅ Cache statistics: 3 providers, 13 entries, 1 modified
- ✅ Full JSON editing workflow
- ✅ Mock server integration
- ✅ Error handling validation

## 🎉 Success Indicators

### Mock Mode Success
The mock demo is working correctly when:
- Frontend loads at `http://localhost:3000`
- Mock server responds at `http://localhost:4010`
- All Playwright tests pass (9/9 tests)
- Cache shows static data (3 providers, 13 entries)
- You can edit JSON responses
- Test/Save buttons work with the mock server
- Error messages appear for invalid JSON

### Production Mode Success
The production integration is working correctly when:
- Frontend loads at `http://localhost:3666`
- Production proxy responds at `http://localhost:4011`
- Cacheflow backend accessible at `http://localhost:8000`
- Docker containers show healthy status
- Real production data loads (dynamic provider counts)
- Authentication works (if configured)
- Save operations persist to production cache
- Health checks pass for all services

## 🚀 Production Integration

The Tesseract Caching Editor is designed to work with both mock data (for development/testing) and real production cacheflow servers. This section explains how to integrate with your production cacheflow backend.

### Production vs Mock Mode

| Feature | Mock Mode | Production Mode |
|---------|-----------|-----------------|
| **Data Source** | Static OpenAPI examples | Real cached API responses |
| **Server** | Prism mock server (port 4010) | Cacheflow backend (port 8000) |
| **Proxy** | Not required | Node.js proxy server (port 4011) |
| **Authentication** | None required | May require API keys/tokens |
| **Data Volume** | Limited static examples | Full production cache data |
| **Persistence** | Changes lost on restart | Changes saved to production |

### 🐳 Production Docker Setup

For production deployment, use the provided Docker configuration:

```bash
# 1. Ensure cacheflow backend is running on port 8000
# (This should already be running in your environment)

# 2. Start production services
docker compose up -d

# 3. Access the frontend
# Frontend will be available at: http://localhost:3666
# Production proxy will be available at: http://localhost:4011
```

### 🔧 Production Configuration

#### Environment Variables

The production setup uses these environment variables:

```bash
# Cacheflow Backend URL (default: http://host.docker.internal:8000)
CACHEFLOW_URL=http://your-cacheflow-server:8000

# Proxy Server Port (default: 4011)
PORT=4011

# Frontend Port (default: 3666)
FRONTEND_PORT=3666
```

#### Docker Compose Configuration

The `docker-compose.yml` file includes:

```yaml
# Production proxy server
production-proxy:
  image: node:20-alpine
  ports:
    - "4011:4011"
  volumes:
    - ./proxy-server.js:/app/proxy-server.js
    - ./package-proxy.json:/app/package.json
  environment:
    - CACHEFLOW_URL=http://host.docker.internal:8000
    - PORT=4011

# Production frontend
tesseract-frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.demo
  ports:
    - "3666:80"
  depends_on:
    - production-proxy
```

### 🌐 API Endpoints

#### Production API Endpoints

The frontend connects to these production endpoints:

- **Cache Data**: `GET /admin/cache/organized`
  - Returns organized cache data by provider
  - Includes statistics and modification status

- **Entry Details**: `GET /admin/cache/entry?key={cache_key}`
  - Returns detailed entry information
  - Includes body, headers, metadata

- **Test Modifications**: `POST /admin/cache/test`
  - Tests modified responses against the cache
  - Validates JSON structure and content

- **Save Changes**: `PUT /admin/cache/entry`
  - Saves modifications to the production cache
  - Requires user authentication

#### Request/Response Examples

**Get Cache Data:**
```bash
curl http://localhost:4011/admin/cache/organized
```

**Response:**
```json
{
  "providers": [
    {
      "name": "api.zoom.us",
      "host": "api.zoom.us",
      "endpoints": [...],
      "stats": {
        "total_entries": 8,
        "modified_count": 0
      }
    }
  ],
  "total_providers": 3,
  "total_entries": 13,
  "modified_entries": 1
}
```

### 🔐 Authentication & Security

#### Production Authentication

When connecting to production cacheflow:

1. **API Keys**: Configure authentication headers in `proxy-server.js`
2. **User Context**: Include user identification for audit trails
3. **Permissions**: Ensure proper access controls are in place

#### Security Headers

The proxy server includes security headers:
- CORS enabled for frontend access
- Error handling for failed requests
- Request logging for debugging

### 📊 Production Monitoring

#### Health Checks

Both services include health endpoints:

```bash
# Frontend health
curl http://localhost:3666/health
# Returns: "healthy"

# Proxy health
curl http://localhost:4011/health
# Returns: {"status":"healthy","timestamp":"...","cacheflow_url":"..."}
```

#### Docker Health Checks

The Docker containers include automated health checks:
- Frontend: Checks nginx health endpoint
- Proxy: Checks proxy server health endpoint
- Both: 30-second intervals with 3 retries

### 🧪 Production Testing

#### Running Tests in Production

```bash
# Update Playwright configuration for production
cd frontend
npx playwright test --project=chromium --base-url=http://localhost:3666
```

#### Test Data Validation

Production tests validate:
- Real cache data loading
- Actual API provider connections
- Production authentication flows
- Error handling with real services

### 🚨 Troubleshooting Production Issues

#### Common Production Issues

**❌ "Connection refused" errors**
- Verify cacheflow backend is running on port 8000
- Check network connectivity between containers
- Validate `CACHEFLOW_URL` environment variable

**❌ Authentication failures**
- Ensure API keys are properly configured
- Check user permissions for cache operations
- Verify authentication headers in proxy server

**❌ Empty cache data**
- Confirm cacheflow has cached responses
- Check API provider configurations
- Validate cache storage connectivity

**❌ Save operations failing**
- Verify user authentication
- Check cache write permissions
- Validate JSON structure before saving

#### Debug Commands

```bash
# Check container logs
docker logs tesseract-frontend
docker logs tesseract-production-proxy

# Test API connectivity
curl http://localhost:4011/admin/cache/organized

# Check container health
docker ps
```

### 📈 Production Deployment Checklist

- [ ] Cacheflow backend running on port 8000
- [ ] Docker containers built and healthy
- [ ] Frontend accessible at configured port
- [ ] API endpoints responding correctly
- [ ] Authentication configured (if required)
- [ ] User permissions verified
- [ ] Health checks passing
- [ ] Test suite running successfully

### 🔄 Switching Between Modes

#### From Mock to Production

```bash
# 1. Stop mock services
docker compose -f docker-compose.mock.yaml down

# 2. Start production services
docker compose up -d

# 3. Update frontend URL to production port
# Frontend: http://localhost:3666 (instead of 3000)
```

#### From Production to Mock

```bash
# 1. Stop production services
docker compose down

# 2. Start mock services
docker compose -f docker-compose.mock.yaml up -d

# 3. Update frontend URL to mock port
# Frontend: http://localhost:3000 (instead of 3666)
```

### 🎯 Production Best Practices

1. **Monitor Health**: Regularly check container health and logs
2. **Backup Data**: Ensure cache data is properly backed up
3. **User Training**: Train users on production workflows
4. **Version Control**: Keep track of configuration changes
5. **Security**: Regularly update dependencies and security patches
6. **Performance**: Monitor response times and resource usage

## 📝 Notes

- **Mock Mode**: Uses Prism to simulate real API behavior with static data
- **Production Mode**: Connects to real cacheflow backend with live data
- **Frontend**: Self-contained React application with TypeScript
- **Testing**: Playwright provides comprehensive E2E validation for both modes
- **Docker**: Production-ready containerization with health checks
- **Security**: Includes authentication, CORS, and security headers
- **Monitoring**: Built-in health checks and logging for production monitoring

**Ready for both development testing and production deployment!** 🚀

Enjoy exploring the Tesseract Caching Editor! 🎉