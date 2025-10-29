"""
Test Health Check Endpoints
"""
import pytest


def test_root_endpoint(client):
    """Test the root endpoint returns correct data"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Portfolio Data Pipeline API"
    assert data["status"] == "online"
    assert "version" in data


def test_health_check_endpoint(client):
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "portfolio-api"
