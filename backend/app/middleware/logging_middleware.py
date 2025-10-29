"""
Request/Response Logging Middleware
Logs all incoming requests and outgoing responses
"""
import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import logging

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests and responses"""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and log details

        Args:
            request: Incoming request
            call_next: Next middleware/endpoint

        Returns:
            Response from endpoint
        """
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Start timer
        start_time = time.time()

        # Get request details
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else ""

        # Log incoming request
        logger.info(
            f"Incoming request: {method} {path}",
            extra={
                "request_id": request_id,
                "endpoint": path,
                "extra_data": {
                    "method": method,
                    "path": path,
                    "query_params": query_params,
                    "client_host": client_host,
                    "user_agent": request.headers.get("user-agent", ""),
                }
            },
        )

        # Process request
        try:
            response = await call_next(request)

            # Calculate request duration
            duration = time.time() - start_time

            # Log response
            logger.info(
                f"Request completed: {method} {path} - {response.status_code} ({duration:.3f}s)",
                extra={
                    "request_id": request_id,
                    "endpoint": path,
                    "extra_data": {
                        "method": method,
                        "path": path,
                        "status_code": response.status_code,
                        "duration_seconds": round(duration, 3),
                    }
                },
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id

            return response

        except Exception as e:
            # Calculate request duration
            duration = time.time() - start_time

            # Log error
            logger.error(
                f"Request failed: {method} {path} ({duration:.3f}s)",
                extra={
                    "request_id": request_id,
                    "endpoint": path,
                    "extra_data": {
                        "method": method,
                        "path": path,
                        "duration_seconds": round(duration, 3),
                        "error": str(e),
                    }
                },
                exc_info=True,
            )

            # Re-raise exception to be handled by error handlers
            raise
