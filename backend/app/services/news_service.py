"""
News API Service - Fetches news articles from NewsAPI.org
Implements BaseDataSource interface for consistent multi-source pipeline
"""
import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.services.base_source import BaseDataSource, DataSourceConfig, SourceType, SourceAPIError, RateLimitError
from app.core.retry import api_retry, CircuitBreaker
import logging

logger = logging.getLogger(__name__)

# Circuit breaker for News API
news_api_circuit_breaker = CircuitBreaker(failure_threshold=3, timeout=300)


class NewsAPIService(BaseDataSource):
    """
    Service for fetching news articles from NewsAPI.org

    API Documentation: https://newsapi.org/docs
    Free tier: 100 requests/day, 1 request/second rate limit

    Supported endpoints:
    - /top-headlines: Breaking news and headlines
    - /everything: Search all articles
    """

    BASE_URL = "https://newsapi.org/v2"

    def __init__(self, api_key: str, **config_kwargs):
        """
        Initialize News API service

        Args:
            api_key: NewsAPI.org API key
            **config_kwargs: Additional configuration (rate_limit, timeout, etc.)
        """
        config = DataSourceConfig(
            source_type=SourceType.NEWS,
            api_key=api_key,
            **config_kwargs
        )
        super().__init__(config)
        self.api_key = api_key

    @api_retry
    async def fetch(
        self,
        query: Optional[str] = None,
        sources: Optional[str] = None,
        category: Optional[str] = None,
        language: str = 'en',
        page_size: int = 20,
        endpoint: str = 'top-headlines',
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        Fetch news articles from NewsAPI

        Args:
            query: Search keywords (e.g., "artificial intelligence", "climate change")
            sources: Comma-separated source IDs (e.g., "bbc-news,cnn")
            category: Category (business, entertainment, health, science, sports, technology)
            language: Language code (default: 'en')
            page_size: Number of articles to fetch (max 100)
            endpoint: API endpoint ('top-headlines' or 'everything')
            **kwargs: Additional parameters

        Returns:
            List of raw article data from NewsAPI

        Raises:
            SourceAPIError: If API request fails
            RateLimitError: If rate limit is exceeded
        """
        # Check circuit breaker
        if news_api_circuit_breaker.is_open():
            logger.error("News API circuit breaker is open, skipping fetch")
            raise SourceAPIError("News API circuit breaker is open")

        try:
            # Build API request
            url = f"{self.BASE_URL}/{endpoint}"
            params = {
                'apiKey': self.api_key,
                'language': language,
                'pageSize': min(page_size, 100),  # API max is 100
            }

            # Add optional parameters
            if query:
                params['q'] = query
            if sources:
                params['sources'] = sources
            if category and endpoint == 'top-headlines':
                params['category'] = category

            # Additional parameters from kwargs
            params.update(kwargs)

            self.logger.info(f"Fetching from News API: endpoint={endpoint}, query={query}, sources={sources}")

            # Make async HTTP request
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=self.config.timeout)
                ) as response:
                    # Check for rate limiting
                    if response.status == 429:
                        news_api_circuit_breaker.record_failure()
                        raise RateLimitError("News API rate limit exceeded")

                    # Check for API errors
                    if response.status != 200:
                        news_api_circuit_breaker.record_failure()
                        error_data = await response.json()
                        raise SourceAPIError(
                            f"News API error: {response.status} - {error_data.get('message', 'Unknown error')}"
                        )

                    data = await response.json()

                    # Check API response status
                    if data.get('status') != 'ok':
                        news_api_circuit_breaker.record_failure()
                        raise SourceAPIError(f"News API returned error: {data.get('message', 'Unknown error')}")

                    articles = data.get('articles', [])
                    total_results = data.get('totalResults', 0)

                    self.logger.info(f"Fetched {len(articles)} articles (total available: {total_results})")

                    # Record success
                    news_api_circuit_breaker.record_success()

                    return articles

        except aiohttp.ClientError as e:
            news_api_circuit_breaker.record_failure()
            self.logger.error(f"HTTP error fetching from News API: {str(e)}")
            raise SourceAPIError(f"HTTP error: {str(e)}")
        except asyncio.TimeoutError:
            news_api_circuit_breaker.record_failure()
            self.logger.error("Timeout fetching from News API")
            raise SourceAPIError("Request timeout")
        except Exception as e:
            news_api_circuit_breaker.record_failure()
            self.logger.error(f"Unexpected error fetching from News API: {str(e)}")
            raise

    def transform(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Transform News API articles to unified format

        Args:
            raw_data: Raw articles from NewsAPI

        Returns:
            List of articles in unified format
        """
        transformed = []

        for article in raw_data:
            try:
                # Generate unique ID from URL or title
                article_id = self._generate_id(article)

                # Parse published date
                published_at = self._parse_date(article.get('publishedAt'))

                # Extract source name
                source = article.get('source', {})
                source_name = source.get('name', 'Unknown')

                # Build transformed article
                transformed_article = {
                    'id': article_id,
                    'title': article.get('title', ''),
                    'content': article.get('content') or article.get('description'),
                    'summary': article.get('description'),
                    'url': article.get('url'),
                    'image_url': article.get('urlToImage'),
                    'author': article.get('author'),
                    'published_at': published_at,
                    'source_type': SourceType.NEWS.value,
                    'source_name': source_name,
                    'source_metadata': {
                        'source_id': source.get('id'),
                        'has_content': bool(article.get('content')),
                        'has_image': bool(article.get('urlToImage')),
                    }
                }

                transformed.append(transformed_article)

            except Exception as e:
                self.logger.warning(f"Error transforming article: {str(e)}")
                continue

        return transformed

    def _generate_id(self, article: Dict[str, Any]) -> str:
        """Generate unique ID for article"""
        url = article.get('url', '')
        if url:
            # Use hash of URL as ID
            return str(hash(url))
        # Fallback to hash of title + source
        title = article.get('title', '')
        source = article.get('source', {}).get('name', '')
        return str(hash(f"{title}_{source}"))

    def _parse_date(self, date_string: Optional[str]) -> datetime:
        """Parse ISO 8601 date string"""
        if not date_string:
            return datetime.utcnow()

        try:
            # NewsAPI returns ISO 8601 format: 2024-01-15T10:30:00Z
            return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        except Exception as e:
            self.logger.warning(f"Error parsing date '{date_string}': {str(e)}")
            return datetime.utcnow()

    async def fetch_top_headlines(
        self,
        category: Optional[str] = None,
        sources: Optional[str] = None,
        language: str = 'en',
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Convenience method to fetch top headlines

        Args:
            category: Category filter
            sources: Source IDs filter
            language: Language code
            page_size: Number of articles

        Returns:
            List of transformed articles
        """
        raw_data = await self.fetch(
            category=category,
            sources=sources,
            language=language,
            page_size=page_size,
            endpoint='top-headlines'
        )
        return self.transform(raw_data)

    async def search_articles(
        self,
        query: str,
        language: str = 'en',
        page_size: int = 20,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Convenience method to search all articles

        Args:
            query: Search query
            language: Language code
            page_size: Number of articles
            from_date: Start date (YYYY-MM-DD)
            to_date: End date (YYYY-MM-DD)

        Returns:
            List of transformed articles
        """
        kwargs = {}
        if from_date:
            kwargs['from'] = from_date
        if to_date:
            kwargs['to'] = to_date

        raw_data = await self.fetch(
            query=query,
            language=language,
            page_size=page_size,
            endpoint='everything',
            **kwargs
        )
        return self.transform(raw_data)
