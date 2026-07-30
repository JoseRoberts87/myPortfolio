"""
Tests for the keywords endpoints (`app/api/keywords.py`).

Covers DB-backed listing and validation / not-found paths. The service-backed
`/stats` and valid `/trending` responses depend on the keyword service and are
out of scope here.
"""


class TestListKeywords:
    def test_empty_list(self, client):
        response = client.get("/api/v1/keywords/")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["keywords"] == []

    def test_filter_params_accepted(self, client):
        response = client.get("/api/v1/keywords/?limit=10&offset=0&min_score=0.1")
        assert response.status_code == 200

    def test_invalid_limit_returns_422(self, client):
        response = client.get("/api/v1/keywords/?limit=0")
        assert response.status_code == 422


class TestTrendingValidation:
    def test_invalid_time_window_returns_422(self, client):
        # time_window is validated by a regex Query -> 422 on mismatch.
        response = client.get("/api/v1/keywords/trending?time_window=bogus")
        assert response.status_code == 422


class TestArticleKeywords:
    def test_get_keywords_missing_article_returns_404(self, client):
        response = client.get("/api/v1/keywords/article/99999")
        assert response.status_code == 404

    def test_process_missing_article_returns_404(self, client):
        response = client.post("/api/v1/keywords/process-article/99999")
        assert response.status_code == 404
