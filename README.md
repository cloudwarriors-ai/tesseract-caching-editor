# Tesseract Caching Editor Demo

A powerful React-based frontend for editing cached API responses with real-time validation and testing capabilities.

## 🚀 Quick Demo

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

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Python 3 (for serving frontend)

## 🏗️ Project Structure

```
tesseract-caching-editor/
├── frontend/              # React application
│   ├── src/              # Source code
│   ├── tests/            # Playwright tests
│   └── playwright.config.ts
├── openapi-spec.yaml     # OpenAPI specification
├── package.json          # Mock server dependencies
└── README.md            # This file
```

## 🎯 What the Demo Shows

### Core Features Demonstrated:

1. **Cache Browser Interface**
   - Real-time cache statistics (providers, entries, modifications)
   - Provider tree navigation (httpbin.org, api.zoom.us)
   - Cache entry selection and loading

2. **JSON Response Editing**
   - Monaco Editor integration
   - Real-time JSON validation
   - Syntax highlighting and formatting

3. **Preview & Validation**
   - Live response preview
   - JSON structure validation
   - Content length tracking

4. **Testing Workflow**
   - Test modifications against mock server
   - Error handling for invalid JSON
   - Save functionality with confirmation

5. **Error Handling**
   - Invalid JSON detection
   - Server connection errors
   - Save operation failures

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

The demo is working correctly when:
- Frontend loads at localhost:3000
- Mock server responds at localhost:4010
- All Playwright tests pass
- You can edit JSON responses
- Test/Save buttons work with the mock server
- Error messages appear for invalid JSON

## 📝 Notes

- The mock server uses Prism to simulate real API behavior
- The frontend is a self-contained React application
- Playwright tests provide comprehensive validation
- All data is simulated - no real APIs are called
- The demo showcases a production-ready cache editing interface

Enjoy exploring the Tesseract Caching Editor! 🚀