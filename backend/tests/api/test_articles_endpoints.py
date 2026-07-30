"""Tests for the articles endpoints (`app/api/articles.py`)."""


class TestListArticles:
    def test_empty_list(self, client):
        response = client.get("/api/v1/articles/")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["articles"] == []
        assert data["page"] == 1

    def test_pagination_params_validated(self, client):
        # page_size max is 100
        response = client.get("/api/v1/articles/?page_size=1000")
        assert response.status_code == 422


class TestGetArticle:
    def test_missing_article_returns_404(self, client):
        response = client.get("/api/v1/articles/99999")
        assert response.status_code == 404


class TestSourceStats:
    def test_source_stats_empty(self, client):
        response = client.get("/api/v1/articles/stats/sources")
        assert response.status_code == 200
        data = response.json()
        assert data["total_articles"] == 0
        assert data["by_source_type"] == []


class TestSyncNews:
    def test_sync_without_api_key_returns_500(self, client):
        # NEWS_API_KEY is empty in the test env -> endpoint refuses to start.
        response = client.post("/api/v1/articles/sync/news")
        assert response.status_code == 500
        # The app formats HTTPException bodies via a custom handler; just assert
        # the reason surfaces somewhere in the response.
        assert "NEWS_API_KEY" in response.text
