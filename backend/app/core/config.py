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

    # News API (NewsAPI.org)
    NEWS_API_KEY: str = ""  # Get from https://newsapi.org/

    # CORS (comma-separated string that will be split)
    # Exact allowed origins. The Vercel *production alias* is stable; per-deployment
    # preview URLs (which change every deploy) are matched by CORS_ORIGIN_REGEX below.
    CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "https://portfolio-joseroberts87s-projects.vercel.app,"
        "https://www.therpiproject.com,"
        "https://therpiproject.com"
    )
    # Regex for this Vercel project's preview deployments, so they don't have to be
    # listed one-by-one. Set to "" to disable.
    CORS_ORIGIN_REGEX: str = r"^https://portfolio-.*-joseroberts87s-projects\.vercel\.app$"

    # Pipeline Configuration
    REDDIT_SUBREDDITS: str = "python,javascript,machinelearning,datascience"
    REDDIT_SEARCH_QUERIES: str = "hasbro"  # Comma-separated search queries for Reddit
    REDDIT_POST_LIMIT: int = 100
    PIPELINE_SCHEDULE_MINUTES: int = 60

    # News Search Configuration
    NEWS_SEARCH_QUERIES: str = "hasbro"  # Comma-separated search queries for news

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

    # Logging Configuration
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    LOG_FORMAT: str = "colored"  # colored, json, simple
    LOG_FILE: str = ""  # Path to log file (empty = no file logging)
    LOG_TO_FILE: bool = False  # Enable file logging

    # Email Configuration
    EMAIL_SERVICE: str = "resend"  # Options: "gmail", "resend"
    CONTACT_EMAIL_ENABLED: bool = False  # Enable/disable email notifications

    # Gmail SMTP Configuration (if using EMAIL_SERVICE=gmail)
    GMAIL_USER: str = ""  # Your Gmail address
    GMAIL_APP_PASSWORD: str = ""  # Gmail App-Specific Password

    # Resend API Configuration (if using EMAIL_SERVICE=resend - recommended)
    RESEND_API_KEY: str = ""  # Get from https://resend.com/
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"  # Sender email
    RESEND_TO_EMAIL: str = ""  # Where to receive notifications

    # AI Assistant (RAG chat). The LLM provider (Ollama vs OpenAI) is configured
    # separately in app.core.llm; these are app-level guards for the endpoint.
    AI_CHAT_ENABLED: bool = True  # Master switch for the /ai/chat endpoint
    AI_MAX_QUESTION_CHARS: int = 500  # Reject longer questions (cost guard)
    AI_MAX_ANSWER_TOKENS: int = 1500  # Cap completion tokens; headroom for broad Qs + reasoning
    AI_RETRIEVAL_TOP_K: int = 4  # Knowledge chunks retrieved per query
    AI_RATE_LIMIT_PER_HOUR: int = 20  # Per-client requests per hour
    AI_RATE_LIMIT_GLOBAL_PER_HOUR: int = 200  # Site-wide backstop (bounds spoofed X-Forwarded-For)
    AI_AGENT_MAX_STEPS: int = 5  # Max tool-calling iterations for the agent demo
    AI_AGENT_SEARCH_TOP_K: int = 3  # Chunks the agent's search_portfolio tool returns
    AI_AGENT_MAX_TOKENS: int = 800  # Cap completion tokens per agent chat call (cost/latency)
    AI_GEN_MAX_TOKENS: int = 1000  # Cap completion tokens for the generator; reasoning headroom
    AI_GEN_TOP_K: int = 4  # Knowledge chunks grounding the generated content

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        # Ignore env vars owned by other settings classes (e.g. LLMSettings'
        # OLLAMA_*/EMBED_* keys). Without this, a var like OLLAMA_API_KEY in the
        # environment raises `extra_forbidden` — and leaks its value into the error.
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',')]


settings = Settings()
