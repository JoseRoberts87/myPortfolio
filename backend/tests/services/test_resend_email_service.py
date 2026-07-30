"""Tests for the Resend email service (`app/services/resend_email_service.py`)."""
import pytest

import app.services.resend_email_service as resend_module
from app.services.resend_email_service import ResendEmailService

ARGS = dict(
    name="Ada",
    email="ada@example.com",
    subject="Hello",
    message="A message body long enough.",
    message_id="abc-123",
)


class _FakeResponse:
    def __init__(self, status_code, text=""):
        self.status_code = status_code
        self.text = text


class _FakeClient:
    """Async context-manager stand-in for httpx.AsyncClient."""

    def __init__(self, response=None, error=None):
        self._response = response
        self._error = error

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def post(self, *args, **kwargs):
        if self._error:
            raise self._error
        return self._response


def _patch_client(monkeypatch, **kwargs):
    monkeypatch.setattr(
        resend_module.httpx,
        "AsyncClient",
        lambda *a, **k: _FakeClient(**kwargs),
    )


class TestSendContactNotification:
    @pytest.mark.asyncio
    async def test_success_returns_true(self, monkeypatch):
        _patch_client(monkeypatch, response=_FakeResponse(200))
        assert await ResendEmailService().send_contact_notification(**ARGS) is True

    @pytest.mark.asyncio
    async def test_non_200_returns_false(self, monkeypatch):
        _patch_client(monkeypatch, response=_FakeResponse(422, "invalid"))
        assert await ResendEmailService().send_contact_notification(**ARGS) is False

    @pytest.mark.asyncio
    async def test_exception_returns_false(self, monkeypatch):
        _patch_client(monkeypatch, error=RuntimeError("network down"))
        assert await ResendEmailService().send_contact_notification(**ARGS) is False
