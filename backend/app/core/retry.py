"""
Retry Logic and Error Handling
Provides decorators and utilities for handling retries with exponential backoff
"""
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    after_log
)
from typing import Callable, Type, Tuple
import logging

logger = logging.getLogger(__name__)


def create_retry_decorator(
    max_attempts: int = 3,
    min_wait: int = 4,
    max_wait: int = 60,
    exception_types: Tuple[Type[Exception], ...] = (Exception,)
) -> Callable:
    """
    Create a retry decorator with configurable parameters

    Args:
        max_attempts: Maximum number of retry attempts
        min_wait: Minimum wait time in seconds
        max_wait: Maximum wait time in seconds
        exception_types: Tuple of exception types to retry on

    Returns:
        Retry decorator

    Example:
        @create_retry_decorator(max_attempts=3, min_wait=2, max_wait=30)
        def my_function():
            # Function code that may fail
            pass
    """
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=min_wait, max=max_wait),
        retry=retry_if_exception_type(exception_types),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        after=after_log(logger, logging.INFO)
    )


# Pre-configured retry decorators for common scenarios

# Light retry - for quick operations (3 attempts, short wait)
light_retry = create_retry_decorator(
    max_attempts=3,
    min_wait=2,
    max_wait=10
)

# Standard retry - for normal operations (3 attempts, medium wait)
standard_retry = create_retry_decorator(
    max_attempts=3,
    min_wait=4,
    max_wait=60
)

# Aggressive retry - for critical operations (5 attempts, longer wait)
aggressive_retry = create_retry_decorator(
    max_attempts=5,
    min_wait=10,
    max_wait=120
)

# API retry - specifically for API calls with rate limiting
api_retry = create_retry_decorator(
    max_attempts=3,
    min_wait=5,
    max_wait=30,
    exception_types=(ConnectionError, TimeoutError)
)

# Database retry - for database operations
db_retry = create_retry_decorator(
    max_attempts=3,
    min_wait=2,
    max_wait=20,
    exception_types=(ConnectionError,)
)


class CircuitBreaker:
    """
    Simple circuit breaker implementation

    Usage:
        cb = CircuitBreaker(failure_threshold=3, timeout=60)

        if cb.is_open():
            raise Exception("Circuit breaker is open")

        try:
            # Attempt operation
            result = risky_operation()
            cb.record_success()
        except Exception as e:
            cb.record_failure()
            raise
    """

    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        """
        Initialize circuit breaker

        Args:
            failure_threshold: Number of failures before opening circuit
            timeout: Seconds to wait before attempting to close circuit
        """
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open

    def record_success(self):
        """Record a successful operation"""
        self.failure_count = 0
        self.state = "closed"
        logger.debug("Circuit breaker: Success recorded, state=closed")

    def record_failure(self):
        """Record a failed operation"""
        from datetime import datetime

        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()

        if self.failure_count >= self.failure_threshold:
            self.state = "open"
            logger.warning(
                f"Circuit breaker: Opened after {self.failure_count} failures"
            )
        else:
            logger.warning(
                f"Circuit breaker: Failure {self.failure_count}/{self.failure_threshold}"
            )

    def is_open(self) -> bool:
        """Check if circuit breaker is open"""
        from datetime import datetime, timedelta

        if self.state == "open":
            # Check if timeout has passed
            if self.last_failure_time:
                elapsed = (datetime.utcnow() - self.last_failure_time).total_seconds()
                if elapsed >= self.timeout:
                    self.state = "half-open"
                    logger.info("Circuit breaker: Moved to half-open state")
                    return False
            return True

        return False

    def get_status(self) -> dict:
        """Get current circuit breaker status"""
        return {
            "state": self.state,
            "failure_count": self.failure_count,
            "failure_threshold": self.failure_threshold,
            "last_failure_time": self.last_failure_time.isoformat() if self.last_failure_time else None
        }
