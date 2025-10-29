"""
Logging Configuration
Centralized logging setup with structured formatting
"""
import logging
import sys
from typing import Any
from pathlib import Path
import json
from datetime import datetime


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging
    """

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields if present
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data

        # Add request context if available
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "endpoint"):
            log_data["endpoint"] = record.endpoint

        return json.dumps(log_data)


class ColoredFormatter(logging.Formatter):
    """
    Colored formatter for console output
    """

    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
        'RESET': '\033[0m',      # Reset
    }

    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors"""
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']

        # Format: [LEVEL] timestamp - module.function:line - message
        log_fmt = f"{color}[{record.levelname}]{reset} {self.formatTime(record)} - {record.name} - {record.getMessage()}"

        if record.exc_info:
            log_fmt += f"\n{self.formatException(record.exc_info)}"

        return log_fmt


def setup_logging(
    log_level: str = "INFO",
    log_format: str = "colored",  # 'colored', 'json', or 'simple'
    log_file: str = None
) -> None:
    """
    Configure application logging

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Log format type ('colored', 'json', or 'simple')
        log_file: Optional file path for logging to file
    """
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))

    # Remove existing handlers
    root_logger.handlers = []

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))

    # Set formatter based on format type
    if log_format == "json":
        formatter = JSONFormatter()
    elif log_format == "colored":
        formatter = ColoredFormatter(
            fmt='%(asctime)s - %(name)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:  # simple
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # File handler (if log_file is specified)
    if log_file:
        # Create logs directory if it doesn't exist
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)  # Log everything to file
        file_handler.setFormatter(JSONFormatter())  # Always use JSON for files
        root_logger.addHandler(file_handler)

    # Suppress noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a module

    Args:
        name: Logger name (usually __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
