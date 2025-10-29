"""
Test Application Configuration
"""
import pytest
from app.core.config import settings


class TestSettings:
    """Tests for application settings"""

    def test_settings_exists(self):
        """Test that settings object exists"""
        assert settings is not None

    def test_project_name(self):
        """Test project name is set"""
        assert settings.PROJECT_NAME is not None
        assert isinstance(settings.PROJECT_NAME, str)
        assert len(settings.PROJECT_NAME) > 0

    def test_api_v1_prefix(self):
        """Test API v1 prefix"""
        assert settings.API_V1_PREFIX == "/api/v1"

    def test_debug_mode(self):
        """Test debug mode is boolean"""
        assert isinstance(settings.DEBUG, bool)

    def test_database_url(self):
        """Test database URL is configured"""
        assert settings.DATABASE_URL is not None
        assert isinstance(settings.DATABASE_URL, str)
        # Should be a valid postgres or sqlite URL
        assert any(db in settings.DATABASE_URL.lower() for db in ['postgres', 'sqlite'])

    def test_cors_origins(self):
        """Test CORS origins configuration"""
        assert settings.CORS_ORIGINS is not None
        assert isinstance(settings.CORS_ORIGINS, str)

    def test_cors_origins_list(self):
        """Test CORS origins list parsing"""
        origins_list = settings.cors_origins_list
        assert isinstance(origins_list, list)
        assert len(origins_list) > 0
        # Each origin should be a string
        assert all(isinstance(origin, str) for origin in origins_list)

    def test_reddit_client_id(self):
        """Test Reddit client ID exists"""
        assert settings.REDDIT_CLIENT_ID is not None
        assert isinstance(settings.REDDIT_CLIENT_ID, str)

    def test_reddit_client_secret(self):
        """Test Reddit client secret exists"""
        assert settings.REDDIT_CLIENT_SECRET is not None
        assert isinstance(settings.REDDIT_CLIENT_SECRET, str)

    def test_reddit_user_agent(self):
        """Test Reddit user agent"""
        assert settings.REDDIT_USER_AGENT is not None
        assert isinstance(settings.REDDIT_USER_AGENT, str)
        assert len(settings.REDDIT_USER_AGENT) > 0

    def test_reddit_subreddits(self):
        """Test Reddit subreddits configuration"""
        assert settings.REDDIT_SUBREDDITS is not None
        assert isinstance(settings.REDDIT_SUBREDDITS, str)

    def test_reddit_post_limit(self):
        """Test Reddit post limit"""
        assert settings.REDDIT_POST_LIMIT is not None
        assert isinstance(settings.REDDIT_POST_LIMIT, int)
        assert settings.REDDIT_POST_LIMIT > 0

    def test_pipeline_schedule_minutes(self):
        """Test pipeline schedule configuration"""
        assert settings.PIPELINE_SCHEDULE_MINUTES is not None
        assert isinstance(settings.PIPELINE_SCHEDULE_MINUTES, int)
        assert settings.PIPELINE_SCHEDULE_MINUTES > 0
