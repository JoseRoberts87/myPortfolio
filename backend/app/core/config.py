"""
Application Configuration
"""
from pydantic_settings import BaseSettings
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

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://portfolio-60sng8hin-joseroberts87s-projects.vercel.app"
    ]

    # Pipeline Configuration
    REDDIT_SUBREDDITS: str = "python,javascript,machinelearning,datascience"
    REDDIT_POST_LIMIT: int = 100
    PIPELINE_SCHEDULE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
