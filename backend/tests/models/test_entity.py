"""Tests for the Entity model (`app/models/entity.py`)."""
from app.models.entity import Entity


def _entity(**overrides):
    data = dict(article_id=1, entity_text="OpenAI", entity_type="ORG")
    data.update(overrides)
    return Entity(**data)


class TestConstruction:
    def test_basic_fields(self):
        entity = _entity(start_char=0, end_char=6, confidence=0.98)
        assert entity.entity_text == "OpenAI"
        assert entity.entity_type == "ORG"
        assert entity.start_char == 0
        assert entity.confidence == 0.98

    def test_position_and_confidence_optional(self):
        entity = _entity()
        assert entity.start_char is None
        assert entity.end_char is None
        assert entity.confidence is None

    def test_repr(self):
        assert "Entity" in repr(_entity())
        assert "OpenAI" in repr(_entity())


class TestPersistence:
    def test_created_at_set_on_commit(self, test_db):
        entity = _entity()
        test_db.add(entity)
        test_db.commit()
        test_db.refresh(entity)
        assert entity.id is not None
        assert entity.created_at is not None
