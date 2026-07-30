"""Tests for the visit-tracking endpoints (`app/api/visits.py`)."""


class TestTrackVisit:
    def test_track_visit_returns_201(self, client):
        response = client.post(
            "/api/v1/visits/track",
            json={"page_url": "/about", "referrer": "https://google.com"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["visit_id"]

    def test_track_visit_persists(self, client, test_db):
        from app.models.visit import Visit

        client.post("/api/v1/visits/track", json={"page_url": "/web-dev"})
        assert test_db.query(Visit).filter_by(page_url="/web-dev").count() == 1

    def test_missing_page_url_returns_422(self, client):
        response = client.post("/api/v1/visits/track", json={"referrer": "x"})
        assert response.status_code == 422


class TestVisitStats:
    def test_stats_empty(self, client):
        response = client.get("/api/v1/visits/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_visits"] == 0
        assert data["top_referrers"] == []

    def test_stats_with_data(self, client):
        for page in ("/", "/", "/about"):
            client.post("/api/v1/visits/track", json={"page_url": page, "referrer": "https://x.com"})

        response = client.get("/api/v1/visits/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_visits"] == 3
        assert len(data["visits_by_page"]) >= 1
