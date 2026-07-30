"""Regression tests for the hermetic-test guard (see conftest `_isolate_external_side_effects`).

These lock in the guarantee that running the suite can never send a real contact
email or hit the live News API, no matter what the developer's local `.env` sets.
"""
from unittest.mock import AsyncMock

CONTACT_PAYLOAD = {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "subject": "Project inquiry",
    "message": "I would love to talk about a data engineering project.",
}


def test_email_notifications_are_forced_off():
    from app.core.config import settings

    assert settings.CONTACT_EMAIL_ENABLED is False


def test_news_api_key_is_forced_empty():
    from app.core.config import settings

    assert settings.NEWS_API_KEY == ""


def test_contact_submission_never_sends_a_real_email(client, monkeypatch):
    """Posting the exact payload that once leaked real emails must not send one."""
    from app.services import email_service as gmail_mod
    from app.services import resend_email_service as resend_mod

    resend_spy = AsyncMock(return_value=True)
    gmail_spy = AsyncMock(return_value=True)
    monkeypatch.setattr(resend_mod.resend_email_service, "send_contact_notification", resend_spy)
    monkeypatch.setattr(gmail_mod.email_service, "send_contact_notification", gmail_spy)

    response = client.post("/api/v1/contact", json=CONTACT_PAYLOAD)

    assert response.status_code == 201
    # Email is disabled by the guard, so neither service is ever invoked.
    resend_spy.assert_not_awaited()
    gmail_spy.assert_not_awaited()
