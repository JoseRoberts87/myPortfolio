"""Tests for the Article model (`app/models/article.py`)."""
from datetime import datetime

from app.models.article import Article
from app.models.entity import Entity
from app.models.keyword import Keyword


def _article(**overrides):
    data = dict(
        external_id="ext-1",
        source_type="news",
        source_name="BBC News",
        title="A headline",
        published_at=datetime(2026, 1, 15, 10, 30),
    )
    data.update(overrides)
    return Article(**data)


class TestConstruction:
    def test_basic_fields(self):
        article = _article(content="body", author="Jane")
        assert article.external_id == "ext-1"
        assert article.source_type == "news"
        assert article.title == "A headline"
        assert article.author == "Jane"

    def test_repr(self):
        assert "Article" in repr(_article())


class TestSourceDisplayName:
    def test_reddit_prefix(self):
        assert _article(source_type="reddit", source_name="technology").source_display_name == "r/technology"

    def test_twitter_prefix(self):
        assert _article(source_type="twitter", source_name="jack").source_display_name == "@jack"

    def test_other_source_unchanged(self):
        assert _article(source_type="news", source_name="BBC News").source_display_name == "BBC News"


class TestToDict:
    def test_serializes_key_fields(self):
        d = _article(content="body").to_dict()
        assert d["external_id"] == "ext-1"
        assert d["title"] == "A headline"
        assert d["published_at"] == "2026-01-15T10:30:00"


class TestPersistenceAndDefaults:
    def test_defaults_applied_on_commit(self, test_db):
        article = _article()
        test_db.add(article)
        test_db.commit()
        test_db.refresh(article)
        assert article.id is not None
        assert article.score == 0
        assert article.comment_count == 0
        assert article.language == "en"
        assert article.is_video is False
        assert article.retrieved_at is not None

    def test_json_fields_roundtrip(self, test_db):
        article = _article(tags=["ai", "ml"], source_metadata={"publisher": "BBC"})
        test_db.add(article)
        test_db.commit()
        test_db.refresh(article)
        assert article.tags == ["ai", "ml"]
        assert article.source_metadata["publisher"] == "BBC"


class TestRelationships:
    def test_entities_and_keywords_cascade_delete(self, test_db):
        article = _article()
        article.entities.append(Entity(entity_text="OpenAI", entity_type="ORG"))
        article.keywords.append(Keyword(keyword="ai", score=0.9))
        test_db.add(article)
        test_db.commit()

        assert test_db.query(Entity).count() == 1
        assert test_db.query(Keyword).count() == 1

        test_db.delete(article)
        test_db.commit()

        # cascade="all, delete-orphan" removes children with the parent.
        assert test_db.query(Entity).count() == 0
        assert test_db.query(Keyword).count() == 0
