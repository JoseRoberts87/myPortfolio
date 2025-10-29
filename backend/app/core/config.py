"""
Application Configuration
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # API Configuration
    PROJECT_NAME: str = "Portfolio Data Pipeline"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str

    # Reddit API
    REDDIT_CLIENT_ID: str
    REDDIT_CLIENT_SECRET: str
    REDDIT_USER_AGENT: str

    # CORS (comma-separated string that will be split)
    CORS_ORIGINS: str = "http://localhost:3000,https://portfolio-60sng8hin-joseroberts87s-projects.vercel.app"

    # Pipeline Configuration
    REDDIT_SUBREDDITS: str = "python,javascript,machinelearning,datascience"
    REDDIT_POST_LIMIT: int = 100
    PIPELINE_SCHEDULE_MINUTES: int = 60

    # Redis Cache Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    CACHE_ENABLED: bool = True
    CACHE_DEFAULT_TTL: int = 300  # 5 minutes
    CACHE_ANALYTICS_TTL: int = 600  # 10 minutes
    CACHE_STATS_TTL: int = 300  # 5 minutes
    CACHE_REDDIT_TTL: int = 180  # 3 minutes

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',')]


settings = Settings()
