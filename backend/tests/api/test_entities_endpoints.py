"""
Tests for the entities endpoints (`app/api/entities.py`).

Covers the DB-backed listing and the validation / not-found paths. The
service-backed `/stats` and valid `/trending` responses depend on the spaCy
NER model and are out of scope here.
"""


class TestListEntities:
    def test_empty_list(self, client):
        response = client.get("/api/v1/entities/")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["entities"] == []

    def test_filter_params_accepted(self, client):
        response = client.get("/api/v1/entities/?entity_type=ORG&page=1&page_size=10")
        assert response.status_code == 200

    def test_invalid_page_size_returns_422(self, client):
        response = client.get("/api/v1/entities/?page_size=0")
        assert response.status_code == 422


class TestTrendingValidation:
    def test_invalid_time_window_returns_400(self, client):
        response = client.get("/api/v1/entities/trending?time_window=bogus")
        assert response.status_code == 400


class TestProcessArticle:
    def test_missing_article_returns_404(self, client):
        response = client.post("/api/v1/entities/process-article/99999")
        assert response.status_code == 404
