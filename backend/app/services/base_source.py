"""
Base Data Source Abstraction Layer
Provides common interface for all data sources (Reddit, News, Twitter, etc.)
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class SourceType(str, Enum):
    """Enumeration of supported data sources"""
    REDDIT = "reddit"
    NEWS = "news"
    TWITTER = "twitter"
    FINANCIAL = "financial"
    WEATHER = "weather"
    GITHUB = "github"


class DataSourceConfig:
    """Configuration for a data source"""
    def __init__(
        self,
        source_type: SourceType,
        api_key: Optional[str] = None,
        rate_limit: int = 100,
        timeout: int = 30,
        **kwargs
    ):
        self.source_type = source_type
        self.api_key = api_key
        self.rate_limit = rate_limit
        self.timeout = timeout
        self.extra_config = kwargs


class BaseDataSource(ABC):
    """
    Abstract base class for all data sources

    All data sources must implement:
    - fetch(): Retrieve raw data from the source
    - transform(): Convert raw data to unified format
    - validate(): Check data quality and completeness
    """

    def __init__(self, config: DataSourceConfig):
        self.config = config
        self.source_type = config.source_type
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    async def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Fetch raw data from the source

        Args:
            **kwargs: Source-specific parameters (e.g., query, limit, time_filter)

        Returns:
            List of raw data items from the source

        Raises:
            SourceAPIError: If API request fails
            RateLimitError: If rate limit is exceeded
        """
        pass

    @abstractmethod
    def transform(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Transform raw data to unified format

        Args:
            raw_data: Raw data from the source

        Returns:
            List of data items in unified format with common fields:
            - id: Unique identifier
            - title: Headline/title
            - content: Main text content
            - url: Source URL
            - author: Creator/author name
            - published_at: Publication timestamp
            - source_type: Type of source (reddit, news, etc.)
            - source_name: Specific source name
            - metadata: Source-specific additional data
        """
        pass

    def validate(self, data: Dict[str, Any]) -> bool:
        """
        Validate a single data item

        Args:
            data: Transformed data item

        Returns:
            True if valid, False otherwise
        """
        required_fields = ['id', 'title', 'source_type', 'published_at']

        # Check required fields exist
        for field in required_fields:
            if field not in data or data[field] is None:
                self.logger.warning(f"Missing required field: {field}")
                return False

        # Check title is not empty
        if not data.get('title', '').strip():
            self.logger.warning("Title is empty")
            return False

        # Check published_at is valid datetime
        if not isinstance(data.get('published_at'), (datetime, str)):
            self.logger.warning("Invalid published_at type")
            return False

        return True

    async def fetch_and_transform(self, **kwargs) -> List[Dict[str, Any]]:
        """
        Convenience method to fetch and transform data in one call

        Args:
            **kwargs: Source-specific fetch parameters

        Returns:
            List of validated, transformed data items
        """
        try:
            # Fetch raw data
            self.logger.info(f"Fetching data from {self.source_type}")
            raw_data = await self.fetch(**kwargs)

            if not raw_data:
                self.logger.warning(f"No data fetched from {self.source_type}")
                return []

            # Transform to unified format
            self.logger.info(f"Transforming {len(raw_data)} items from {self.source_type}")
            transformed_data = self.transform(raw_data)

            # Validate and filter
            valid_data = [item for item in transformed_data if self.validate(item)]

            if len(valid_data) < len(transformed_data):
                self.logger.warning(
                    f"Filtered {len(transformed_data) - len(valid_data)} invalid items "
                    f"from {self.source_type}"
                )

            self.logger.info(f"Successfully processed {len(valid_data)} items from {self.source_type}")
            return valid_data

        except Exception as e:
            self.logger.error(f"Error processing data from {self.source_type}: {str(e)}")
            raise

    def get_metadata(self) -> Dict[str, Any]:
        """
        Get metadata about this data source

        Returns:
            Dictionary with source information
        """
        return {
            "source_type": self.source_type.value,
            "rate_limit": self.config.rate_limit,
            "timeout": self.config.timeout,
        }


class SourceAPIError(Exception):
    """Raised when API request to data source fails"""
    pass


class RateLimitError(Exception):
    """Raised when rate limit is exceeded"""
    pass
