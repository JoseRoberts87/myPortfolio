"""
Test Simple API Endpoints (no database required)
"""
import pytest
from datetime import datetime


class TestHealthEndpoints:
    """Tests for health check and basic endpoints"""

    def test_root_endpoint(self, client):
        """Test the root endpoint returns correct data"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Portfolio Data Pipeline API"
        assert data["status"] == "online"
        assert "version" in data

    def test_health_check_endpoint(self, client):
        """Test the health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "portfolio-api"


class TestAPIStructure:
    """Tests for API structure and validation"""

    def test_invalid_sentiment_parameter(self, client):
        """Test that invalid sentiment returns validation error"""
        response = client.get("/api/v1/reddit/posts?sentiment=invalid")
        assert response.status_code == 422  # Validation error

    def test_api_v1_prefix(self, client):
        """Test that API uses v1 prefix"""
        # This will fail but we can check the error shows correct path
        response = client.get("/api/v1/reddit/posts")
        # Should either be 200 or 500, but not 404 (shows endpoint exists)
        assert response.status_code != 404
