"""Tests for the ContactMessage model (`app/models/contact_message.py`)."""
from app.models.contact_message import ContactMessage


def _message(**overrides):
    data = dict(
        message_id="uuid-1",
        name="Ada Lovelace",
        email="ada@example.com",
        subject="Hello",
        message="A message body.",
    )
    data.update(overrides)
    return ContactMessage(**data)


class TestConstruction:
    def test_basic_fields(self):
        msg = _message(company="Acme", phone="+1 555")
        assert msg.name == "Ada Lovelace"
        assert msg.email == "ada@example.com"
        assert msg.company == "Acme"

    def test_optional_fields_default_none(self):
        msg = _message()
        assert msg.company is None
        assert msg.phone is None

    def test_repr(self):
        assert "ContactMessage" in repr(_message())


class TestPersistenceAndDefaults:
    def test_status_defaults_on_commit(self, test_db):
        msg = _message()
        test_db.add(msg)
        test_db.commit()
        test_db.refresh(msg)
        assert msg.id is not None
        assert msg.status == "pending"
        assert msg.email_sent == "pending"
        assert msg.submitted_at is not None
        assert msg.read_at is None
