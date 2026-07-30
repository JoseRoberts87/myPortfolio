"""Tests for the Visit model (`app/models/visit.py`)."""
from app.models.visit import Visit


def _visit(**overrides):
    data = dict(visit_id="uuid-1", page_url="/about")
    data.update(overrides)
    return Visit(**data)


class TestConstruction:
    def test_basic_fields(self):
        visit = _visit(referrer="https://google.com")
        assert visit.visit_id == "uuid-1"
        assert visit.page_url == "/about"
        assert visit.referrer == "https://google.com"

    def test_optional_fields_default_none(self):
        visit = _visit()
        assert visit.referrer is None
        assert visit.ip_address is None
        assert visit.country is None

    def test_repr(self):
        assert "Visit" in repr(_visit())


class TestPersistence:
    def test_visited_at_set_on_commit(self, test_db):
        visit = _visit()
        test_db.add(visit)
        test_db.commit()
        test_db.refresh(visit)
        assert visit.id is not None
        assert visit.visited_at is not None
