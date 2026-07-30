"""
Tests for the NER service (`app/services/ner_service.py`).

The real spaCy model (`en_core_web_sm`) isn't installed in CI, so `spacy.load`
is patched with a fake pipeline. This keeps the extraction + persistence logic
under test without a multi-hundred-MB model download.
"""
import pytest

import app.services.ner_service as ner_module
from app.services.ner_service import NERService
from app.models.entity import Entity


class _FakeEnt:
    def __init__(self, text, label, start, end):
        self.text = text
        self.label_ = label
        self.start_char = start
        self.end_char = end


class _FakeDoc:
    def __init__(self, ents):
        self.ents = ents


class _FakeNLP:
    def __init__(self, ents):
        self._ents = ents

    def __call__(self, text):
        return _FakeDoc(self._ents)


@pytest.fixture
def ner(monkeypatch):
    ents = [_FakeEnt("OpenAI", "ORG", 0, 6), _FakeEnt("San Francisco", "GPE", 10, 23)]
    monkeypatch.setattr(ner_module.spacy, "load", lambda name: _FakeNLP(ents))
    return NERService()


class TestExtractEntities:
    def test_extracts_mapped_entities(self, ner):
        entities = ner.extract_entities("OpenAI in San Francisco")
        assert {e["entity_text"] for e in entities} == {"OpenAI", "San Francisco"}
        assert {e["entity_type"] for e in entities} == {"ORG", "GPE"}

    def test_empty_text_returns_empty(self, ner):
        assert ner.extract_entities("  ") == []


class TestPersistence:
    def test_extract_and_save_persists_entities(self, ner, test_db):
        created = ner.extract_and_save_entities(article_id=1, text="OpenAI in SF", db=test_db)
        assert len(created) == 2
        assert test_db.query(Entity).filter_by(article_id=1).count() == 2

    def test_process_missing_article_returns_empty(self, ner, test_db):
        assert ner.process_article(article_id=99999, db=test_db) == []


class TestStats:
    def test_entity_stats_empty(self, ner, test_db):
        stats = ner.get_entity_stats(test_db)
        assert stats["total_entities"] == 0
        assert stats["by_type"] == {}

    def test_trending_empty(self, ner, test_db):
        assert ner.get_trending_entities(test_db, time_window="24h") == []
