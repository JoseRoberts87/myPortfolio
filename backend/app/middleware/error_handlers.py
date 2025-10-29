"""
Error Handlers
Global exception handlers for FastAPI application
"""
import traceback
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.core.exceptions import BaseAPIException

logger = logging.getLogger(__name__)


async def custom_exception_handler(
    request: Request, exc: BaseAPIException
) -> JSONResponse:
    """
    Handler for custom API exceptions

    Args:
        request: FastAPI request object
        exc: Custom exception instance

    Returns:
        JSON response with error details
    """
    logger.error(
        f"Custom exception: {exc.message}",
        extra={
            "extra_data": {
                "path": request.url.path,
                "method": request.method,
                "status_code": exc.status_code,
                "details": exc.details,
            }
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "type": exc.__class__.__name__,
                "details": exc.details,
                "path": request.url.path,
            }
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handler for validation errors

    Args:
        request: FastAPI request object
        exc: Validation error exception

    Returns:
        JSON response with validation error details
    """
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })

    logger.warning(
        f"Validation error: {len(errors)} field(s)",
        extra={
            "extra_data": {
                "path": request.url.path,
                "method": request.method,
                "errors": errors,
            }
        },
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "message": "Validation error",
                "type": "ValidationError",
                "details": {"errors": errors},
                "path": request.url.path,
            }
        },
    )


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """
    Handler for HTTP exceptions

    Args:
        request: FastAPI request object
        exc: HTTP exception

    Returns:
        JSON response with error details
    """
    logger.warning(
        f"HTTP exception: {exc.status_code} - {exc.detail}",
        extra={
            "extra_data": {
                "path": request.url.path,
                "method": request.method,
                "status_code": exc.status_code,
            }
        },
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "type": "HTTPException",
                "details": {},
                "path": request.url.path,
            }
        },
    )


async def database_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """
    Handler for database exceptions

    Args:
        request: FastAPI request object
        exc: SQLAlchemy exception

    Returns:
        JSON response with error details
    """
    logger.error(
        f"Database error: {str(exc)}",
        extra={
            "extra_data": {
                "path": request.url.path,
                "method": request.method,
                "exception_type": exc.__class__.__name__,
            }
        },
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "Database error occurred",
                "type": "DatabaseError",
                "details": {
                    "hint": "Please try again later or contact support if the issue persists"
                },
                "path": request.url.path,
            }
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler for all unhandled exceptions

    Args:
        request: FastAPI request object
        exc: Exception instance

    Returns:
        JSON response with error details
    """
    # Get full traceback
    tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
    tb_str = "".join(tb)

    logger.critical(
        f"Unhandled exception: {str(exc)}",
        extra={
            "extra_data": {
                "path": request.url.path,
                "method": request.method,
                "exception_type": exc.__class__.__name__,
                "traceback": tb_str,
            }
        },
        exc_info=True,
    )

    # In production, don't expose internal error details
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "Internal server error",
                "type": "InternalError",
                "details": {
                    "hint": "An unexpected error occurred. Please try again later."
                },
                "path": request.url.path,
            }
        },
    )
