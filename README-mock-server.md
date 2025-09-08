# Tesseract Caching Editor - Mock Server Setup

This directory contains a Prism mock server setup for developing and testing the Tesseract Caching Editor frontend without requiring the actual backend service.

## 🚀 Quick Start

### Option 1: Using Node.js (Local Development)

```bash
# Install Prism CLI
npm install

# Start the mock server
npm start

# Or start with dynamic examples and validation
npm run dev

# Mock server will be available at: http://localhost:4010
```

### Option 2: Using Docker Compose (Containerized)

```bash
# Start just the mock server
docker-compose -f docker-compose.mock.yaml up -d

# Start with proxy server for comparison testing
docker-compose -f docker-compose.mock.yaml --profile proxy up -d

# Mock server: http://localhost:4010
# Proxy server: http://localhost:4011 (validates requests against real backend)
```

## 📡 Available Endpoints

All endpoints from the Tesseract Caching Service Lab Proxy API are available:

- **GET** `/admin/cache/organized` - Get organized cache entries
- **GET** `/admin/cache/entry?key={cache_key}` - Get cache entry by key  
- **PUT** `/admin/cache/entry` - Modify cache entry
- **GET** `/admin/cache/entry/original?cache_key={cache_key}` - Get original cache entry
- **POST** `/admin/cache/entry/reset` - Reset cache entry to original
- **POST** `/admin/cache/test` - Test cache modifications

## 🧪 Testing the Mock Server

### Validate OpenAPI Specification

```bash
npm run validate-spec
```

### Test All Endpoints

```bash
# Test all endpoints at once
npm run test-endpoints

# Or test individual endpoints
npm run test-organized
npm run test-cache-entry
npm run test-modify
npm run test-reset
npm run test-test
```

### Manual Testing with curl

```bash
# Get organized cache view
curl -X GET "http://localhost:4010/admin/cache/organized" | jq .

# Get specific cache entry
curl -X GET "http://localhost:4010/admin/cache/entry?key=GET:/get:body:e3b0c44..." | jq .

# Modify cache entry
curl -X PUT "http://localhost:4010/admin/cache/entry" \
  -H "Content-Type: application/json" \
  -d '{
    "cache_key": "GET:/get:body:e3b0c44...",
    "modifications": {
      "status": 404,
      "body": {"error": "Test error"}
    },
    "user_id": "developer",
    "notes": "Testing frontend"
  }' | jq .

# Test modifications
curl -X POST "http://localhost:4010/admin/cache/test" \
  -H "Content-Type: application/json" \
  -d '{
    "cache_key": "GET:/get:body:e3b0c44...",
    "modifications": {
      "status": 500,
      "body": {"error": "Server error simulation"}
    }
  }' | jq .

# Reset entry
curl -X POST "http://localhost:4010/admin/cache/entry/reset" \
  -H "Content-Type: application/json" \
  -d '{
    "cache_key": "GET:/get:body:e3b0c44...",
    "user_id": "developer"
  }' | jq .
```

## 🎯 Frontend Integration

Update your frontend API configuration to use the mock server:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:4010'  // Mock server for development
    : 'http://cacheflow:8000', // Real backend for production
  ENDPOINTS: {
    ORGANIZED_CACHE: '/admin/cache/organized',
    CACHE_ENTRY: '/admin/cache/entry',
    CACHE_ENTRY_ORIGINAL: '/admin/cache/entry/original',
    CACHE_ENTRY_RESET: '/admin/cache/entry/reset',
    CACHE_TEST: '/admin/cache/test',
  },
  POLLING_INTERVAL: 5000,
};
```

## 🔧 Configuration Options

### Prism CLI Options

```bash
# Basic mock server
prism mock openapi-spec.yaml --host 0.0.0.0 --port 4010

# With dynamic examples (more realistic responses)
prism mock openapi-spec.yaml --host 0.0.0.0 --port 4010 --dynamic

# With request/response validation
prism mock openapi-spec.yaml --host 0.0.0.0 --port 4010 --validate-request --validate-response

# Proxy mode (validate against real backend)
prism proxy http://cacheflow:8000 openapi-spec.yaml --host 0.0.0.0 --port 4010
```

### Environment Variables

```bash
# Logging level
LOG_LEVEL=debug

# Enable CORS for frontend development
PRISM_CORS=true

# Add response delays for realistic testing
PRISM_DELAY_MIN=50
PRISM_DELAY_MAX=200
```

## 📊 Mock Server Features

### Dynamic Response Generation

The mock server generates realistic responses based on the OpenAPI specification:

- **Organized Cache Response**: 3 providers with 13 total entries
- **Cache Entries**: Realistic JSON responses with proper headers
- **Provider Stats**: Calculated statistics and timestamps
- **Error Responses**: Proper HTTP status codes and error messages

### Request Validation

All incoming requests are validated against the OpenAPI specification:
- Required parameters
- Request body schemas
- Content-Type headers
- Parameter types and formats

### Response Validation

All outgoing responses are validated to ensure they match the specification:
- Response schemas
- Status codes
- Content types
- Required fields

### CORS Support

CORS headers are automatically added for frontend development:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🐛 Debugging and Troubleshooting

### Enable Debug Logging

```bash
# Set log level to debug for detailed output
LOG_LEVEL=debug npm start
```

### Common Issues

1. **Port already in use**: Change port in package.json scripts or docker-compose.yaml
2. **CORS errors**: Ensure `--cors` flag is enabled
3. **Validation errors**: Check request format against OpenAPI spec
4. **Network issues**: Verify firewall settings and host binding

### Health Check

```bash
# Check if mock server is running
curl -f http://localhost:4010/admin/cache/organized

# Docker health check
docker-compose -f docker-compose.mock.yaml ps
```

## 🔄 Development Workflow

1. **Start Mock Server**: `npm run dev`
2. **Develop Frontend**: Point your React app to `http://localhost:4010`
3. **Test API Calls**: Use browser dev tools or Postman
4. **Validate Responses**: Mock server validates all responses automatically
5. **Switch to Real Backend**: Change API_CONFIG.BASE_URL when ready

## 📝 Notes

- Mock server generates consistent responses based on OpenAPI examples
- All timestamps use realistic Unix timestamp values  
- Cache keys follow the documented format: `{METHOD}:{PATH}:{KEY_SOURCE}:{HASH}`
- Provider names match the documented examples: httpbin.org, api.zoom.us, platform.ringcentral.com
- Response sizes and statistics are realistic for development testing

The mock server provides a complete development environment that matches the real API specification exactly.