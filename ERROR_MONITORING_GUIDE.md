# Error Monitoring & Logging System

Comprehensive error monitoring and logging system for the Portfolio application with backend and frontend error handling, health monitoring, and structured logging.

## Table of Contents

- [Overview](#overview)
- [Backend Error Handling](#backend-error-handling)
- [Frontend Error Handling](#frontend-error-handling)
- [Health Monitoring](#health-monitoring)
- [Logging](#logging)
- [Usage Examples](#usage-examples)
- [Testing](#testing)

## Overview

The error monitoring system provides:

- **Backend**: Structured logging (JSON/colored), custom exception hierarchy, global error handlers
- **Frontend**: React Error Boundaries, client-side logging, graceful error recovery
- **Health Monitoring**: Comprehensive health checks for database, cache, and system metrics
- **Centralized Logging**: Request/response logging with correlation IDs

## Backend Error Handling

### Custom Exception Hierarchy

Located in `backend/app/core/exceptions.py`:

```python
# Base exception
BaseAPIException(message, status_code, details)

# Specific exceptions
ResourceNotFoundException(resource_type, resource_id)
ValidationException(message, field)
AuthenticationException(message)
AuthorizationException(message)
ExternalServiceException(service_name, message)
DatabaseException(message, operation)
CacheException(message)
RateLimitException(retry_after)
```

### Usage Examples

```python
from app.core.exceptions import (
    ResourceNotFoundException,
    ValidationException
)

# Raise exceptions
raise ResourceNotFoundException("Post", post_id)
raise ValidationException("Invalid email format", field="email")
```

### Global Error Handlers

All exceptions are handled by global error handlers in `backend/app/middleware/error_handlers.py`:

- **Custom exceptions** → Formatted JSON error response
- **Validation errors** → Detailed field validation errors
- **HTTP exceptions** → Standard HTTP error responses
- **Database errors** → Safe error messages (no sensitive data)
- **Unhandled exceptions** → Logged with full traceback, generic user message

### Request/Response Logging

The `RequestLoggingMiddleware` automatically logs all HTTP requests:

```
[INFO] Incoming request: GET /api/v1/reddit/posts
[INFO] Request completed: GET /api/v1/reddit/posts - 200 (0.123s)
```

Each request gets a unique UUID for correlation across logs.

## Frontend Error Handling

### Error Boundary Component

Located in `src/components/ErrorBoundary.tsx`:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Wrap any component
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Or use HOC
const SafeComponent = withErrorBoundary(YourComponent);
```

**Features:**
- Catches React rendering errors
- Displays user-friendly error UI
- Logs errors to console and server (production)
- Shows error details in development mode
- Provides "Try Again" and "Go Home" actions

### Next.js Error Pages

- `src/app/error.tsx` - Catches errors in route segments
- `src/app/global-error.tsx` - Catches errors in root layout

Both pages automatically log errors and provide recovery options.

### Client-Side Logger

Located in `src/lib/logger.ts`:

```typescript
import { logger } from '@/lib/logger';

// Log levels
logger.debug('Debug message', { data: value });
logger.info('Info message', { data: value });
logger.warn('Warning message', { data: value }, error);
logger.error('Error message', error, { data: value });

// Log with component context
logger.errorWithContext(
  'Error in component',
  error,
  'ComponentName',
  { additionalData: value }
);
```

**Features:**
- Console logging with timestamps
- Automatic server logging for errors in production
- Captures URL, user agent, and context
- Error stack trace included

## Health Monitoring

### Health Check Endpoints

Base URL: `/api/v1/health`

#### 1. Basic Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "portfolio-api"
}
```

#### 2. Detailed Health Check
```bash
GET /health/detailed
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T20:00:00.000Z",
  "uptime": {
    "uptime_seconds": 3600,
    "uptime_minutes": 60,
    "uptime_hours": 1,
    "uptime_days": 0.04,
    "started_at": "2025-10-29T19:00:00.000Z"
  },
  "components": {
    "database": {
      "status": "healthy",
      "connected": true,
      "response_time_ms": 3.5,
      "tables": 1
    },
    "cache": {
      "status": "healthy",
      "connected": true,
      "response_time_ms": 1.2,
      "used_memory_mb": 0.95,
      "connected_clients": 2,
      "total_keys": 5
    }
  },
  "system": {
    "cpu": {
      "usage_percent": 15.2,
      "count": 16
    },
    "memory": {
      "total_gb": 48.0,
      "used_gb": 16.5,
      "available_gb": 31.5,
      "usage_percent": 34.4
    },
    "disk": {
      "total_gb": 926.35,
      "used_gb": 12.31,
      "free_gb": 128.64,
      "usage_percent": 8.7
    }
  }
}
```

#### 3. Component-Specific Checks

```bash
GET /health/database  # Database connectivity
GET /health/cache     # Redis cache status
GET /health/metrics   # System metrics only
GET /health/uptime    # Application uptime
```

#### 4. Kubernetes Probes

```bash
GET /health/readiness  # Ready to serve traffic?
GET /health/liveness   # Is the application alive?
```

### Health Status Codes

- **200 OK** - Healthy
- **207 Multi-Status** - Degraded (some components unhealthy)
- **503 Service Unavailable** - Unhealthy

## Logging

### Logging Configuration

Located in `backend/app/core/logging_config.py`:

```python
# Configuration in app/core/config.py
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT = "colored"  # colored, json, simple
LOG_FILE = ""  # Path to log file
LOG_TO_FILE = False  # Enable file logging
```

### Log Formats

#### Colored Format (Development)
```
[INFO] 2025-10-29 12:00:00,000 - app.main - Application started
```

#### JSON Format (Production)
```json
{
  "timestamp": "2025-10-29T12:00:00.000Z",
  "level": "INFO",
  "logger": "app.main",
  "message": "Application started",
  "module": "main",
  "function": "startup",
  "line": 42
}
```

### Using the Logger

```python
from app.core.logging_config import get_logger

logger = get_logger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message", exc_info=True)
logger.critical("Critical error")

# With extra context
logger.info(
    "User action",
    extra={
        "request_id": "abc123",
        "user_id": 42,
        "extra_data": {"action": "login"}
    }
)
```

## Usage Examples

### Backend: Handling Errors

```python
from fastapi import APIRouter, HTTPException
from app.core.exceptions import ResourceNotFoundException

router = APIRouter()

@router.get("/posts/{post_id}")
async def get_post(post_id: str):
    post = await get_post_from_db(post_id)
    if not post:
        # This will be caught by error handlers
        raise ResourceNotFoundException("Post", post_id)
    return post
```

### Frontend: Error Boundary Usage

```tsx
// Wrap entire page
export default function Page() {
  return (
    <ErrorBoundary>
      <DataComponent />
    </ErrorBoundary>
  );
}

// Wrap specific components
<ErrorBoundary
  fallback={<CustomErrorUI />}
  onError={(error, errorInfo) => {
    // Custom error handling
    reportToAnalytics(error);
  }}
>
  <RiskyComponent />
</ErrorBoundary>
```

### Frontend: Manual Error Logging

```typescript
import { logger } from '@/lib/logger';

try {
  await fetchData();
} catch (error) {
  logger.error(
    'Failed to fetch data',
    error as Error,
    { endpoint: '/api/data' }
  );
  // Handle error...
}
```

## Testing

### Backend Testing

#### Test Error Responses
```bash
# Test 404 error
curl http://localhost:8000/api/v1/nonexistent

# Test validation error
curl -X POST http://localhost:8000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

#### Test Health Endpoints
```bash
# Basic health
curl http://localhost:8000/api/v1/health

# Detailed health
curl http://localhost:8000/api/v1/health/detailed

# Component checks
curl http://localhost:8000/api/v1/health/database
curl http://localhost:8000/api/v1/health/cache
```

### Frontend Testing

#### Manual Error Testing

Create a test component that throws an error:

```tsx
// src/app/test-error/page.tsx
'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';

export default function TestError() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test error!');
  }

  return (
    <div className="p-8">
      <h1>Error Testing</h1>
      <button
        onClick={() => setShouldError(true)}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Throw Error
      </button>
      <button
        onClick={() => logger.error('Manual test error', new Error('Test'))}
        className="px-4 py-2 bg-blue-600 text-white rounded ml-4"
      >
        Log Error
      </button>
    </div>
  );
}
```

### Monitoring Logs

#### Backend Logs
```bash
# Watch logs in development
cd backend
./venv/bin/python -m uvicorn app.main:app --reload --log-level debug

# Check logs
tail -f /path/to/log/file.log
```

#### Frontend Logs
- Open browser DevTools → Console tab
- Errors will be logged with full context
- In production, errors sent to server automatically

## Configuration

### Environment Variables

#### Backend (.env)
```bash
# Logging
LOG_LEVEL=INFO
LOG_FORMAT=colored  # colored, json, simple
LOG_FILE=/var/log/portfolio/app.log
LOG_TO_FILE=false

# Health Check
CACHE_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Frontend (.env.local)
```bash
# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:8000

# Error logging (future: remote logging endpoint)
NEXT_PUBLIC_ERROR_LOG_URL=/api/log
```

## Best Practices

### Backend

1. **Use specific exceptions** instead of generic ones
2. **Log all errors** with appropriate context
3. **Don't expose sensitive data** in error messages
4. **Use request IDs** for correlation across services
5. **Monitor health endpoints** regularly

### Frontend

1. **Wrap risky components** with ErrorBoundary
2. **Provide user-friendly error messages**
3. **Log errors with context** (component name, user action)
4. **Test error scenarios** during development
5. **Monitor error rates** in production

## Troubleshooting

### Backend Issues

**Problem**: Logs not appearing
- Check `LOG_LEVEL` configuration
- Verify logging is initialized in `main.py`
- Check file permissions if using `LOG_TO_FILE`

**Problem**: Health check failing
- Verify database connection
- Check Redis connectivity
- Review system resource limits

### Frontend Issues

**Problem**: Error Boundary not catching errors
- Ensure ErrorBoundary is a class component
- Check if error occurs in event handler (use try/catch)
- Verify component is wrapped with ErrorBoundary

**Problem**: Errors not logged to server
- Check `NODE_ENV` is set to `production`
- Verify API endpoint `/api/log` exists
- Check network requests in DevTools

## Architecture

```
├── Backend
│   ├── Logging System (app/core/logging_config.py)
│   ├── Exceptions (app/core/exceptions.py)
│   ├── Error Handlers (app/middleware/error_handlers.py)
│   ├── Logging Middleware (app/middleware/logging_middleware.py)
│   ├── Health Service (app/services/health_check.py)
│   └── Health API (app/api/health.py)
│
└── Frontend
    ├── Logger (src/lib/logger.ts)
    ├── Error Boundary (src/components/ErrorBoundary.tsx)
    ├── Global Error (src/app/error.tsx)
    ├── Root Error (src/app/global-error.tsx)
    └── Layout Integration (src/components/LayoutContent.tsx)
```

## Performance Considerations

- Logging is asynchronous where possible
- Error boundaries don't impact normal rendering performance
- Health checks use connection pooling
- Logs can be streamed to external services (e.g., CloudWatch, Datadog)

## Security

- Stack traces only shown in development mode
- No sensitive data in error messages
- Request IDs for secure log correlation
- Rate limiting on health check endpoints (recommended)

## Future Enhancements

- [ ] Remote error tracking (Sentry, Rollbar)
- [ ] Custom analytics integration
- [ ] Error trend analysis dashboard
- [ ] Automated alerting on error thresholds
- [ ] Performance metrics collection
- [ ] Distributed tracing integration

---

**Last Updated:** October 29, 2025
**Version:** 1.0.0
**Maintainer:** Portfolio Team
