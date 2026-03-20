# Integration Tests

This directory contains comprehensive integration tests for the CopilotTest framework.

## Overview

The integration tests validate end-to-end functionality with real execution:

- **Real browser automation** using Playwright MCP
- **Real API calls** using curl MCP
- **Real test execution** with actual MCP server integration
- **Report generation** validation

## Test Structure

```
tests/integration/
├── web-integration.test.ts      # Web browser automation tests
├── api-integration.test.ts      # API testing with HTTP requests
├── report-integration.test.ts   # Report generation validation
└── fixtures/
    ├── test-server.ts            # HTTP server for testing
    └── test-pages/               # HTML pages for web tests
        ├── index.html
        ├── login.html
        ├── dashboard.html
        └── form.html
```

## Running Integration Tests

Run all integration tests:
```bash
npm run test:integration
```

Run specific integration test suites:
```bash
npm run test:integration:web      # Web automation tests
npm run test:integration:api      # API tests
npm run test:integration:report   # Report generation tests
```

## What's Tested

### Web Integration Tests (`web-integration.test.ts`)
- Login flow with form interactions
- Form submission and validation
- Page navigation
- Real Playwright browser execution

### API Integration Tests (`api-integration.test.ts`)
- GET requests (list and retrieve users)
- POST requests (create users)
- DELETE requests (remove users)
- Error handling (404 responses)
- Real HTTP requests via curl MCP

### Report Integration Tests (`report-integration.test.ts`)
- End-to-end report generation
- HTML report structure validation
- Multi-platform test reporting
- Report file system validation
- Report metadata and statistics

## Test Server

The integration tests use a lightweight HTTP server (`test-server.ts`) that:

- Serves static HTML pages for web testing
- Provides REST API endpoints for API testing
- Defaults to port 8765 (overridable via TEST_SERVER_PORT environment variable)
- Starts/stops automatically with tests
- Includes in-memory data storage

## Test Fixtures

### HTML Pages
- **index.html**: Home page with navigation links
- **login.html**: Login form with validation
- **dashboard.html**: Protected page shown after login
- **form.html**: Contact form for testing input elements

### API Endpoints
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

## Requirements

The integration tests require:
- Node.js runtime
- `tsx` for TypeScript execution
- MCP servers (optional - tests handle absence gracefully)

## Test Output

Integration tests generate output in:
```
copilot-test-results/integration/
├── report.html          # Test execution report
└── screenshots/         # Screenshots on failure
```

## Notes

- Tests are designed to work with or without MCP servers available
- When MCP servers are unavailable, tests validate execution flow
- Each test suite cleans up after itself (stops test server)
- Tests use mock mode when Copilot SDK is not available
