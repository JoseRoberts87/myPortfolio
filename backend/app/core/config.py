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

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',')]


settings = Settings()
