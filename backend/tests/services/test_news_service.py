"""
Tests for the News API service (`app/services/news_service.py`).

The pure transform/parse helpers are exercised directly. The network `fetch`
path is not called (no HTTP is made in these tests).
"""
from datetime import datetime

from app.services.news_service import NewsAPIService


def _service():
    return NewsAPIService(api_key="test-key")


RAW_ARTICLE = {
    "source": {"id": "bbc-news", "name": "BBC News"},
    "author": "Jane Doe",
    "title": "Something happened",
    "description": "A short summary.",
    "content": "The full content of the article.",
    "url": "https://news.example.com/story",
    "urlToImage": "https://news.example.com/img.jpg",
    "publishedAt": "2026-01-15T10:30:00Z",
}


class TestTransform:
    def test_maps_to_unified_shape(self):
        [article] = _service().transform([RAW_ARTICLE])
        assert article["title"] == "Something happened"
        assert article["source_type"] == "news"
        assert article["source_name"] == "BBC News"
        assert article["author"] == "Jane Doe"
        assert isinstance(article["published_at"], datetime)
        assert article["source_metadata"]["has_image"] is True

    def test_falls_back_to_description_when_no_content(self):
        raw = {**RAW_ARTICLE, "content": None}
        [article] = _service().transform([raw])
        assert article["content"] == "A short summary."

    def test_skips_articles_that_error(self):
        # A non-dict raw entry is skipped rather than raising.
        result = _service().transform([RAW_ARTICLE, None])
        assert len(result) == 1


class TestParseDate:
    def test_parses_iso_z_suffix(self):
        parsed = _service()._parse_date("2026-01-15T10:30:00Z")
        assert parsed.year == 2026 and parsed.month == 1 and parsed.day == 15

    def test_none_defaults_to_now(self):
        assert isinstance(_service()._parse_date(None), datetime)

    def test_invalid_defaults_to_now(self):
        assert isinstance(_service()._parse_date("not-a-date"), datetime)


class TestGenerateId:
    def test_same_url_same_id(self):
        svc = _service()
        assert svc._generate_id(RAW_ARTICLE) == svc._generate_id(RAW_ARTICLE)

    def test_different_url_different_id(self):
        svc = _service()
        other = {**RAW_ARTICLE, "url": "https://news.example.com/other"}
        assert svc._generate_id(RAW_ARTICLE) != svc._generate_id(other)


class TestValidateInheritedFromBase:
    def test_transformed_article_is_valid(self):
        svc = _service()
        [article] = svc.transform([RAW_ARTICLE])
        assert svc.validate(article) is True
