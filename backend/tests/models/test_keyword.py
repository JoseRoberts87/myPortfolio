"""Tests for the Keyword model (`app/models/keyword.py`)."""
from app.models.keyword import Keyword


def _keyword(**overrides):
    data = dict(article_id=1, keyword="machine learning", score=0.8542)
    data.update(overrides)
    return Keyword(**data)


class TestConstruction:
    def test_basic_fields(self):
        kw = _keyword()
        assert kw.keyword == "machine learning"
        assert kw.score == 0.8542
        assert kw.article_id == 1

    def test_repr_formats_score(self):
        rep = repr(_keyword())
        assert "Keyword" in rep
        assert "machine learning" in rep
        assert "0.8542" in rep  # repr formats score to 4 decimals


class TestPersistence:
    def test_created_at_set_on_commit(self, test_db):
        kw = _keyword()
        test_db.add(kw)
        test_db.commit()
        test_db.refresh(kw)
        assert kw.id is not None
        assert kw.created_at is not None
