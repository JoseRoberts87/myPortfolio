"""Tests for the keyword extraction service (`app/services/keyword_service.py`)."""
from app.services.keyword_service import KeywordService
from app.models.keyword import Keyword


class TestPreprocess:
    def test_lowercases_and_strips_urls(self):
        svc = KeywordService()
        cleaned = svc._preprocess_text("Visit https://example.com NOW! contact a@b.com")
        assert "http" not in cleaned
        assert "@" not in cleaned
        assert cleaned == cleaned.lower()

    def test_empty_input(self):
        assert KeywordService()._preprocess_text("") == ""


class TestExtractKeywords:
    def test_extracts_scored_keywords(self):
        svc = KeywordService(max_keywords=5)
        text = (
            "Machine learning models power modern data pipelines. "
            "Machine learning and data engineering drive analytics."
        )
        keywords = svc.extract_keywords_single(text)
        assert len(keywords) > 0
        for kw in keywords:
            assert "keyword" in kw and "score" in kw
            assert kw["score"] > 0
        # Respects the max_keywords cap.
        assert len(keywords) <= 5

    def test_empty_text_returns_empty(self):
        assert KeywordService().extract_keywords_single("   ") == []


class TestPersistence:
    def test_extract_and_save_persists_keywords(self, test_db):
        svc = KeywordService(max_keywords=5)
        text = "Kubernetes orchestrates containers for scalable cloud deployments."
        created = svc.extract_and_save_keywords(article_id=1, text=text, db=test_db)
        assert len(created) > 0
        assert test_db.query(Keyword).filter_by(article_id=1).count() == len(created)

    def test_process_missing_article_returns_empty(self, test_db):
        assert KeywordService().process_article(article_id=99999, db=test_db) == []


class TestStats:
    def test_stats_empty_database(self, test_db):
        stats = KeywordService().get_keyword_stats(test_db)
        assert stats["total_keywords"] == 0
        assert stats["top_keywords"] == []

    def test_trending_empty_database(self, test_db):
        assert KeywordService().get_trending_keywords(test_db, time_window="7d") == []
