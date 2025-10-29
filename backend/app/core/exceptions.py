"""
Custom Exception Classes
Define custom exceptions for better error handling
"""
from typing import Any, Dict, Optional
from fastapi import status


class BaseAPIException(Exception):
    """Base exception for all API exceptions"""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ResourceNotFoundException(BaseAPIException):
    """Exception raised when a requested resource is not found"""

    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} with ID '{resource_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource_type": resource_type, "resource_id": resource_id},
        )


class ValidationException(BaseAPIException):
    """Exception raised for validation errors"""

    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else {}
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class AuthenticationException(BaseAPIException):
    """Exception raised for authentication failures"""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class AuthorizationException(BaseAPIException):
    """Exception raised for authorization failures"""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class ExternalServiceException(BaseAPIException):
    """Exception raised when external service fails"""

    def __init__(self, service_name: str, message: str):
        super().__init__(
            message=f"External service '{service_name}' error: {message}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details={"service": service_name},
        )


class DatabaseException(BaseAPIException):
    """Exception raised for database errors"""

    def __init__(self, message: str, operation: Optional[str] = None):
        details = {"operation": operation} if operation else {}
        super().__init__(
            message=f"Database error: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details,
        )


class CacheException(BaseAPIException):
    """Exception raised for cache errors"""

    def __init__(self, message: str):
        super().__init__(
            message=f"Cache error: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class RateLimitException(BaseAPIException):
    """Exception raised when rate limit is exceeded"""

    def __init__(self, retry_after: Optional[int] = None):
        details = {"retry_after": retry_after} if retry_after else {}
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details,
        )
